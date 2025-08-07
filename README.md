# OBD2-VDT (Vehicle Diagnostic Tool)

A professional OBD2 diagnostic mobile application built with React Native and Expo. Connect to Bluetooth OBD2 scanners to read and analyze vehicle diagnostic trouble codes (DTCs) with optional AI-powered analysis.

## Features

### 🔧 Core Functionality
- **Bluetooth OBD2 Scanner Connection**: Connect to ELM327 and compatible OBD2 scanners via Bluetooth
- **DTC Code Reading**: Scan and retrieve diagnostic trouble codes from your vehicle's ECU
- **Vehicle Profile Management**: Store and manage vehicle information (make, model, year)
- **Scan History**: Keep track of all diagnostic scans with timestamps
- **Multi-language Support**: Available in English and Spanish

### 🤖 AI-Powered Diagnostics
- **Intelligent Code Analysis**: Get AI-powered explanations and diagnostic procedures for DTC codes
- **Vehicle-Specific Recommendations**: Tailored diagnostic advice based on your specific vehicle
- **Gemini AI Integration**: Powered by Google's Gemini AI for accurate diagnostic insights

### 🛠️ Developer Features
- **Test Mode**: Mock data and simulated scanning for development and testing
- **Cross-Platform**: Runs on iOS, Android, and Web (with platform-specific features)
- **Modern Architecture**: Built with TypeScript, Expo Router, and React Native best practices

## Screenshots

*Screenshots will be added once the app is deployed*

## Installation

### Prerequisites
- Node.js 18+ 
- Expo CLI
- For AI features: Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/OBD2-VDT.git
   cd OBD2-VDT
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Run on your device**
   - Install Expo Go app on your mobile device
   - Scan the QR code displayed in the terminal
   - Or run in web browser at `http://localhost:8081`

## Building for Production

### Using EAS Build (Recommended)

1. **Install EAS CLI**
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Login to Expo**
   ```bash
   eas login
   ```

3. **Build Android APK**
   ```bash
   # Debug APK (for testing)
   eas build --platform android --profile apk-debug
   
   # Release APK (for distribution)
   eas build --platform android --profile apk-release
   ```

4. **Build iOS App**
   ```bash
   eas build --platform ios --profile preview
   ```

### Local Build (Advanced)

For local Android builds, use the provided batch script:
```bash
# Windows
./build-android.bat

# Note: Local builds require Android Studio, JDK 17+, and proper environment setup
```

## Configuration

### AI Diagnostics Setup

1. Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Open the app and go to Settings
3. Enter your Gemini API key
4. Enable AI Mode toggle
5. AI analysis will now be available when viewing DTC codes

### OBD2 Scanner Compatibility

This app is compatible with:
- **ELM327 Bluetooth adapters** (most common)
- **OBDLink scanners**
- **BlueDriver adapters**
- **Most generic Bluetooth OBD2 scanners**

## Usage

### First Time Setup

1. **Connect OBD2 Scanner**
   - Plug your OBD2 scanner into your vehicle's diagnostic port
   - Pair the scanner with your phone via Bluetooth
   - Open the app and tap "Scan" to find your device

2. **Set Vehicle Information**
   - Choose "Auto Detect" to automatically identify your vehicle
   - Or manually enter your vehicle's make, model, and year

3. **Run Diagnostic Scan**
   - Ensure your vehicle is running or in accessory mode
   - Tap "Start Scan" to read diagnostic codes
   - View results and tap codes for more information

### Features Overview

- **Scanner Tab**: Main interface for connecting and scanning
- **History Tab**: View all previous scan sessions
- **Settings Tab**: Configure app preferences, AI settings, and vehicle info

## Technical Architecture

### Tech Stack
- **React Native 0.79.1**: Cross-platform mobile framework
- **Expo 53.0.0**: Development platform and build tools
- **Expo Router 5.0.2**: File-based navigation
- **TypeScript**: Type-safe development
- **React Native Bluetooth Classic**: Bluetooth connectivity
- **AsyncStorage**: Local data persistence
- **Lucide React Native**: Modern icon library

### Project Structure
```
├── app/                    # App screens and navigation
│   ├── (tabs)/            # Tab-based navigation
│   │   ├── index.tsx      # Scanner screen
│   │   ├── history.tsx    # Scan history
│   │   └── settings.tsx   # App settings
│   └── _layout.tsx        # Root layout
├── components/            # Reusable UI components
├── services/              # Business logic and API services
├── types/                 # TypeScript type definitions
├── constants/             # App constants and configurations
└── hooks/                 # Custom React hooks
```

### Key Services
- **BluetoothService**: Handles OBD2 scanner communication
- **StorageService**: Manages local data persistence
- **AIService**: Integrates with Gemini AI for diagnostics
- **PermissionService**: Manages device permissions

## Permissions

The app requires the following permissions:

### Android
- `BLUETOOTH` & `BLUETOOTH_ADMIN`: Connect to OBD2 scanners
- `BLUETOOTH_CONNECT` & `BLUETOOTH_SCAN`: Modern Bluetooth permissions (Android 12+)
- `ACCESS_FINE_LOCATION`: Required for Bluetooth scanning on Android
- `ACCESS_COARSE_LOCATION`: Location services for Bluetooth

### iOS
- `NSBluetoothAlwaysUsageDescription`: Bluetooth access for OBD2 connectivity
- `NSLocationWhenInUseUsageDescription`: Location for Bluetooth scanning

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use the existing component patterns
- Test on both iOS and Android
- Ensure accessibility compliance
- Update documentation for new features

## Troubleshooting

### Common Issues

**Bluetooth Connection Failed**
- Ensure OBD2 scanner is properly paired with your device
- Check that the scanner is plugged into the vehicle's OBD2 port
- Try enabling Test Mode in settings for development

**No Devices Found**
- Verify Bluetooth is enabled on your device
- Check that location permissions are granted (Android requirement)
- Ensure the OBD2 scanner is in pairing mode

**AI Analysis Not Working**
- Verify your Gemini API key is correctly entered in Settings
- Check your internet connection
- Ensure AI Mode is enabled in the scanner interface

**Build Issues**
- Use EAS Build instead of local builds for easier setup
- Ensure all dependencies are properly installed
- Check that your Expo CLI is up to date

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Open an issue on GitHub
- Check the troubleshooting section above
- Review Expo documentation for platform-specific issues

## Acknowledgments

- Built with [Expo](https://expo.dev/) and [React Native](https://reactnative.dev/)
- Icons by [Lucide](https://lucide.dev/)
- AI diagnostics powered by [Google Gemini](https://ai.google.dev/)
- OBD2 communication via [react-native-bluetooth-classic](https://github.com/kenjdavidson/react-native-bluetooth-classic)

---

**Note**: This app is designed for educational and diagnostic purposes. Always consult with a qualified mechanic for serious vehicle issues.