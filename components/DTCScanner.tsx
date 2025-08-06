import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Play, Square } from 'lucide-react-native';
import { DTCCode, BluetoothDevice, Vehicle } from '@/types/obd2';
import { bluetoothService } from '@/services/bluetoothService';

interface Props {
  connectedDevice: BluetoothDevice | null;
  vehicle: Vehicle | null;
  onScanComplete: (codes: DTCCode[]) => void;
}

export default function DTCScanner({ connectedDevice, vehicle, onScanComplete }: Props) {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);

  const startScan = async () => {
    if (!connectedDevice) {
      Alert.alert('Error', 'Please connect to an OBD2 scanner first');
      return;
    }

    if (!vehicle || !vehicle.brand || !vehicle.model || !vehicle.year) {
      Alert.alert('Error', 'Please enter your vehicle information first');
      return;
    }

    setScanning(true);
    setProgress(0);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);

    try {
      const codes = await bluetoothService.scanForDTCCodes();
      setProgress(100);
      onScanComplete(codes);
      
      if (codes.length === 0) {
        Alert.alert('Scan Complete', 'No diagnostic codes found. Your vehicle appears to be running normally!');
      } else {
        Alert.alert('Scan Complete', `Found ${codes.length} diagnostic code(s). Tap on any code to search for more information.`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to scan for codes. Please check your connection and try again.');
      console.error('Scan error:', error);
    } finally {
      clearInterval(progressInterval);
      setScanning(false);
      setProgress(0);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>DTC Code Scanner</Text>
        <Text style={styles.subtitle}>
          Scan your vehicle for diagnostic trouble codes
        </Text>
      </View>

      <View style={styles.scanSection}>
        {scanning ? (
          <View style={styles.scanningContainer}>
            <ActivityIndicator size="large" color="#f97316" />
            <Text style={styles.scanningText}>Scanning for codes...</Text>
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{progress}%</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.scanButton,
              (!connectedDevice || !vehicle?.brand) && styles.scanButtonDisabled
            ]}
            onPress={startScan}
            disabled={!connectedDevice || !vehicle?.brand}
          >
            <Play size={20} color="#ffffff" strokeWidth={2} />
            <Text style={styles.scanButtonText}>Start Scan</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.statusContainer}>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Scanner:</Text>
          <Text style={[
            styles.statusValue,
            { color: connectedDevice ? '#22c55e' : '#ef4444' }
          ]}>
            {connectedDevice ? 'Connected' : 'Not Connected'}
          </Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Vehicle:</Text>
          <Text style={[
            styles.statusValue,
            { color: vehicle?.brand ? '#22c55e' : '#ef4444' }
          ]}>
            {vehicle?.brand ? `${vehicle.brand} ${vehicle.model} ${vehicle.year}` : 'Not Set'}
          </Text>
        </View>
      </View>
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  scanSection: {
    padding: 32,
    alignItems: 'center',
  },
  scanButton: {
    backgroundColor: '#f97316',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  scanButtonDisabled: {
    backgroundColor: '#9ca3af',
    elevation: 0,
    shadowOpacity: 0,
  },
  scanButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  scanningContainer: {
    alignItems: 'center',
  },
  scanningText: {
    fontSize: 16,
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 20,
  },
  progressContainer: {
    width: 200,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#f97316',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  statusContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#6b7280',
    width: 80,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
});