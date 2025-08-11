import AsyncStorage from '@react-native-async-storage/async-storage';
import { Vehicle, ScanSession } from '@/types/obd2';

const STORAGE_KEYS = {
  VEHICLE: '@vehicle_info',
  SCAN_HISTORY: '@scan_history',
  SETTINGS: '@app_settings',
} as const;

const MAX_SCAN_HISTORY = 50;

export interface AppSettings {
  testMode: boolean;
  aiMode: boolean;
  geminiApiKey: string;
  language: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  testMode: true,
  aiMode: false,
  geminiApiKey: '',
  language: 'en',
};

export class StorageService {
  private static async safeGetItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`Error getting ${key}:`, error);
      return null;
    }
  }

  private static async safeSetItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
      throw error;
    }
  }

  private static async safeRemoveItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      throw error;
    }
  }

  static async saveVehicleInfo(vehicle: Vehicle): Promise<void> {
    await this.safeSetItem(STORAGE_KEYS.VEHICLE, JSON.stringify(vehicle));
  }

  static async getVehicleInfo(): Promise<Vehicle | null> {
    const stored = await this.safeGetItem(STORAGE_KEYS.VEHICLE);
    return stored ? JSON.parse(stored) : null;
  }

  static async saveScanSession(session: ScanSession): Promise<void> {
    const existing = await this.getScanHistory();
    const updated = [session, ...existing].slice(0, MAX_SCAN_HISTORY);
    await this.safeSetItem(STORAGE_KEYS.SCAN_HISTORY, JSON.stringify(updated));
  }

  static async getScanHistory(): Promise<ScanSession[]> {
    const stored = await this.safeGetItem(STORAGE_KEYS.SCAN_HISTORY);
    return stored ? JSON.parse(stored) : [];
  }

  static async clearScanHistory(): Promise<void> {
    await this.safeRemoveItem(STORAGE_KEYS.SCAN_HISTORY);
  }

  static async saveSettings(settings: AppSettings): Promise<void> {
    await this.safeSetItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  static async getSettings(): Promise<AppSettings> {
    const stored = await this.safeGetItem(STORAGE_KEYS.SETTINGS);
    return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
  }
}