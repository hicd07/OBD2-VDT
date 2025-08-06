import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Shield, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, RefreshCw } from 'lucide-react-native';
import { permissionService, PermissionStatus } from '@/services/permissionService';

interface Props {
  children: React.ReactNode;
}

export default function PermissionGate({ children }: Props) {
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    setLoading(true);
    try {
      const status = await permissionService.checkAllPermissions();
      setPermissionStatus(status);
    } catch (error) {
      console.error('Error checking permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestPermissions = async () => {
    setRequesting(true);
    try {
      const status = await permissionService.requestAllPermissions();
      setPermissionStatus(status);
    } catch (error) {
      console.error('Error requesting permissions:', error);
    } finally {
      setRequesting(false);
    }
  };

  const getPermissionIcon = (granted: boolean) => {
    return granted ? (
      <CheckCircle size={20} color="#22c55e" strokeWidth={2} />
    ) : (
      <AlertTriangle size={20} color="#ef4444" strokeWidth={2} />
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e3a8a" />
          <Text style={styles.loadingText}>Checking permissions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (permissionStatus?.allGranted) {
    return <>{children}</>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.permissionContainer}>
        <View style={styles.header}>
          <Shield size={48} color="#1e3a8a" strokeWidth={2} />
          <Text style={styles.title}>Permissions Required</Text>
          <Text style={styles.subtitle}>
            This app needs certain permissions to connect to OBD2 scanners and provide diagnostics
          </Text>
        </View>

        <View style={styles.permissionList}>
          <View style={styles.permissionItem}>
            {getPermissionIcon(permissionStatus?.bluetooth || false)}
            <View style={styles.permissionText}>
              <Text style={styles.permissionTitle}>Bluetooth</Text>
              <Text style={styles.permissionDescription}>
                Required to connect to OBD2 scanners
              </Text>
            </View>
          </View>

          <View style={styles.permissionItem}>
            {getPermissionIcon(permissionStatus?.location || false)}
            <View style={styles.permissionText}>
              <Text style={styles.permissionTitle}>Location</Text>
              <Text style={styles.permissionDescription}>
                Needed for Bluetooth scanning on Android devices
              </Text>
            </View>
          </View>

          <View style={styles.permissionItem}>
            {getPermissionIcon(permissionStatus?.notifications || false)}
            <View style={styles.permissionText}>
              <Text style={styles.permissionTitle}>Notifications</Text>
              <Text style={styles.permissionDescription}>
                Get alerts about scan results and connection status
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.grantButton}
            onPress={requestPermissions}
            disabled={requesting}
          >
            {requesting ? (
          <Text style={styles.permissionDescription}>
            Required for OBD2 scanner connectivity
          </Text>
            ) : (
              <Shield size={20} color="#ffffff" strokeWidth={2} />
            )}
            <Text style={styles.grantButtonText}>
              {requesting ? 'Requesting...' : 'Grant Permissions'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.refreshButton} onPress={checkPermissions}>
            <RefreshCw size={16} color="#6b7280" strokeWidth={2} />
            <Text style={styles.refreshButtonText}>Check Again</Text>
          </TouchableOpacity>

          {!permissionStatus?.allGranted && (
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => setPermissionStatus({ ...permissionStatus!, allGranted: true })}
            >
              <Text style={styles.continueButtonText}>Continue Without Permissions</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.permissionDescription}>
            Required for OBD2 scanner connectivity
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
  },
  permissionContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  permissionList: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  permissionText: {
    marginLeft: 12,
    flex: 1,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  permissionDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  actions: {
    alignItems: 'center',
  },
  grantButton: {
    backgroundColor: '#1e3a8a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  grantButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 8,
  },
  refreshButtonText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  continueButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  continueButtonText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});