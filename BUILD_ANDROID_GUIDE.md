# 🚀 Android APK Build Guide

This guide provides step-by-step instructions for building the OBD2-VDT Android APK locally using the provided `build-android.bat` script.

## 📋 Prerequisites

Before running the build script, ensure you have the following installed:

### 1. Node.js (Required)
- **Version**: Node.js 18 or higher
- **Download**: https://nodejs.org/
- **Verify installation**: Open Command Prompt and run `node --version`

### 2. Java Development Kit (Required)
- **Version**: JDK 17 or higher
- **Options**:
  - **Oracle JDK**: https://www.oracle.com/java/technologies/downloads/
  - **OpenJDK (Recommended)**: https://adoptium.net/
- **Verify installation**: Run `java -version` in Command Prompt
- **Important**: Make sure Java is added to your PATH environment variable

### 3. Android Studio (Required)
- **Download**: https://developer.android.com/studio
- **Purpose**: Provides Android SDK, build tools, and emulators
- **Installation Notes**:
  - During installation, make sure to install the Android SDK
  - Note the SDK installation path (usually `C:\Users\[USERNAME]\AppData\Local\Android\Sdk`)

### 4. Android SDK Configuration
After installing Android Studio:

1. **Open Android Studio**
2. **Go to**: File → Settings → Appearance & Behavior → System Settings → Android SDK
3. **Install required components**:
   - Android SDK Platform-Tools
   - Android SDK Build-Tools (latest version)
   - Android API Level 33 or higher
4. **Set ANDROID_HOME environment variable** (Optional but recommended):
   - Right-click "This PC" → Properties → Advanced System Settings
   - Click "Environment Variables"
   - Add new system variable:
     - Variable name: `ANDROID_HOME`
     - Variable value: Path to your Android SDK (e.g., `C:\Users\[USERNAME]\AppData\Local\Android\Sdk`)

## 🛠️ Build Process

### Step 1: Download and Prepare
1. **Download the project** to your local machine
2. **Extract** the project files to a folder (e.g., `C:\Projects\OBD2-VDT`)
3. **Ensure** the `build-android.bat` file is in the project root directory (same folder as `package.json`)

### Step 2: Run the Build Script
1. **Open Command Prompt as Administrator** (recommended)
2. **Navigate** to your project directory:
   ```cmd
   cd C:\Path\To\Your\Project
   ```
3. **Run the build script**:
   ```cmd
   build-android.bat
   ```

### Step 3: Monitor the Build Process
The script will automatically perform these steps:

1. **[1/10] Check Prerequisites** - Verifies Node.js, npm, and Java installation
2. **[2/10] Install Dependencies** - Runs `npm install` to download required packages
3. **[3/10] Clean Expo Cache** - Clears any cached Expo files
4. **[4/10] Clean Android Project** - Removes any existing Android build files
5. **[5/10] Generate Android Project** - Creates native Android project files using Expo
6. **[6/10] Configure Android SDK** - Sets up SDK paths and creates configuration files
7. **[7/10] Verify Gradle Wrapper** - Ensures Gradle build system is ready
8. **[8/10] Clean Gradle Cache** - Clears any cached Gradle files
9. **[9/10] Build APK** - Compiles the Android application (5-15 minutes)
10. **[10/10] Locate APK** - Finds and reports the location of the built APK file

### Step 4: Locate Your APK
Upon successful completion, the APK will be located at:
```
android\app\build\outputs\apk\debug\app-debug.apk
```

## 📱 Installing the APK

### Method 1: Using ADB (Recommended)
1. **Enable Developer Options** on your Android device:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
2. **Enable USB Debugging**:
   - Go to Settings → Developer Options
   - Enable "USB Debugging"
3. **Connect your device** via USB
4. **Install using ADB**:
   ```cmd
   adb install android\app\build\outputs\apk\debug\app-debug.apk
   ```

### Method 2: Manual Installation
1. **Copy the APK file** to your Android device
2. **Enable "Install from Unknown Sources"**:
   - Go to Settings → Security
   - Enable "Unknown Sources" or "Install Unknown Apps"
3. **Open the APK file** on your device and follow installation prompts

## 🔧 Troubleshooting

### Common Issues and Solutions

#### ❌ "Node.js is not installed"
**Solution**: Install Node.js from https://nodejs.org/ and restart Command Prompt

#### ❌ "Java not found in PATH"
**Solutions**:
1. Install JDK 17+ from https://adoptium.net/
2. Add Java to your PATH environment variable
3. Restart Command Prompt after installation

#### ❌ "Android SDK not found"
**Solutions**:
1. Install Android Studio from https://developer.android.com/studio
2. Set ANDROID_HOME environment variable to your SDK path
3. Common SDK locations:
   - `C:\Users\[USERNAME]\AppData\Local\Android\Sdk`
   - `C:\Android\Sdk`

#### ❌ "gradlew.bat not found"
**Solutions**:
1. Delete the `android` folder in your project
2. Run the build script again
3. If still failing, try: `npx expo prebuild --platform android --clean`

#### ❌ "Gradle build failed"
**Solutions**:
1. Check the detailed log file in the `logs` folder
2. Ensure you have at least 4GB of free RAM
3. Try running these commands manually:
   ```cmd
   cd android
   gradlew clean
   gradlew assembleDebug --stacktrace
   ```
4. Consider using EAS Build instead (see Alternative Method below)

#### ❌ "APK not found after successful build"
**Solutions**:
1. Check the `logs` folder for detailed build information
2. Manually search for `*.apk` files in the `android` folder
3. Try rebuilding with: `gradlew assembleDebug --stacktrace`

### Build Performance Tips

1. **Close unnecessary applications** to free up RAM (Gradle needs 2-4GB)
2. **Use SSD storage** for faster build times
3. **First build takes longer** (5-15 minutes) due to dependency downloads
4. **Subsequent builds are faster** (2-5 minutes)

## 🌐 Alternative: EAS Build (Cloud-based)

If local building continues to fail, you can use Expo's cloud build service:

### Prerequisites
1. **Create Expo account**: https://expo.dev/
2. **Install EAS CLI**:
   ```cmd
   npm install -g @expo/eas-cli
   ```
3. **Login to Expo**:
   ```cmd
   eas login
   ```

### Build Commands
```cmd
# Debug APK (for testing)
eas build --platform android --profile preview

# Release APK (for distribution)
eas build --platform android --profile production
```

### Advantages of EAS Build
- ✅ No local Android SDK setup required
- ✅ Consistent build environment
- ✅ Automatic dependency management
- ✅ Build logs and artifacts stored in cloud
- ✅ Support for multiple build profiles

## 📊 Build Script Features

The `build-android.bat` script includes:

- ✅ **Comprehensive prerequisite checking**
- ✅ **Detailed logging** with timestamps
- ✅ **Progress indicators** for each step
- ✅ **Automatic error detection** and troubleshooting guidance
- ✅ **APK location detection** and size reporting
- ✅ **Installation instructions** for the built APK
- ✅ **Colored console output** for better readability
- ✅ **Log file generation** for debugging

## 📝 Build Logs

All build activities are logged to files in the `logs` directory:
- **Format**: `build-log-YYYY-MM-DD-HHMM.txt`
- **Contents**: Detailed output from each build step
- **Usage**: Essential for troubleshooting build failures

## 🎯 Next Steps

After successfully building your APK:

1. **Test the app** on your Android device
2. **Report any issues** you encounter
3. **Consider setting up signing** for production releases
4. **Explore EAS Build** for automated cloud builds

## 📞 Support

If you encounter issues not covered in this guide:

1. **Check the build logs** in the `logs` folder
2. **Review the troubleshooting section** above
3. **Try the alternative EAS Build method**
4. **Consult Expo documentation**: https://docs.expo.dev/

---

**Note**: This guide is specifically for the OBD2-VDT project. The build process may vary for other Expo/React Native projects.