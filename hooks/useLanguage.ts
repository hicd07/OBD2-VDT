import { useState, useEffect, createContext, useContext } from 'react';
import { StorageService } from '@/services/storageService';

type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

type TranslationKey = keyof typeof translations.en;

const translations = {
  en: {
    // General
    settings: 'Settings',
    vehicle: 'Vehicle',
    preferences: 'Preferences',
    data: 'Data',
    support: 'Support',
    language: 'Language',
    cancel: 'Cancel',
    clear: 'Clear',
    clearAll: 'Clear All',
    success: 'Success',
    error: 'Error',
    ok: 'OK',
    save: 'Save',
    scan: 'Scan',
    scanAgain: 'Scan Again',
    notSet: 'Not set',
    
    // Vehicle
    vehicleInformation: 'Vehicle Information',
    clearVehicleInfo: 'Clear Vehicle Info',
    clearVehicleInfoSubtitle: 'Remove saved vehicle information',
    clearVehicleInfoConfirm: 'Are you sure you want to clear your vehicle information?',
    
    // Settings
    testMode: 'Test Mode',
    testModeSubtitle: 'Use mock data for testing without real scanner',
    aiDiagnostics: 'AI Diagnostics',
    aiDiagnosticsSubtitle: 'Use AI for intelligent code analysis',
    geminiAPIKey: 'Gemini API Key',
    apiKeyConfigured: 'API key configured',
    apiKeyRequired: 'Required for AI diagnostics',
    apiKey: 'API Key',
    enterGeminiAPIKey: 'Enter your Gemini API key',
    saveAPIKey: 'Save API Key',
    getAPIKeyFromGoogleAI: 'Get API Key from Google AI Studio',
    geminiAPIKeyDescription: 'Enter your Gemini API key to enable AI-powered diagnostic analysis. You can get a free API key from Google AI Studio.',
    
    // Language
    selectLanguage: 'Select Language',
    selectLanguageMessage: 'Choose your preferred language for the app interface.',
    
    // Data
    clearAllData: 'Clear All Data',
    clearAllDataSubtitle: 'Delete all scan history and settings',
    clearAllDataConfirm: 'This will delete all scan history and vehicle information. This action cannot be undone.',
    allDataCleared: 'All data has been cleared',
    
    // Support
    helpSupport: 'Help & Support',
    helpSupportSubtitle: 'Get help with using the app',
    about: 'About',
    aboutSubtitle: 'App information and version',
    aboutOBD2Scanner: 'About OBD2 Scanner',
    aboutDescription: 'Version 1.0.0\n\nA professional OBD2 diagnostic tool for reading and analyzing vehicle trouble codes. Connect via Bluetooth to supported ELM327 and compatible scanners.\n\nDeveloped with React Native and Expo.',
    failedToOpenHelp: 'Failed to open help. Please try again.',
    
    // Bluetooth
    availableOBD2Scanners: 'Available OBD2 Scanners',
    connectedTo: 'Connected to',
    disconnect: 'Disconnect',
    noOBD2DevicesFound: 'No OBD2 Devices Found',
    noOBD2DevicesMessage: 'Make sure your OBD2 scanner is paired with your device and in range.',
    tapScanToFindDevices: 'Tap Scan to Find Devices',
    scanPromptMessage: 'Press the scan button to search for available OBD2 scanners.',
    
    // Scanner Tab
    obd2Scanner: 'OBD2 Scanner',
    connectScannerSubtitle: 'Connect your scanner and diagnose your vehicle',
    aiMode: 'AI Mode',
    
    // Vehicle
    vehicleInformation: 'Vehicle Information',
    clearVehicleInfo: 'Clear Vehicle Info',
    clearVehicleInfoSubtitle: 'Remove saved vehicle information',
    clearVehicleInfoConfirm: 'Are you sure you want to clear your vehicle information?',
    
    // Settings
    testMode: 'Test Mode',
    testModeSubtitle: 'Use mock data for testing without real scanner',
    aiDiagnostics: 'AI Diagnostics',
    aiDiagnosticsSubtitle: 'Use AI for intelligent code analysis',
    geminiAPIKey: 'Gemini API Key',
    apiKeyConfigured: 'API key configured',
    apiKeyRequired: 'Required for AI diagnostics',
    apiKey: 'API Key',
    enterGeminiAPIKey: 'Enter your Gemini API key',
    saveAPIKey: 'Save API Key',
    getAPIKeyFromGoogleAI: 'Get API Key from Google AI Studio',
    geminiAPIKeyDescription: 'Enter your Gemini API key to enable AI-powered diagnostic analysis. You can get a free API key from Google AI Studio.',
    
    // Language
    selectLanguage: 'Select Language',
    selectLanguageMessage: 'Choose your preferred language for the app interface.',
    
    // Data
    clearAllData: 'Clear All Data',
    clearAllDataSubtitle: 'Delete all scan history and settings',
    clearAllDataConfirm: 'This will delete all scan history and vehicle information. This action cannot be undone.',
    allDataCleared: 'All data has been cleared',
    
    // Support
    helpSupport: 'Help & Support',
    helpSupportSubtitle: 'Get help with using the app',
    about: 'About',
    aboutSubtitle: 'App information and version',
    aboutOBD2Scanner: 'About OBD2 Scanner',
    aboutDescription: 'Version 1.0.0\n\nA professional OBD2 diagnostic tool for reading and analyzing vehicle trouble codes. Connect via Bluetooth to supported ELM327 and compatible scanners.\n\nDeveloped with React Native and Expo.',
    failedToOpenHelp: 'Failed to open help. Please try again.',
    
    // Bluetooth
    availableOBD2Scanners: 'Available OBD2 Scanners',
    connectedTo: 'Connected to',
    disconnect: 'Disconnect',
    noOBD2DevicesFound: 'No OBD2 Devices Found',
    noOBD2DevicesMessage: 'Make sure your OBD2 scanner is paired with your device and in range.',
    tapScanToFindDevices: 'Tap Scan to Find Devices',
    scanPromptMessage: 'Press the scan button to search for available OBD2 scanners.',
    
    // Scanner Tab
    obd2Scanner: 'OBD2 Scanner',
    connectScannerSubtitle: 'Connect your scanner and diagnose your vehicle',
    aiMode: 'AI Mode',
  },
  es: {
    // General
    settings: 'Configuración',
    vehicle: 'Vehículo',
    preferences: 'Preferencias',
    data: 'Datos',
    support: 'Soporte',
    language: 'Idioma',
    cancel: 'Cancelar',
    clear: 'Limpiar',
    clearAll: 'Limpiar Todo',
    success: 'Éxito',
    error: 'Error',
    ok: 'OK',
    save: 'Guardar',
    scan: 'Escanear',
    scanAgain: 'Escanear Nuevamente',
    notSet: 'No configurado',
    
    // Vehicle
    vehicleInformation: 'Información del Vehículo',
    clearVehicleInfo: 'Limpiar Info del Vehículo',
    clearVehicleInfoSubtitle: 'Eliminar información guardada del vehículo',
    clearVehicleInfoConfirm: '¿Estás seguro de que quieres limpiar la información de tu vehículo?',
    
    // Settings
    testMode: 'Modo de Prueba',
    testModeSubtitle: 'Usar datos simulados para pruebas sin escáner real',
    aiDiagnostics: 'Diagnósticos IA',
    aiDiagnosticsSubtitle: 'Usar IA para análisis inteligente de códigos',
    geminiAPIKey: 'Clave API de Gemini',
    apiKeyConfigured: 'Clave API configurada',
    apiKeyRequired: 'Requerida para diagnósticos IA',
    apiKey: 'Clave API',
    enterGeminiAPIKey: 'Ingresa tu clave API de Gemini',
    saveAPIKey: 'Guardar Clave API',
    getAPIKeyFromGoogleAI: 'Obtener Clave API de Google AI Studio',
    geminiAPIKeyDescription: 'Ingresa tu clave API de Gemini para habilitar análisis de diagnóstico con IA. Puedes obtener una clave API gratuita de Google AI Studio.',
    
    // Language
    selectLanguage: 'Seleccionar Idioma',
    selectLanguageMessage: 'Elige tu idioma preferido para la interfaz de la aplicación.',
    
    // Data
    clearAllData: 'Limpiar Todos los Datos',
    clearAllDataSubtitle: 'Eliminar todo el historial de escaneos y configuraciones',
    clearAllDataConfirm: 'Esto eliminará todo el historial de escaneos e información del vehículo. Esta acción no se puede deshacer.',
    allDataCleared: 'Todos los datos han sido eliminados',
    
    // Support
    helpSupport: 'Ayuda y Soporte',
    helpSupportSubtitle: 'Obtener ayuda para usar la aplicación',
    about: 'Acerca de',
    aboutSubtitle: 'Información de la aplicación y versión',
    aboutOBD2Scanner: 'Acerca del Escáner OBD2',
    aboutDescription: 'Versión 1.0.0\n\nUna herramienta de diagnóstico OBD2 profesional para leer y analizar códigos de problemas del vehículo. Conecta vía Bluetooth a escáneres ELM327 y compatibles.\n\nDesarrollado con React Native y Expo.',
    failedToOpenHelp: 'Error al abrir la ayuda. Por favor intenta de nuevo.',
    
    // Bluetooth
    availableOBD2Scanners: 'Escáneres OBD2 Disponibles',
    connectedTo: 'Conectado a',
    disconnect: 'Desconectar',
    noOBD2DevicesFound: 'No se Encontraron Dispositivos OBD2',
    noOBD2DevicesMessage: 'Asegúrate de que tu escáner OBD2 esté emparejado con tu dispositivo y en rango.',
    tapScanToFindDevices: 'Toca Escanear para Encontrar Dispositivos',
    scanPromptMessage: 'Presiona el botón de escanear para buscar escáneres OBD2 disponibles.',
    
    // Scanner Tab
    obd2Scanner: 'Escáner OBD2',
    connectScannerSubtitle: 'Conecta tu escáner y diagnostica tu vehículo',
    aiMode: 'Modo IA',
    
    // Vehicle
    vehicleInformation: 'Información del Vehículo',
    clearVehicleInfo: 'Limpiar Info del Vehículo',
    clearVehicleInfoSubtitle: 'Eliminar información guardada del vehículo',
    clearVehicleInfoConfirm: '¿Estás seguro de que quieres limpiar la información de tu vehículo?',
    
    // Settings
    testMode: 'Modo de Prueba',
    testModeSubtitle: 'Usar datos simulados para pruebas sin escáner real',
    aiDiagnostics: 'Diagnósticos IA',
    aiDiagnosticsSubtitle: 'Usar IA para análisis inteligente de códigos',
    geminiAPIKey: 'Clave API de Gemini',
    apiKeyConfigured: 'Clave API configurada',
    apiKeyRequired: 'Requerida para diagnósticos IA',
    apiKey: 'Clave API',
    enterGeminiAPIKey: 'Ingresa tu clave API de Gemini',
    saveAPIKey: 'Guardar Clave API',
    getAPIKeyFromGoogleAI: 'Obtener Clave API de Google AI Studio',
    geminiAPIKeyDescription: 'Ingresa tu clave API de Gemini para habilitar análisis de diagnóstico con IA. Puedes obtener una clave API gratuita de Google AI Studio.',
    
    // Language
    selectLanguage: 'Seleccionar Idioma',
    selectLanguageMessage: 'Elige tu idioma preferido para la interfaz de la aplicación.',
    
    // Data
    clearAllData: 'Limpiar Todos los Datos',
    clearAllDataSubtitle: 'Eliminar todo el historial de escaneos y configuraciones',
    clearAllDataConfirm: 'Esto eliminará todo el historial de escaneos e información del vehículo. Esta acción no se puede deshacer.',
    allDataCleared: 'Todos los datos han sido eliminados',
    
    // Support
    helpSupport: 'Ayuda y Soporte',
    helpSupportSubtitle: 'Obtener ayuda para usar la aplicación',
    about: 'Acerca de',
    aboutSubtitle: 'Información de la aplicación y versión',
    aboutOBD2Scanner: 'Acerca del Escáner OBD2',
    aboutDescription: 'Versión 1.0.0\n\nUna herramienta de diagnóstico OBD2 profesional para leer y analizar códigos de problemas del vehículo. Conecta vía Bluetooth a escáneres ELM327 y compatibles.\n\nDesarrollado con React Native y Expo.',
    failedToOpenHelp: 'Error al abrir la ayuda. Por favor intenta de nuevo.',
    
    // Bluetooth
    availableOBD2Scanners: 'Escáneres OBD2 Disponibles',
    connectedTo: 'Conectado a',
    disconnect: 'Desconectar',
    noOBD2DevicesFound: 'No se Encontraron Dispositivos OBD2',
    noOBD2DevicesMessage: 'Asegúrate de que tu escáner OBD2 esté emparejado con tu dispositivo y en rango.',
    tapScanToFindDevices: 'Toca Escanear para Encontrar Dispositivos',
    scanPromptMessage: 'Presiona el botón de escanear para buscar escáneres OBD2 disponibles.',
    
    // Scanner Tab
    obd2Scanner: 'Escáner OBD2',
    connectScannerSubtitle: 'Conecta tu escáner y diagnostica tu vehículo',
    aiMode: 'Modo IA',
  },
};

let currentLanguage: Language = 'en';

export const useLanguage = () => {
  const [language, setLanguageState] = useState<Language>(currentLanguage);

  const setLanguage = async (lang: Language) => {
    currentLanguage = lang;
    setLanguageState(lang);
    
    try {
      const settings = await StorageService.getSettings();
      await StorageService.saveSettings({ ...settings, language: lang });
    } catch (error) {
      console.error('Failed to save language setting:', error);
    }
  };

  const t = (key: string): string => {
    const translation = translations[language][key as TranslationKey];
    if (!translation) {
      console.warn(`Missing translation for key: ${key}`);
      return key;
    }
    return translation;
  };

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const settings = await StorageService.getSettings();
        if (settings.language && settings.language !== language) {
          currentLanguage = settings.language as Language;
          setLanguageState(settings.language as Language);
        }
      } catch (error) {
        console.error('Failed to load language setting:', error);
      }
    };
    loadLanguage();
  }, []);

  return { language, setLanguage, t };
};