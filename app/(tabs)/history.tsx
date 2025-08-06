import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Calendar, Trash2, Search } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import { ScanSession, DTCCode } from '@/types/obd2';
import { StorageService } from '@/services/storageService';
import { getSeverityColor } from '@/constants/dtcCodes';

export default function HistoryTab() {
  const [scanHistory, setScanHistory] = useState<ScanSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScanHistory();
  }, []);

  const loadScanHistory = async () => {
    setLoading(true);
    try {
      const history = await StorageService.getScanHistory();
      setScanHistory(history);
    } catch (error) {
      console.error('Error loading scan history:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchDTCCode = async (code: DTCCode, vehicle: any) => {
    const searchQuery = `${code.code} ${vehicle.brand} ${vehicle.model} ${vehicle.year} diagnostic trouble code`;
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;

    try {
      await WebBrowser.openBrowserAsync(searchUrl);
    } catch (error) {
      Alert.alert('Error', 'Failed to open search. Please try again.');
    }
  };

  const clearHistory = async () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all scan history? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await StorageService.clearScanHistory();
            setScanHistory([]);
          },
        },
      ]
    );
  };

  const renderScanSession = ({ item }: { item: ScanSession }) => (
    <View style={styles.sessionItem}>
      <View style={styles.sessionHeader}>
        <View style={styles.sessionInfo}>
          <Text style={styles.vehicleText}>
            {item.vehicle.brand} {item.vehicle.model} {item.vehicle.year}
          </Text>
          <Text style={styles.dateText}>
            {item.timestamp.toLocaleDateString()} at {item.timestamp.toLocaleTimeString()}
          </Text>
        </View>
        <Text style={[
          styles.codeCount,
          { color: item.codes.length > 0 ? '#ef4444' : '#22c55e' }
        ]}>
          {item.codes.length} code(s)
        </Text>
      </View>

      {item.codes.length > 0 && (
        <View style={styles.codesContainer}>
          {item.codes.map((code) => (
            <TouchableOpacity
              key={code.id}
              style={styles.codeItem}
              onPress={() => searchDTCCode(code, item.vehicle)}
            >
              <View style={styles.codeInfo}>
                <Text style={styles.codeText}>{code.code}</Text>
                <Text style={styles.codeDescription}>{code.description}</Text>
              </View>
              <View style={styles.codeActions}>
                <View style={[
                  styles.severityDot,
                  { backgroundColor: getSeverityColor(code.severity) }
                ]} />
                <Search size={16} color="#6b7280" strokeWidth={2} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Calendar size={24} color="#ffffff" strokeWidth={2} />
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Scan History</Text>
          <Text style={styles.headerSubtitle}>
            {scanHistory.length} scan session(s)
          </Text>
        </View>
        {scanHistory.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={clearHistory}>
            <Trash2 size={20} color="#ef4444" strokeWidth={2} />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Loading history...</Text>
        </View>
      ) : scanHistory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Calendar size={64} color="#9ca3af" strokeWidth={1} />
          <Text style={styles.emptyTitle}>No Scan History</Text>
          <Text style={styles.emptySubtitle}>
            Your scan results will appear here after running diagnostics
          </Text>
        </View>
      ) : (
        <FlatList
          data={scanHistory}
          renderItem={renderScanSession}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#cbd5e1',
    marginTop: 2,
  },
  clearButton: {
    padding: 8,
  },
  listContainer: {
    padding: 16,
  },
  sessionItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sessionInfo: {
    flex: 1,
  },
  vehicleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  dateText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  codeCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  codesContainer: {
    padding: 16,
    paddingTop: 0,
  },
  codeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
  },
  codeInfo: {
    flex: 1,
  },
  codeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  codeDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  codeActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
});