import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Modal,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Search, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Circle as XCircle, CircleAlert as AlertCircle, Brain, X } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import { DTCCode, Vehicle } from '@/types/obd2';
import { getSeverityColor } from '@/constants/dtcCodes';
import { aiService, AIDiagnosticResponse } from '@/services/aiService';

interface Props {
  codes: DTCCode[];
  vehicle: Vehicle | null;
  onClearCodes: () => void;
  aiMode: boolean;
}

export default function DTCResults({ codes, vehicle, onClearCodes, aiMode }: Props) {
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [selectedCode, setSelectedCode] = useState<DTCCode | null>(null);
  const [aiResponse, setAiResponse] = useState<AIDiagnosticResponse | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const searchDTCCode = async (code: DTCCode) => {
    if (aiMode) {
      await getAIDiagnostic(code);
      return;
    }

    if (!vehicle) {
      Alert.alert('Error', 'Vehicle information is required for searching');
      return;
    }

    const searchQuery = `${code.code} ${vehicle.brand} ${vehicle.model} ${vehicle.year} diagnostic trouble code`;
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;

    try {
      await WebBrowser.openBrowserAsync(searchUrl);
    } catch (error) {
      Alert.alert('Error', 'Failed to open search. Please try again.');
    }
  };

  const getAIDiagnostic = async (code: DTCCode) => {
    if (!vehicle) {
      Alert.alert('Error', 'Vehicle information is required for AI analysis');
      return;
    }

    if (!aiService.hasApiKey()) {
      Alert.alert('Error', 'Gemini API key not configured. Please set your API key in Settings.');
      return;
    }

    setSelectedCode(code);
    setAiModalVisible(true);
    setLoadingAI(true);
    setAiResponse(null);

    try {
      const response = await aiService.getDiagnosticAnalysis(code, vehicle);
      setAiResponse(response);
    } catch (error) {
      setAiResponse({
        success: false,
        error: 'Failed to get AI analysis. Please try again.'
      });
    } finally {
      setLoadingAI(false);
    }
  };

  const closeAIModal = () => {
    setAiModalVisible(false);
    setSelectedCode(null);
    setAiResponse(null);
  };

  const getSeverityIcon = (severity: string) => {
    const color = getSeverityColor(severity);
    const size = 20;

    switch (severity) {
      case 'low':
        return <CheckCircle size={size} color={color} strokeWidth={2} />;
      case 'medium':
        return <AlertCircle size={size} color={color} strokeWidth={2} />;
      case 'high':
        return <AlertTriangle size={size} color={color} strokeWidth={2} />;
      case 'critical':
        return <XCircle size={size} color={color} strokeWidth={2} />;
      default:
        return <AlertCircle size={size} color={color} strokeWidth={2} />;
    }
  };

  const renderDTCCode = ({ item }: { item: DTCCode }) => (
    <TouchableOpacity
      style={styles.codeItem}
      onPress={() => searchDTCCode(item)}
    >
      <View style={styles.codeHeader}>
        <View style={styles.codeInfo}>
          <Text style={styles.codeText}>{item.code}</Text>
          <View style={styles.severityContainer}>
            {getSeverityIcon(item.severity)}
            <Text style={[styles.severityText, { color: getSeverityColor(item.severity) }]}>
              {item.severity.toUpperCase()}
            </Text>
          </View>
        </View>
        <View style={styles.deviceActions}>
          {aiMode ? (
            <Brain size={16} color="#8b5cf6" strokeWidth={2} />
          ) : (
            <Search size={16} color="#6b7280" strokeWidth={2} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (codes.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <CheckCircle size={64} color="#22c55e" strokeWidth={2} />
        <Text style={styles.emptyTitle}>No Codes Found</Text>
        <Text style={styles.emptySubtitle}>
          Your vehicle is running without any detected issues
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Diagnostic Codes Found</Text>
        <Text style={styles.subtitle}>{codes.length} code(s) detected</Text>
      </View>

      <FlatList
        data={codes}
        renderItem={renderDTCCode}
        keyExtractor={(item) => item.id}
        style={styles.codeList}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={aiModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeAIModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleContainer}>
              <Brain size={24} color="#8b5cf6" strokeWidth={2} />
              <Text style={styles.modalTitle}>AI Diagnostic Analysis</Text>
            </View>
            <TouchableOpacity onPress={closeAIModal} style={styles.closeButton}>
              <X size={24} color="#6b7280" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {selectedCode && (
            <View style={styles.codeHeader}>
              <Text style={styles.modalCodeText}>{selectedCode.code}</Text>
              <Text style={styles.modalCodeDescription}>{selectedCode.description}</Text>
              {vehicle && (
                <Text style={styles.modalVehicleText}>
                  {vehicle.year} {vehicle.brand} {vehicle.model}
                </Text>
              )}
            </View>
          )}

          <ScrollView style={styles.modalContent}>
            {loadingAI ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8b5cf6" />
                <Text style={styles.loadingText}>Analyzing with AI...</Text>
              </View>
            ) : aiResponse ? (
              <View style={styles.responseContainer}>
                {aiResponse.success ? (
                  <Text style={styles.aiResponseText}>{aiResponse.content}</Text>
                ) : (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{aiResponse.error}</Text>
                  </View>
                )}
              </View>
            ) : null}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <TouchableOpacity style={styles.clearButton} onPress={onClearCodes}>
        <Text style={styles.clearButtonText}>Clear Results</Text>
      </TouchableOpacity>
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
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  codeList: {
    maxHeight: 400,
  },
  codeItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  codeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  codeInfo: {
    flex: 1,
  },
  codeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  severityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  severityText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  descriptionText: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 8,
    lineHeight: 20,
  },
  timestampText: {
    fontSize: 12,
    color: '#9ca3af',
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
  modalCodeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  modalCodeDescription: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 8,
  },
  modalVehicleText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
  },
  responseContainer: {
    flex: 1,
  },
  aiResponseText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1f2937',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
  },
  clearButton: {
    backgroundColor: '#6b7280',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    margin: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
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
});