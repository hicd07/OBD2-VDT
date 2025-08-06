import { Platform } from 'react-native';
import RNBluetoothClassic from 'react-native-bluetooth-classic';
import { DTCCode, BluetoothDevice } from '@/types/obd2';
import { DTC_DESCRIPTIONS } from '@/constants/dtcCodes';
import { permissionService } from '@/services/permissionService';

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
  async getAvailableDevices(): Promise<BluetoothDevice[]> {
    // Check permissions before scanning
    const permissions = await permissionService.checkAllPermissions();
    if (!permissions.bluetooth && !this.testMode) {
      throw new Error('Bluetooth permission is required to scan for devices');
    }

    // In production mode, return empty array - no mock devices
    if (!this.testMode) {
      return [];
    }

    if (Platform.OS === 'web' || this.testMode) {
      // Mock devices for web testing
      return [
        { id: '1', name: 'ELM327 Scanner', address: '00:11:22:33:44:55', connected: false },
        { id: '2', name: 'OBD2 Pro', address: '11:22:33:44:55:66', connected: false },
        { id: '3', name: 'BlueDriver', address: '22:33:44:55:66:77', connected: false },
      ];
    }

    // Check if native module is available
    if (!RNBluetoothClassic) {
      throw new Error('Bluetooth functionality requires a custom development build. Please use test mode in Expo Go.');
    }

    try {
      // Get paired Bluetooth devices
      const pairedDevices = await RNBluetoothClassic.getBondedDevices();
      
      // Filter for OBD2 devices (typically contain "OBD", "ELM", or similar)
      const obd2Devices = pairedDevices
        .filter(device => 
          device.name?.toLowerCase().includes('obd') ||
          device.name?.toLowerCase().includes('elm') ||
          device.name?.toLowerCase().includes('scanner') ||
          device.name?.toLowerCase().includes('blue') ||
          device.name?.toLowerCase().includes('torque') ||
          device.name?.toLowerCase().includes('obdlink')
        )
        .map(device => ({
          id: device.id,
          name: device.name || 'Unknown Device',
          address: device.address,
          connected: false,
        }));

      return obd2Devices;
    } catch (error) {
      console.error('Error getting Bluetooth devices:', error);
      throw new Error('Bluetooth scanning failed. Please use test mode in Expo Go or create a development build.');
    }
  }

  async scanForDevices(): Promise<BluetoothDevice[]> {
    this.hasScanned = true;
    
    if (this.testMode) {
      return this.getAvailableDevices();
    }
    
    // In production mode, actually scan for real devices
    if (Platform.OS === 'web') {
      return [];
    }
    
    // Check if native module is available
    if (!RNBluetoothClassic) {
      throw new Error('Bluetooth functionality requires a custom development build. Please use test mode in Expo Go.');
    }
    
    try {
      // Get paired Bluetooth devices
      const pairedDevices = await RNBluetoothClassic.getBondedDevices();
      
      // Filter for OBD2 devices
      const obd2Devices = pairedDevices
        .filter(device => 
          device.name?.toLowerCase().includes('obd') ||
          device.name?.toLowerCase().includes('elm') ||
          device.name?.toLowerCase().includes('scanner') ||
          device.name?.toLowerCase().includes('blue') ||
          device.name?.toLowerCase().includes('torque') ||
          device.name?.toLowerCase().includes('obdlink')
        )
        .map(device => ({
          id: device.id,
          name: device.name || 'Unknown Device',
          address: device.address,
          connected: false,
        }));

      return obd2Devices;
    } catch (error) {
      console.error('Error scanning for Bluetooth devices:', error);
      return [];
    }
  }

  hasUserScanned(): boolean {
    return this.hasScanned;
  }

  async connectToDevice(device: BluetoothDevice): Promise<boolean> {
    // Check permissions before connecting
    const permissions = await permissionService.checkAllPermissions();
    if (!permissions.bluetooth && !this.testMode) {
      throw new Error('Bluetooth permission is required to connect to devices');
    }

    if (Platform.OS === 'web' || this.testMode) {
      // Mock connection for web
      await new Promise(resolve => setTimeout(resolve, 2000));
      this.connectedDevice = { ...device, connected: true };
      return true;
    }

    // Check if native module is available
    if (!RNBluetoothClassic) {
      throw new Error('Bluetooth functionality requires a custom development build. Please use test mode in Expo Go.');
    }

    try {
      // Connect to the Bluetooth device
      const connection = await RNBluetoothClassic.connectToDevice(device.address);
      
      if (connection) {
        this.connectedDevice = { ...device, connected: true };
        
        // Initialize OBD2 communication
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

    try {
      // Send initialization commands to OBD2 scanner
      await this.sendCommand('ATZ'); // Reset
      await this.sendCommand('ATE0'); // Echo off
      await this.sendCommand('ATL0'); // Linefeeds off
      await this.sendCommand('ATS0'); // Spaces off
      await this.sendCommand('ATH1'); // Headers on
      await this.sendCommand('ATSP0'); // Set protocol to auto
    } catch (error) {
      console.error('OBD2 initialization error:', error);
      throw new Error('Failed to initialize OBD2 communication');
    }
  }

  private async sendCommand(command: string): Promise<string> {
    if (this.testMode || Platform.OS === 'web' || !RNBluetoothClassic) {
      return 'OK'; // Mock response
    }

    if (!this.connectedDevice) {
      throw new Error('No device connected');
    }

    try {
      await RNBluetoothClassic.writeToDevice(this.connectedDevice.address, command + '\r');
      const response = await RNBluetoothClassic.readFromDevice(this.connectedDevice.address);
      return response;
    } catch (error) {
      console.error('Command send error:', error);
      throw new Error(`Failed to send command: ${command}`);
    }
  }
  getConnectedDevice(): BluetoothDevice | null {
    return this.connectedDevice;
  }

  async scanForDTCCodes(): Promise<DTCCode[]> {
    if (!this.connectedDevice) {
      throw new Error('No device connected');
    }

    this.isScanning = true;

    if (this.testMode || Platform.OS === 'web') {
      // Simulate scanning process
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock DTC codes that might be found
      const mockCodes = ['P0171', 'P0301', 'P0420', 'P0442'];
      const randomCodes = mockCodes.slice(0, Math.floor(Math.random() * 4) + 1);

      const dtcCodes: DTCCode[] = randomCodes.map(code => {
        const info = DTC_DESCRIPTIONS[code] || { description: 'Unknown code', severity: 'medium' as const };
        return {
          id: `${code}-${Date.now()}`,
          code,
          description: info.description,
          severity: info.severity,
          timestamp: new Date(),
        };
      });

      this.isScanning = false;
      return dtcCodes;
    }

    try {
      // Real OBD2 DTC scanning
      const response = await this.sendCommand('03'); // Request stored DTCs
      const dtcCodes = this.parseDTCResponse(response);
      
      this.isScanning = false;
      return dtcCodes;
    } catch (error) {
      this.isScanning = false;
      console.error('DTC scan error:', error);
      throw new Error('Failed to scan for DTC codes');
    }
  }

  private parseDTCResponse(response: string): DTCCode[] {
    // Parse real OBD2 DTC response
    const codes: DTCCode[] = [];
    
    // Remove whitespace and split by lines
    const lines = response.replace(/\s/g, '').split('\n');
    
    for (const line of lines) {
      if (line.length >= 4 && line !== 'NODATA') {
        // Parse hex codes and convert to DTC format
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

  async detectVehicleInfo(): Promise<{ brand: string; model: string; year: string } | null> {
    if (!this.connectedDevice) {
      throw new Error('No device connected');
    }

    if (this.testMode || Platform.OS === 'web') {
      // Simulate vehicle detection process
      await new Promise(resolve => setTimeout(resolve, 4000));

      // Mock vehicle detection results
      const mockVehicles = [
        { brand: 'Toyota', model: 'Camry', year: '2018' },
        { brand: 'Honda', model: 'Civic', year: '2020' },
        { brand: 'Ford', model: 'F-150', year: '2019' },
        { brand: 'BMW', model: 'X3', year: '2021' },
        { brand: 'Chevrolet', model: 'Malibu', year: '2017' },
      ];

      return mockVehicles[Math.floor(Math.random() * mockVehicles.length)];
    }

    try {
      // Real vehicle detection using VIN
      const vinResponse = await this.sendCommand('0902'); // Request VIN
      const vin = this.parseVINResponse(vinResponse);
      
      if (vin) {
        // In a real implementation, you would decode the VIN
        // For now, return null to indicate manual input is needed
        return null;
      }
      
      return null;
    } catch (error) {
      console.error('Vehicle detection error:', error);
      return null;
    }
  }

  private parseVINResponse(response: string): string | null {
    // Parse VIN from OBD2 response
    // This is a simplified implementation
    try {
      const cleanResponse = response.replace(/\s/g, '');
      if (cleanResponse.length >= 34) {
        // Extract VIN from response (simplified)
        return cleanResponse.substring(6, 23);
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}

export const bluetoothService = new BluetoothOBD2Service();