import { Platform, Alert, Linking } from 'react-native';
import * as Location from 'expo-location';

export interface PermissionStatus {
  bluetooth: boolean;
  location: boolean;
  allGranted: boolean;
}

class PermissionService {
  async checkAllPermissions(): Promise<PermissionStatus> {
    const permissions = await Promise.all([
      this.checkBluetoothPermission(),
      this.checkLocationPermission(),
    ]);

    const [bluetooth, location] = permissions;
    const allGranted = bluetooth && location;

    return {
      bluetooth,
      location,
      allGranted,
    };
  }

  async requestAllPermissions(): Promise<PermissionStatus> {
    try {
      // Request permissions sequentially for better UX
      const bluetooth = await this.requestBluetoothPermission();
      const location = await this.requestLocationPermission();

      const allGranted = bluetooth && location;

      return {
        bluetooth,
        location,
        allGranted,
      };
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return {
        bluetooth: false,
        location: false,
        allGranted: false,
      };
    }
  }

  private async checkBluetoothPermission(): Promise<boolean> {
    if (Platform.OS === 'web') return true;

    try {
      // For Bluetooth, we'll assume it's available since react-native-bluetooth-classic
      // handles the actual Bluetooth permissions when connecting
      return true;
    } catch (error) {
      console.error('Error checking Bluetooth permission:', error);
      return false;
    }
  }

  private async requestBluetoothPermission(): Promise<boolean> {
    if (Platform.OS === 'web') return true;

    try {
      // Bluetooth permissions are handled by react-native-bluetooth-classic
      // when actually connecting to devices
      return true;
    } catch (error) {
      console.error('Error requesting Bluetooth permission:', error);
      return false;
    }
  }

  private async checkLocationPermission(): Promise<boolean> {
    if (Platform.OS === 'web') return true;

    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking location permission:', error);
      return false;
    }
  }

  private async requestLocationPermission(): Promise<boolean> {
    if (Platform.OS === 'web') return true;

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        this.showPermissionDeniedAlert(
          'Location', 
          'Location access is required for Bluetooth scanning on Android devices.'
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }

  private showPermissionDeniedAlert(permissionName: string, description: string) {
    Alert.alert(
      `${permissionName} Permission Required`,
      `${description}\n\nPlease enable ${permissionName} access in your device settings to use this feature.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]
    );
  }

  async showPermissionSummary(status: PermissionStatus) {
    const missingPermissions = [];
    if (!status.bluetooth) missingPermissions.push('Bluetooth');
    if (!status.location) missingPermissions.push('Location');
    if (!status.notifications) missingPermissions.push('Notifications');

    if (missingPermissions.length > 0) {
      Alert.alert(
        'Permissions Required',
        `The following permissions are needed for full functionality:\n\n${missingPermissions.join(', ')}\n\nSome features may not work properly without these permissions.`,
        [
          { text: 'Continue Anyway', style: 'cancel' },
          { text: 'Grant Permissions', onPress: () => this.requestAllPermissions() },
        ]
      );
    }
  }
}

export const permissionService = new PermissionService();