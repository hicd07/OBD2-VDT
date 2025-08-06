import AsyncStorage from '@react-native-async-storage/async-storage';
import { Vehicle, ScanSession } from '@/types/obd2';

const VEHICLE_KEY = '@vehicle_info';
const SCAN_HISTORY_KEY = '@scan_history';
const SETTINGS_KEY = '@app_settings';

export interface AppSettings {
  testMode: boolean;
  aiMode: boolean;
  geminiApiKey: string;
  language: string;
}

export class StorageService {
  static async saveVehicleInfo(vehicle: Vehicle): Promise<void> {
    try {
      await AsyncStorage.setItem(VEHICLE_KEY, JSON.stringify(vehicle));
    } catch (error) {
      console.error('Error saving vehicle info:', error);
    }
  }

  static async getVehicleInfo(): Promise<Vehicle | null> {
    try {
      const stored = await AsyncStorage.getItem(VEHICLE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error getting vehicle info:', error);
      return null;
    }
  }

  static async saveScanSession(session: ScanSession): Promise<void> {
    try {
      const existing = await this.getScanHistory();
      const updated = [session, ...existing].slice(0, 50); // Keep last 50 scans
      await AsyncStorage.setItem(SCAN_HISTORY_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving scan session:', error);
    }
  }

  static async getScanHistory(): Promise<ScanSession[]> {
    try {
      const stored = await AsyncStorage.getItem(SCAN_HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting scan history:', error);
      return [];
    }
  }

  static async clearScanHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SCAN_HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing scan history:', error);
    }
  }

  static async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  static async getSettings(): Promise<AppSettings> {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      return stored ? JSON.parse(stored) : {
        testMode: true,
        aiMode: false,
        geminiApiKey: '',
        language: 'en',
      };
    } catch (error) {
      console.error('Error getting settings:', error);
      return {
        testMode: true,
        aiMode: false,
        geminiApiKey: '',
        language: 'en',
      };
    }
  }
}