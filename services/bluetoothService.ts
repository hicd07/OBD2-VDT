import { Platform } from 'react-native';
import RNBluetoothClassic from 'react-native-bluetooth-classic';
import { DTCCode, BluetoothDevice } from '@/types/obd2';
import { DTC_DESCRIPTIONS } from '@/constants/dtcCodes';
import { permissionService } from '@/services/permissionService';

// Mock devices for testing
const MOCK_DEVICES: BluetoothDevice[] = [
  { id: '1', name: 'ELM327 Scanner', address: '00:11:22:33:44:55', connected: false },
  { id: '2', name: 'OBD2 Pro', address: '11:22:33:44:55:66', connected: false },
  { id: '3', name: 'BlueDriver', address: '22:33:44:55:66:77', connected: false },
];

// OBD2 device name patterns
const OBD2_DEVICE_PATTERNS = ['obd', 'elm', 'scanner', 'blue', 'torque', 'obdlink'];

// OBD2 initialization commands
const OBD2_INIT_COMMANDS = ['ATZ', 'ATE0', 'ATL0', 'ATS0', 'ATH1', 'ATSP0'];

class BluetoothOBD2Service {
  private connectedDevice: BluetoothDevice | null = null;
  private isScanning = false;
  private testMode = true; // Default to test mode for safety
  private hasScanned = false;

  setTestMode(enabled: boolean) {
    this.testMode = enabled;
    this.hasScanned = false; // Reset scan state when mode changes
  }

  isTestMode(): boolean {
    return this.testMode;
  }

  private async checkPermissions(): Promise<void> {
    if (this.testMode) return;
    
    const permissions = await permissionService.checkAllPermissions();
    if (!permissions.bluetooth) {
      throw new Error('Bluetooth permission is required');
    }
  }

  private isOBD2Device(deviceName: string): boolean {
    const name = deviceName.toLowerCase();
    return OBD2_DEVICE_PATTERNS.some(pattern => name.includes(pattern));
  }

  private async getPairedOBD2Devices(): Promise<BluetoothDevice[]> {
    if (!RNBluetoothClassic) {
      throw new Error('Bluetooth functionality requires a custom development build. Please use test mode in Expo Go.');
    }

    const pairedDevices = await RNBluetoothClassic.getBondedDevices();
    return pairedDevices
      .filter(device => device.name && this.isOBD2Device(device.name))
      .map(device => ({
        id: device.id,
        name: device.name || 'Unknown Device',
        address: device.address,
        connected: false,
      }));
  }

  async getAvailableDevices(): Promise<BluetoothDevice[]> {
    await this.checkPermissions();

    if (Platform.OS === 'web' || this.testMode) {
      return MOCK_DEVICES;
    }

    return this.getPairedOBD2Devices();
  }

  async scanForDevices(): Promise<BluetoothDevice[]> {
    this.hasScanned = true;
    return this.getAvailableDevices();
  }

  hasUserScanned(): boolean {
    return this.hasScanned;
  }

  async connectToDevice(device: BluetoothDevice): Promise<boolean> {
    await this.checkPermissions();

    if (Platform.OS === 'web' || this.testMode) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      this.connectedDevice = { ...device, connected: true };
      return true;
    }

    if (!RNBluetoothClassic) {
      throw new Error('Bluetooth functionality requires a custom development build. Please use test mode in Expo Go.');
    }

    try {
      const connection = await RNBluetoothClassic.connectToDevice(device.address);
      
      if (connection) {
        this.connectedDevice = { ...device, connected: true };
        await this.initializeOBD2();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Bluetooth connection error:', error);
      throw new Error('Bluetooth connection failed. Please use test mode in Expo Go or create a development build.');
    }
  }

  async disconnect(): Promise<void> {
    if (this.connectedDevice && !this.testMode && Platform.OS !== 'web' && RNBluetoothClassic) {
      try {
        await RNBluetoothClassic.disconnectFromDevice(this.connectedDevice.address);
      } catch (error) {
        console.error('Disconnect error:', error);
      }
    }
    this.connectedDevice = null;
  }

  private async initializeOBD2(): Promise<void> {
    if (this.testMode || Platform.OS === 'web') return;

    for (const command of OBD2_INIT_COMMANDS) {
      try {
        await this.sendCommand(command);
      } catch (error) {
        console.error(`OBD2 initialization error for command ${command}:`, error);
        throw new Error(`Failed to initialize OBD2 communication at command: ${command}`);
      }
    }
  }

  private async sendCommand(command: string): Promise<string> {
    if (this.testMode || Platform.OS === 'web' || !RNBluetoothClassic) {
      return 'OK';
    }

    if (!this.connectedDevice) {
      throw new Error('No device connected');
    }

    await RNBluetoothClassic.writeToDevice(this.connectedDevice.address, command + '\r');
    return await RNBluetoothClassic.readFromDevice(this.connectedDevice.address);
  }

  getConnectedDevice(): BluetoothDevice | null {
    return this.connectedDevice;
  }

  private generateMockDTCCodes(): DTCCode[] {
    const mockCodes = ['P0171', 'P0301', 'P0420', 'P0442'];
    const randomCodes = mockCodes.slice(0, Math.floor(Math.random() * 4) + 1);

    return randomCodes.map(code => {
      const info = DTC_DESCRIPTIONS[code] || { 
        description: 'Unknown code', 
        severity: 'medium' as const 
      };
      return {
        id: `${code}-${Date.now()}`,
        code,
        description: info.description,
        severity: info.severity,
        timestamp: new Date(),
      };
    });
  }

  async scanForDTCCodes(): Promise<DTCCode[]> {
    if (!this.connectedDevice) {
      throw new Error('No device connected');
    }

    this.isScanning = true;

    try {
      if (this.testMode || Platform.OS === 'web') {
        await new Promise(resolve => setTimeout(resolve, 3000));
        return this.generateMockDTCCodes();
      }

      const response = await this.sendCommand('03');
      return this.parseDTCResponse(response);
    } catch (error) {
      console.error('DTC scan error:', error);
      throw new Error('Failed to scan for DTC codes');
    } finally {
      this.isScanning = false;
    }
  }

  private parseDTCResponse(response: string): DTCCode[] {
    // Parse real OBD2 DTC response
    const codes: DTCCode[] = [];
    const lines = response.replace(/\s/g, '').split('\n');
    
    for (const line of lines) {
      if (line.length >= 4 && line !== 'NODATA') {
        for (let i = 0; i < line.length; i += 4) {
          const hexCode = line.substr(i, 4);
          if (hexCode.length === 4 && hexCode !== '0000') {
            const dtcCode = this.hexToDTC(hexCode);
            const info = DTC_DESCRIPTIONS[dtcCode] || { 
              description: 'Unknown diagnostic trouble code', 
              severity: 'medium' as const 
            };
            
            codes.push({
              id: `${dtcCode}-${Date.now()}-${i}`,
              code: dtcCode,
              description: info.description,
              severity: info.severity,
              timestamp: new Date(),
            });
          }
        }
      }
    }
    
    return codes;
  }

  private hexToDTC(hex: string): string {
    const firstChar = parseInt(hex[0], 16);
    const prefix = ['P', 'P', 'P', 'P', 'C', 'B', 'U', 'U'][firstChar >> 1];
    const secondChar = (firstChar & 1).toString();
    const remaining = hex.slice(1);
    
    return `${prefix}${secondChar}${remaining}`;
  }

  isCurrentlyScanning(): boolean {
    return this.isScanning;
  }

  private generateMockVehicleInfo() {
    const mockVehicles = [
      { brand: 'Toyota', model: 'Camry', year: '2018' },
      { brand: 'Honda', model: 'Civic', year: '2020' },
      { brand: 'Ford', model: 'F-150', year: '2019' },
      { brand: 'BMW', model: 'X3', year: '2021' },
      { brand: 'Chevrolet', model: 'Malibu', year: '2017' },
    ];
    return mockVehicles[Math.floor(Math.random() * mockVehicles.length)];
  }

  async detectVehicleInfo(): Promise<{ brand: string; model: string; year: string } | null> {
    if (!this.connectedDevice) {
      throw new Error('No device connected');
    }

    if (this.testMode || Platform.OS === 'web') {
      await new Promise(resolve => setTimeout(resolve, 4000));
      return this.generateMockVehicleInfo();
    }

    try {
      const vinResponse = await this.sendCommand('0902');
      const vin = this.parseVINResponse(vinResponse);
      return vin ? null : null; // Simplified - would decode VIN in real implementation
    } catch (error) {
      console.error('Vehicle detection error:', error);
      return null;
    }
  }

  private parseVINResponse(response: string): string | null {
    try {
      const cleanResponse = response.replace(/\s/g, '');
      return cleanResponse.length >= 34 ? cleanResponse.substring(6, 23) : null;
    } catch (error) {
      return null;
    }
  }
}

export const bluetoothService = new BluetoothOBD2Service();