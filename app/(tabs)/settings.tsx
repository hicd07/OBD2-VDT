import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Switch,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Settings as SettingsIcon, Car, Trash2, Info, Shield, CircleHelp as HelpCircle, Key, TestTube, Brain, Save, X, Globe } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import { Vehicle } from '@/types/obd2';
import { StorageService, AppSettings } from '@/services/storageService';
import { bluetoothService } from '@/services/bluetoothService';
import { aiService } from '@/services/aiService';
import { useLanguage } from '@/hooks/useLanguage';

export default function SettingsTab() {
  const { t, language, setLanguage } = useLanguage();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [settings, setSettings] = useState<AppSettings>({
    testMode: true,
    aiMode: false,
    geminiApiKey: '',
    language: language,
  });
  const [apiKeyModalVisible, setApiKeyModalVisible] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  // Refresh settings when tab becomes focused
  useFocusEffect(
    React.useCallback(() => {
      loadSettings();
    }, [])
  );

  useEffect(() => {
    // Update local settings when language changes
    setSettings(prev => ({ ...prev, language }));
  }, [language]);

  const loadSettings = async () => {
    const savedVehicle = await StorageService.getVehicleInfo();
    if (savedVehicle) {
      setVehicle(savedVehicle);
    }
    
    const savedSettings = await StorageService.getSettings();
    setSettings(savedSettings);
    setTempApiKey(savedSettings.geminiApiKey);
  };

  const updateSetting = async (key: keyof AppSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await StorageService.saveSettings(newSettings);
    
    if (key === 'testMode') {
      bluetoothService.setTestMode(value);
    }
    
    if (key === 'geminiApiKey') {
      aiService.setApiKey(value);
    }
  };

  const handleLanguageChange = () => {
    Alert.alert(
      t('selectLanguage'),
      t('selectLanguageMessage'),
      [
        { text: t('cancel'), style: 'cancel' },
        { 
          text: 'English', 
          onPress: async () => {
            await setLanguage('en');
            await updateSetting('language', 'en');
          }
        },
        { 
          text: 'Español', 
          onPress: async () => {
            await setLanguage('es');
            await updateSetting('language', 'es');
          }
        },
      ]
    );
  };

  const openApiKeyModal = () => {
    setTempApiKey(settings.geminiApiKey);
    setApiKeyModalVisible(true);
  };

  const saveApiKey = async () => {
    await updateSetting('geminiApiKey', tempApiKey);
    setApiKeyModalVisible(false);
    Alert.alert('Success', 'Gemini API key saved successfully');
  };

  const clearVehicleInfo = async () => {
    Alert.alert(
      t('clearVehicleInfo'),
      t('clearVehicleInfoConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('clear'),
          style: 'destructive',
          onPress: async () => {
            await StorageService.saveVehicleInfo({ brand: '', model: '', year: '' });
            setVehicle(null);
          },
        },
      ]
    );
  };

  const clearAllData = async () => {
    Alert.alert(
      t('clearAllData'),
      t('clearAllDataConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('clearAll'),
          style: 'destructive',
          onPress: async () => {
            await StorageService.clearScanHistory();
            await StorageService.saveVehicleInfo({ brand: '', model: '', year: '' });
            setVehicle(null);
            Alert.alert(t('success'), t('allDataCleared'));
          },
        },
      ]
    );
  };

  const openAbout = () => {
    Alert.alert(
      t('aboutOBD2Scanner'),
      t('aboutDescription'),
      [{ text: t('ok') }]
    );
  };

  const openHelp = async () => {
    const helpUrl = 'https://www.google.com/search?q=how+to+use+obd2+scanner+app+bluetooth+connection';
    try {
      await WebBrowser.openBrowserAsync(helpUrl);
    } catch (error) {
      Alert.alert(t('error'), t('failedToOpenHelp'));
    }
  };

  const SettingItem = ({ icon, title, subtitle, onPress, showArrow = true, rightElement }: any) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          {icon}
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement || (showArrow && <Text style={styles.arrow}>›</Text>)}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <SettingsIcon size={24} color="#ffffff" strokeWidth={2} />
        <Text style={styles.headerTitle}>{t('settings')}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('vehicle')}</Text>
          <SettingItem
            icon={<Car size={20} color="#1e3a8a" strokeWidth={2} />}
            title={t('vehicleInformation')}
            subtitle={vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.year}` : t('notSet')}
            onPress={() => {}} // Would navigate to vehicle setup
          />
          {vehicle && (
            <SettingItem
              icon={<Trash2 size={20} color="#ef4444" strokeWidth={2} />}
              title={t('clearVehicleInfo')}
              subtitle={t('clearVehicleInfoSubtitle')}
              onPress={clearVehicleInfo}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('preferences')}</Text>
          <SettingItem
            icon={<Globe size={20} color="#1e3a8a" strokeWidth={2} />}
            title={t('language')}
            subtitle={language === 'es' ? 'Español' : 'English'}
            onPress={handleLanguageChange}
          />
          <SettingItem
            icon={<TestTube size={20} color="#1e3a8a" strokeWidth={2} />}
            title={t('testMode')}
            subtitle={t('testModeSubtitle')}
            onPress={() => updateSetting('testMode', !settings.testMode)}
            showArrow={false}
            rightElement={
              <Switch
                value={settings.testMode}
                onValueChange={(value) => updateSetting('testMode', value)}
                trackColor={{ false: '#d1d5db', true: '#fbbf24' }}
                thumbColor={settings.testMode ? '#f97316' : '#f3f4f6'}
              />
            }
          />
          <SettingItem
            icon={<Brain size={20} color="#8b5cf6" strokeWidth={2} />}
            title={t('aiDiagnostics')}
            subtitle={t('aiDiagnosticsSubtitle')}
            onPress={() => updateSetting('aiMode', !settings.aiMode)}
            showArrow={false}
            rightElement={
              <Switch
                value={settings.aiMode}
                onValueChange={(value) => updateSetting('aiMode', value)}
                trackColor={{ false: '#d1d5db', true: '#fbbf24' }}
                thumbColor={settings.aiMode ? '#f97316' : '#f3f4f6'}
              />
            }
          />
          <SettingItem
            icon={<Key size={20} color="#1e3a8a" strokeWidth={2} />}
            title={t('geminiAPIKey')}
            subtitle={settings.geminiApiKey ? t('apiKeyConfigured') : t('apiKeyRequired')}
            onPress={openApiKeyModal}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('data')}</Text>
          <SettingItem
            icon={<Trash2 size={20} color="#ef4444" strokeWidth={2} />}
            title={t('clearAllData')}
            subtitle={t('clearAllDataSubtitle')}
            onPress={clearAllData}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('support')}</Text>
          <SettingItem
            icon={<HelpCircle size={20} color="#1e3a8a" strokeWidth={2} />}
            title={t('helpSupport')}
            subtitle={t('helpSupportSubtitle')}
            onPress={openHelp}
          />
          <SettingItem
            icon={<Info size={20} color="#1e3a8a" strokeWidth={2} />}
            title={t('about')}
            subtitle={t('aboutSubtitle')}
            onPress={openAbout}
          />
        </View>
      </ScrollView>

      <Modal
        visible={apiKeyModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setApiKeyModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleContainer}>
              <Key size={24} color="#1e3a8a" strokeWidth={2} />
              <Text style={styles.modalTitle}>{t('geminiAPIKey')}</Text>
            </View>
            <TouchableOpacity onPress={() => setApiKeyModalVisible(false)} style={styles.closeButton}>
              <X size={24} color="#6b7280" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalDescription}>
              {t('geminiAPIKeyDescription')}
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('apiKey')}</Text>
              <TextInput
                style={styles.apiKeyInput}
                value={tempApiKey}
                onChangeText={setTempApiKey}
                placeholder={t('enterGeminiAPIKey')}
                placeholderTextColor="#9ca3af"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={saveApiKey}>
              <Save size={16} color="#ffffff" strokeWidth={2} />
              <Text style={styles.saveButtonText}>{t('saveAPIKey')}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.helpButton}
              onPress={() => WebBrowser.openBrowserAsync('https://aistudio.google.com/app/apikey')}
            >
              <Text style={styles.helpButtonText}>{t('getAPIKeyFromGoogleAI')}</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 12,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
    marginTop: 16,
    marginLeft: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  arrow: {
    fontSize: 18,
    color: '#9ca3af',
    fontWeight: '300',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginLeft: 12,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalDescription: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  apiKeyInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#ffffff',
  },
  saveButton: {
    backgroundColor: '#1e3a8a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  helpButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  helpButtonText: {
    color: '#1e3a8a',
    fontSize: 14,
    fontWeight: '600',
  },
});