import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Bluetooth, BluetoothConnected, Wifi, Search } from 'lucide-react-native';
import { BluetoothDevice } from '@/types/obd2';
import { bluetoothService } from '@/services/bluetoothService';
import { useLanguage } from '@/hooks/useLanguage';

interface Props {
  onDeviceConnected: (device: BluetoothDevice) => void;
  connectedDevice: BluetoothDevice | null;
}

export default function BluetoothConnection({ onDeviceConnected, connectedDevice }: Props) {
  const { t } = useLanguage();
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [scanning, setScanning] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [hasScanned, setHasScanned] = useState(false);

  useEffect(() => {
    loadInitialDevices();
  }, []);

  const loadInitialDevices = async () => {
    try {
      const availableDevices = await bluetoothService.getAvailableDevices();
      setDevices(availableDevices);
      setHasScanned(bluetoothService.hasUserScanned());
    } catch (error) {
      console.error('Error loading initial devices:', error);
    }
  };

  const scanForDevices = async () => {
    setScanning(true);
    try {
      const availableDevices = await bluetoothService.scanForDevices();
      setDevices(availableDevices);
      setHasScanned(true);
    } catch (error) {
      console.error('Error scanning for devices:', error);
    } finally {
      setScanning(false);
    }
  };

  const connectToDevice = async (device: BluetoothDevice) => {
    setConnecting(device.id);
    try {
      const success = await bluetoothService.connectToDevice(device);
      if (success) {
        onDeviceConnected(device);
      }
    } catch (error) {
      console.error('Error connecting to device:', error);
    } finally {
      setConnecting(null);
    }
  };

  const disconnect = async () => {
    try {
      await bluetoothService.disconnect();
      onDeviceConnected(null as any);
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  const renderDevice = ({ item }: { item: BluetoothDevice }) => (
    <TouchableOpacity
      style={[
        styles.deviceItem,
        connectedDevice?.id === item.id && styles.connectedDevice
      ]}
      onPress={() => connectToDevice(item)}
      disabled={connecting === item.id}
    >
      <View style={styles.deviceInfo}>
        <Bluetooth size={24} color="#1e3a8a" strokeWidth={2} />
        <View style={styles.deviceText}>
          <Text style={styles.deviceName}>{item.name}</Text>
          <Text style={styles.deviceAddress}>{item.address}</Text>
        </View>
      </View>
      {connecting === item.id ? (
        <ActivityIndicator size="small" color="#f97316" />
      ) : connectedDevice?.id === item.id ? (
        <BluetoothConnected size={20} color="#22c55e" strokeWidth={2} />
      ) : (
        <Text style={styles.connectText}>Connect</Text>
      )}
    </TouchableOpacity>
  );

  if (connectedDevice) {
    return (
      <View style={styles.connectedContainer}>
        <View style={styles.connectedHeader}>
          <BluetoothConnected size={24} color="#22c55e" strokeWidth={2} />
          <Text style={styles.connectedTitle}>{t('connectedTo')} {connectedDevice.name}</Text>
        </View>
        <TouchableOpacity style={styles.disconnectButton} onPress={disconnect}>
          <Text style={styles.disconnectText}>{t('disconnect')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show empty state if in production mode and no devices found after scanning
  if (!bluetoothService.isTestMode() && hasScanned && devices.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Wifi size={24} color="#1e3a8a" strokeWidth={2} />
          <Text style={styles.title}>{t('availableOBD2Scanners')}</Text>
          <TouchableOpacity 
            style={styles.scanButton} 
            onPress={scanForDevices}
            disabled={scanning}
          >
            {scanning ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.scanButtonText}>{t('scan')}</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.emptyStateContainer}>
          <Search size={64} color="#9ca3af" strokeWidth={1} />
          <Text style={styles.emptyStateTitle}>{t('noOBD2DevicesFound')}</Text>
          <Text style={styles.emptyStateSubtitle}>
            {t('noOBD2DevicesMessage')}
          </Text>
          <TouchableOpacity style={styles.scanAgainButton} onPress={scanForDevices}>
            <Search size={16} color="#f97316" strokeWidth={2} />
            <Text style={styles.scanAgainButtonText}>{t('scanAgain')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Wifi size={24} color="#1e3a8a" strokeWidth={2} />
        <Text style={styles.title}>{t('availableOBD2Scanners')}</Text>
        <TouchableOpacity 
          style={styles.scanButton} 
          onPress={scanForDevices}
          disabled={scanning}
        >
          {scanning ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Search size={16} color="#ffffff" strokeWidth={2} />
              <Text style={styles.scanButtonText}>{t('scan')}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={devices}
        renderItem={renderDevice}
        keyExtractor={(item) => item.id}
        style={styles.deviceList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !hasScanned ? (
            <View style={styles.scanPromptContainer}>
              <Search size={48} color="#9ca3af" strokeWidth={1} />
              <Text style={styles.scanPromptTitle}>{t('tapScanToFindDevices')}</Text>
              <Text style={styles.scanPromptSubtitle}>
                {t('scanPromptMessage')}
              </Text>
            </View>
          ) : (
            <View style={styles.emptyStateContainer}>
              <Search size={64} color="#9ca3af" strokeWidth={1} />
              <Text style={styles.emptyStateTitle}>{t('noOBD2DevicesFound')}</Text>
              <Text style={styles.emptyStateSubtitle}>
                {t('noOBD2DevicesMessage')}
              </Text>
              <TouchableOpacity style={styles.scanAgainButton} onPress={scanForDevices}>
                <Search size={16} color="#f97316" strokeWidth={2} />
                <Text style={styles.scanAgainButtonText}>{t('scanAgain')}</Text>
              </TouchableOpacity>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    margin: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 12,
  },
  scanButton: {
    backgroundColor: '#1e3a8a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
  },
  scanButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  deviceList: {
    maxHeight: 300,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  connectedDevice: {
    backgroundColor: '#f0fdf4',
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deviceText: {
    marginLeft: 12,
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  deviceAddress: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  connectText: {
    color: '#f97316',
    fontSize: 14,
    fontWeight: '600',
  },
  connectedContainer: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    margin: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  connectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  connectedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#166534',
    marginLeft: 12,
  },
  disconnectButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  disconnectText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    minHeight: 200,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  scanAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f97316',
    backgroundColor: '#fff7ed',
  },
  scanAgainButtonText: {
    color: '#f97316',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  scanPromptContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    minHeight: 150,
  },
  scanPromptTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  scanPromptSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});