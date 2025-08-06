import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { TestTube, Brain } from 'lucide-react-native';
import BluetoothConnection from '@/components/BluetoothConnection';
import VehicleInfo from '@/components/VehicleInfo';
import DTCScanner from '@/components/DTCScanner';
import DTCResults from '@/components/DTCResults';
import { BluetoothDevice, Vehicle, DTCCode, ScanSession } from '@/types/obd2';
import { StorageService, AppSettings } from '@/services/storageService';
import { bluetoothService } from '@/services/bluetoothService';
import { aiService } from '@/services/aiService';
import { useLanguage } from '@/hooks/useLanguage';

export default function ScannerTab() {
  const { t } = useLanguage();
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [dtcCodes, setDtcCodes] = useState<DTCCode[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    testMode: true,
    aiMode: false,
    geminiApiKey: '',
    language: 'en',
  });

  useEffect(() => {
    loadVehicleInfo();
    loadSettings();
  }, []);

  // Listen for settings changes and update local state
  useFocusEffect(
    React.useCallback(() => {
      const checkForSettingsChanges = async () => {
        const currentSettings = await StorageService.getSettings();
        if (currentSettings.testMode !== settings.testMode || 
            currentSettings.aiMode !== settings.aiMode ||
            currentSettings.geminiApiKey !== settings.geminiApiKey) {
          setSettings(currentSettings);
          bluetoothService.setTestMode(currentSettings.testMode);
          if (currentSettings.geminiApiKey) {
            aiService.setApiKey(currentSettings.geminiApiKey);
          }
        }
      };

      checkForSettingsChanges();
    }, [settings])
  );

  const loadVehicleInfo = async () => {
    const saved = await StorageService.getVehicleInfo();
    if (saved) {
      setVehicle(saved);
    }
  };

  const loadSettings = async () => {
    const savedSettings = await StorageService.getSettings();
    setSettings(savedSettings);
    bluetoothService.setTestMode(savedSettings.testMode);
    if (savedSettings.geminiApiKey) {
      aiService.setApiKey(savedSettings.geminiApiKey);
    }
  };

  const updateTestMode = async (enabled: boolean) => {
    const newSettings = { ...settings, testMode: enabled };
    setSettings(newSettings);
    await StorageService.saveSettings(newSettings);
    bluetoothService.setTestMode(enabled);
    
    // Disconnect if switching modes
    if (connectedDevice) {
      setConnectedDevice(null);
    }
  };

  const updateAIMode = async (enabled: boolean) => {
    const newSettings = { ...settings, aiMode: enabled };
    setSettings(newSettings);
    await StorageService.saveSettings(newSettings);
  };

  const handleScanComplete = async (codes: DTCCode[]) => {
    setDtcCodes(codes);

    // Save scan session to history
    if (vehicle) {
      const session: ScanSession = {
        id: `scan-${Date.now()}`,
        timestamp: new Date(),
        vehicle,
        codes,
        duration: 3000, // Mock duration
      };
      await StorageService.saveScanSession(session);
    }
  };

  const handleClearCodes = () => {
    setDtcCodes([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('obd2Scanner')}</Text>
        <Text style={styles.headerSubtitle}>
          {t('connectScannerSubtitle')}
        </Text>
      </View>

      <View style={styles.settingsBar}>
        <View style={styles.settingItem}>
          <TestTube size={16} color="#6b7280" strokeWidth={2} />
          <Text style={styles.settingLabel}>{t('testMode')}</Text>
          <Switch
            value={settings.testMode}
            onValueChange={updateTestMode}
            trackColor={{ false: '#d1d5db', true: '#fbbf24' }}
            thumbColor={settings.testMode ? '#f97316' : '#f3f4f6'}
          />
        </View>
        
        <View style={styles.settingItem}>
          <Brain size={16} color="#6b7280" strokeWidth={2} />
          <Text style={styles.settingLabel}>{t('aiMode')}</Text>
          <Switch
            value={settings.aiMode}
            onValueChange={updateAIMode}
            trackColor={{ false: '#d1d5db', true: '#fbbf24' }}
            thumbColor={settings.aiMode ? '#f97316' : '#f3f4f6'}
          />
        </View>
      </View>
      <View style={styles.content}>
        <BluetoothConnection
          onDeviceConnected={setConnectedDevice}
          connectedDevice={connectedDevice}
        />

        <VehicleInfo 
          onVehicleUpdate={setVehicle} 
          connectedDevice={connectedDevice}
        />

        <DTCScanner
          connectedDevice={connectedDevice}
          vehicle={vehicle}
          onScanComplete={handleScanComplete}
        />

        {dtcCodes.length > 0 && (
          <DTCResults
            codes={dtcCodes}
            vehicle={vehicle}
            onClearCodes={handleClearCodes}
            aiMode={settings.aiMode}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#cbd5e1',
  },
  settingsBar: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 6,
    marginRight: 8,
  },
  content: {
    flex: 1,
  },
});