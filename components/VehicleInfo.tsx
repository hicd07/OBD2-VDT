import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Car, Save, Scan, CreditCard as Edit3, CircleCheck as CheckCircle } from 'lucide-react-native';
import { Vehicle, BluetoothDevice } from '@/types/obd2';
import { StorageService } from '@/services/storageService';
import { bluetoothService } from '@/services/bluetoothService';

interface Props {
  onVehicleUpdate: (vehicle: Vehicle) => void;
  connectedDevice: BluetoothDevice | null;
}

export default function VehicleInfo({ onVehicleUpdate, connectedDevice }: Props) {
  const [vehicle, setVehicle] = useState<Vehicle>({
    brand: '',
    model: '',
    year: '',
  });
  const [hasVehicleProfile, setHasVehicleProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);

  useEffect(() => {
    loadVehicleInfo();
  }, []);

  const loadVehicleInfo = async () => {
    const saved = await StorageService.getVehicleInfo();
    if (saved && saved.brand && saved.model && saved.year) {
      setVehicle(saved);
      setHasVehicleProfile(true);
      onVehicleUpdate(saved);
    }
  };

  const saveVehicleInfo = async () => {
    if (!vehicle.brand || !vehicle.model || !vehicle.year) {
      Alert.alert('Error', 'Please fill in all vehicle information fields');
      return;
    }

    setSaving(true);
    try {
      await StorageService.saveVehicleInfo(vehicle);
      setHasVehicleProfile(true);
      setShowManualInput(false);
      onVehicleUpdate(vehicle);
      Alert.alert('Success', 'Vehicle profile set successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save vehicle information');
    } finally {
      setSaving(false);
    }
  };

  const detectVehicle = async () => {
    if (!connectedDevice) {
      Alert.alert('Error', 'Please connect to an OBD2 scanner first');
      return;
    }

    setDetecting(true);
    try {
      const detectedVehicle = await bluetoothService.detectVehicleInfo();
      if (detectedVehicle) {
        setVehicle(detectedVehicle);
        await StorageService.saveVehicleInfo(detectedVehicle);
        setHasVehicleProfile(true);
        onVehicleUpdate(detectedVehicle);
        Alert.alert(
          'Vehicle Detected',
          `Found: ${detectedVehicle.brand} ${detectedVehicle.model} ${detectedVehicle.year}`
        );
      } else {
        Alert.alert('Detection Failed', 'Could not detect vehicle information. Please try manual input.');
        setShowManualInput(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to detect vehicle. Please try manual input.');
      setShowManualInput(true);
    } finally {
      setDetecting(false);
    }
  };

  const selectAnotherVehicle = () => {
    Alert.alert(
      'Change Vehicle',
      'Do you want to detect a new vehicle or enter information manually?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Auto Detect', onPress: () => {
          setHasVehicleProfile(false);
          setShowManualInput(false);
        }},
        { text: 'Manual Input', onPress: () => {
          setHasVehicleProfile(false);
          setShowManualInput(true);
          setVehicle({ brand: '', model: '', year: '' });
        }},
      ]
    );
  };

  const updateField = (field: keyof Vehicle, value: string) => {
    setVehicle(prev => ({ ...prev, [field]: value }));
  };

  // Show vehicle profile when set
  if (hasVehicleProfile) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Car size={24} color="#1e3a8a" strokeWidth={2} />
          <Text style={styles.title}>Vehicle Profile</Text>
        </View>

        <View style={styles.profileContainer}>
          <View style={styles.profileHeader}>
            <CheckCircle size={20} color="#22c55e" strokeWidth={2} />
            <Text style={styles.profileTitle}>Vehicle Set</Text>
          </View>
          
          <View style={styles.vehicleDisplay}>
            <Text style={styles.vehicleBrand}>{vehicle.brand}</Text>
            <Text style={styles.vehicleModel}>{vehicle.model}</Text>
            <Text style={styles.vehicleYear}>{vehicle.year}</Text>
          </View>

          <TouchableOpacity style={styles.changeButton} onPress={selectAnotherVehicle}>
            <Edit3 size={16} color="#f97316" strokeWidth={2} />
            <Text style={styles.changeButtonText}>Select Another Vehicle</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Show detection/manual input options
  if (!showManualInput) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Car size={24} color="#1e3a8a" strokeWidth={2} />
          <Text style={styles.title}>Vehicle Information</Text>
        </View>

        <View style={styles.detectionContainer}>
          <Text style={styles.detectionTitle}>Set up your vehicle profile</Text>
          <Text style={styles.detectionSubtitle}>
            Choose how you'd like to identify your vehicle
          </Text>

          {detecting ? (
            <View style={styles.detectingContainer}>
              <ActivityIndicator size="large" color="#f97316" />
              <Text style={styles.detectingText}>Detecting vehicle...</Text>
              <Text style={styles.detectingSubtext}>
                Reading vehicle identification from OBD2 port
              </Text>
            </View>
          ) : (
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  !connectedDevice && styles.optionButtonDisabled
                ]}
                onPress={detectVehicle}
                disabled={!connectedDevice}
              >
                <Scan size={20} color="#ffffff" strokeWidth={2} />
                <Text style={styles.optionButtonText}>Auto Detect Vehicle</Text>
                <Text style={styles.optionButtonSubtext}>
                  {connectedDevice ? 'Recommended' : 'Requires scanner connection'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.manualButton}
                onPress={() => setShowManualInput(true)}
              >
                <Edit3 size={20} color="#1e3a8a" strokeWidth={2} />
                <Text style={styles.manualButtonText}>Enter Manually</Text>
                <Text style={styles.manualButtonSubtext}>
                  Input vehicle details yourself
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  }

  // Show manual input form
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Car size={24} color="#1e3a8a" strokeWidth={2} />
        <Text style={styles.title}>Vehicle Information</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Brand</Text>
          <TextInput
            style={styles.input}
            value={vehicle.brand}
            onChangeText={(value) => updateField('brand', value)}
            placeholder="e.g., Toyota, Ford, BMW"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Model</Text>
          <TextInput
            style={styles.input}
            value={vehicle.model}
            onChangeText={(value) => updateField('model', value)}
            placeholder="e.g., Camry, F-150, X5"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Year</Text>
          <TextInput
            style={styles.input}
            value={vehicle.year}
            onChangeText={(value) => updateField('year', value)}
            placeholder="e.g., 2020"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={saveVehicleInfo}
          disabled={saving}
        >
          <Save size={16} color="#ffffff" strokeWidth={2} />
          <Text style={styles.saveButtonText}>
            {saving ? 'Setting Profile...' : 'Set Vehicle Profile'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => setShowManualInput(false)}
        >
          <Text style={styles.backButtonText}>Back to Options</Text>
        </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 12,
  },
  // Profile display styles
  profileContainer: {
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#166534',
    marginLeft: 8,
  },
  vehicleDisplay: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  vehicleBrand: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  vehicleModel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4b5563',
    marginTop: 2,
  },
  vehicleYear: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 2,
  },
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f97316',
    backgroundColor: '#fff7ed',
  },
  changeButtonText: {
    color: '#f97316',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Detection options styles
  detectionContainer: {
    padding: 20,
    alignItems: 'center',
  },
  detectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  detectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  detectingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  detectingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
  },
  detectingSubtext: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  optionsContainer: {
    width: '100%',
  },
  optionButton: {
    backgroundColor: '#f97316',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  optionButtonDisabled: {
    backgroundColor: '#9ca3af',
    elevation: 0,
    shadowOpacity: 0,
  },
  optionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  optionButtonSubtext: {
    color: '#fed7aa',
    fontSize: 12,
    marginTop: 4,
  },
  manualButton: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#1e3a8a',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  manualButtonText: {
    color: '#1e3a8a',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  manualButtonSubtext: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 4,
  },
  // Manual input form styles
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
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
    backgroundColor: '#f97316',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  backButtonText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
  },
});