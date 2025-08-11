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

const DEFAULT_SETTINGS: AppSettings = {
  testMode: true,
  aiMode: false,
  geminiApiKey: '',
  language: 'en',
};

export default function ScannerTab() {
  const { t } = useLanguage();
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [dtcCodes, setDtcCodes] = useState<DTCCode[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    await Promise.all([loadVehicleInfo(), loadSettings()]);
  };

  useFocusEffect(
    React.useCallback(() => {
      const checkForSettingsChanges = async () => {
        try {
          const currentSettings = await StorageService.getSettings();
          const hasChanges = ['testMode', 'aiMode', 'geminiApiKey'].some(
            key => currentSettings[key as keyof AppSettings] !== settings[key as keyof AppSettings]
          );
          
          if (hasChanges) {
            updateSettingsState(currentSettings);
          }
        } catch (error) {
          console.error('Error checking settings changes:', error);
        }
      };
      checkForSettingsChanges();
    }, [settings])
  );

  const updateSettingsState = (newSettings: AppSettings) => {
    setSettings(newSettings);
    bluetoothService.setTestMode(newSettings.testMode);
    if (newSettings.geminiApiKey) {
      aiService.setApiKey(newSettings.geminiApiKey);
    }
  };

  const loadVehicleInfo = async () => {
    try {
      const saved = await StorageService.getVehicleInfo();
      if (saved) {
        setVehicle(saved);
      }
    } catch (error) {
      console.error('Error loading vehicle info:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const savedSettings = await StorageService.getSettings();
      updateSettingsState(savedSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const updateSetting = async (key: keyof AppSettings, value: any) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      await StorageService.saveSettings(newSettings);
      
      if (key === 'testMode') {
        bluetoothService.setTestMode(value);
        if (connectedDevice) {
          setConnectedDevice(null);
        }
      }
    } catch (error) {
      console.error(`Error updating ${key}:`, error);
    }
  };

  const handleScanComplete = async (codes: DTCCode[]) => {
    setDtcCodes(codes);

    if (!vehicle) return;

    try {
      const session: ScanSession = {
        id: `scan-${Date.now()}`,
        timestamp: new Date(),
        vehicle,
        codes,
        duration: 3000,
      };
      await StorageService.saveScanSession(session);
    } catch (error) {
      console.error('Error saving scan session:', error);
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

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
      <View style={styles.settingsBar}>
        <View style={styles.settingItem}>
          <TestTube size={16} color="#6b7280" strokeWidth={2} />
          <Text style={styles.settingLabel}>{t('testMode')}</Text>
          <Switch
            value={settings.testMode}
            onValueChange={(value) => updateSetting('testMode', value)}
            trackColor={{ false: '#d1d5db', true: '#fbbf24' }}
            thumbColor={settings.testMode ? '#f97316' : '#f3f4f6'}
          />
        </View>
        
        <View style={styles.settingItem}>
          <Brain size={16} color="#6b7280" strokeWidth={2} />
          <Text style={styles.settingLabel}>{t('aiMode')}</Text>
          <Switch
            value={settings.aiMode}
            onValueChange={(value) => updateSetting('aiMode', value)}
            trackColor={{ false: '#d1d5db', true: '#fbbf24' }}
            thumbColor={settings.aiMode ? '#f97316' : '#f3f4f6'}
          />
        </View>
      </View>
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
      </ScrollView>
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
  scrollContent: {
    paddingBottom: 20,
  },
});