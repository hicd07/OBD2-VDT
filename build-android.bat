@echo off
setlocal enabledelayedexpansion

REM Change to the directory where this batch file is located
cd /d "%~dp0"

REM Verify we're in the correct project directory
if not exist "package.json" (
    echo [ERROR] package.json not found. This script must be run from the project root directory.
    echo Current directory: %CD%
    pause
    exit /b 1
)

if not exist "app.json" (
    echo [ERROR] app.json not found. This doesn't appear to be an Expo project.
    echo Current directory: %CD%
    pause
    exit /b 1
)

REM Set console properties for better visibility
title Building Android APK for OBD2-VDT Project
color 0A
mode con: cols=120 lines=40

REM Create logs directory if it doesn't exist
if not exist "logs" mkdir logs

REM Set log file with timestamp
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do set mydate=%%c-%%a-%%b
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do set mytime=%%a%%b
set mytime=%mytime: =0%
set LOGFILE=logs\build-log-%mydate%-%mytime%.txt

REM Function to log both to console and file
call :LOGINFO "========================================="
call :LOGINFO "Building Android APK for OBD2-VDT Project"
call :LOGINFO "Build started at: %date% %time%"
call :LOGINFO "Log file: %LOGFILE%"
call :LOGINFO "Project directory: %CD%"
call :LOGINFO "========================================="

REM Check prerequisites
call :LOGINFO ""
call :LOGINFO "[0/9] Checking prerequisites..."

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    call :LOGERROR "Node.js is not installed or not in PATH"
    call :LOGERROR "Please install Node.js from https://nodejs.org/"
    goto :ERROR_EXIT
) else (
    for /f "tokens=*" %%i in ('node --version') do call :LOGINFO "✓ Node.js version: %%i"
)

REM Check npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    call :LOGERROR "npm is not available"
    goto :ERROR_EXIT
) else (
    for /f "tokens=*" %%i in ('npm --version') do call :LOGINFO "✓ npm version: %%i"
)

REM Check if this is an Expo project
if not exist "package.json" (
    call :LOGERROR "package.json not found. Are you in the correct directory?"
    call :LOGERROR "Current directory: %CD%"
    goto :ERROR_EXIT
)

findstr /c:"expo" package.json >nul
if %errorlevel% neq 0 (
    call :LOGWARN "This doesn't appear to be an Expo project"
)

REM Check Java version
java -version >nul 2>&1
if %errorlevel% neq 0 (
    call :LOGWARN "Java not found in PATH. You may need to install JDK 17+ for Gradle builds"
) else (
    call :LOGINFO "✓ Java is available"
)

call :LOGINFO "✓ Prerequisites check completed"

REM Step 1: Install Node.js dependencies
call :LOGINFO ""
call :LOGINFO "[1/9] Installing Node.js dependencies..."
call :LOGINFO "Running: npm install"

npm install >>"%LOGFILE%" 2>&1
if %errorlevel% neq 0 (
    call :LOGERROR "npm install failed. Check the log file for details: %LOGFILE%"
    call :LOGERROR "Common solutions:"
    call :LOGERROR "  - Clear npm cache: npm cache clean --force"
    call :LOGERROR "  - Delete node_modules and try again"
    call :LOGERROR "  - Check internet connection"
    goto :ERROR_EXIT
)
call :LOGINFO "✓ Dependencies installed successfully"

REM Step 2: Clean Expo cache and prebuilds
call :LOGINFO ""
call :LOGINFO "[2/9] Cleaning Expo cache and prebuilds..."
call :LOGINFO "Running: npx expo clean"

npx expo clean >>"%LOGFILE%" 2>&1
if %errorlevel% neq 0 (
    call :LOGWARN "expo clean failed, continuing anyway..."
    call :LOGWARN "This may cause issues with cached files"
) else (
    call :LOGINFO "✓ Expo cache cleaned successfully"
)

REM Step 3: Clean any existing android directory to avoid conflicts
call :LOGINFO ""
call :LOGINFO "[3/9] Cleaning existing Android project..."
if exist "android" (
    call :LOGINFO "Removing existing android directory..."
    rmdir /s /q android >>"%LOGFILE%" 2>&1
    if exist "android" (
        call :LOGERROR "Failed to remove android directory. It may be in use."
        call :LOGERROR "Please close Android Studio and any file explorers, then try again."
        goto :ERROR_EXIT
    )
    call :LOGINFO "✓ Cleaned existing Android project"
) else (
    call :LOGINFO "✓ No existing Android project to clean"
)

REM Step 4: Generate native Android project files (prebuild)
call :LOGINFO ""
call :LOGINFO "[4/9] Generating native Android project files..."
call :LOGINFO "Running: npx expo prebuild --platform android --no-install --clean"

npx expo prebuild --platform android --no-install --clean >>"%LOGFILE%" 2>&1
if %errorlevel% neq 0 (
    call :LOGERROR "expo prebuild failed. Check the log file for details: %LOGFILE%"
    call :LOGERROR "Common solutions:"
    call :LOGERROR "  - Ensure you have the latest Expo CLI: npm install -g @expo/cli"
    call :LOGERROR "  - Check your app.json/app.config.js configuration"
    call :LOGERROR "  - Try: npx expo install --fix"
    goto :ERROR_EXIT
)
call :LOGINFO "✓ Native Android project generated"

REM Step 5: Configure Android SDK location
call :LOGINFO ""
call :LOGINFO "[5/9] Configuring Android SDK location..."

REM Check if ANDROID_HOME is set
if defined ANDROID_HOME (
    call :LOGINFO "Found ANDROID_HOME: %ANDROID_HOME%"
    set SDK_PATH=%ANDROID_HOME%
    
    REM Verify the SDK path exists
    if not exist "%ANDROID_HOME%" (
        call :LOGWARN "ANDROID_HOME points to non-existent directory: %ANDROID_HOME%"
        set SDK_PATH=
    )
) else (
    call :LOGINFO "ANDROID_HOME not set, checking common locations..."
    set SDK_PATH=
)

REM If ANDROID_HOME is not set or invalid, check common locations
if not defined SDK_PATH (
    if exist "C:\Users\%USERNAME%\AppData\Local\Android\Sdk" (
        set SDK_PATH=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
        call :LOGINFO "Found Android SDK at: !SDK_PATH!"
    ) else if exist "C:\Android\Sdk" (
        set SDK_PATH=C:\Android\Sdk
        call :LOGINFO "Found Android SDK at: !SDK_PATH!"
    ) else if exist "%LOCALAPPDATA%\Android\Sdk" (
        set SDK_PATH=%LOCALAPPDATA%\Android\Sdk
        call :LOGINFO "Found Android SDK at: !SDK_PATH!"
    ) else if exist "D:\Android\Sdk" (
        set SDK_PATH=D:\Android\Sdk
        call :LOGINFO "Found Android SDK at: !SDK_PATH!"
    ) else (
        call :LOGERROR "Android SDK not found in common locations."
        call :LOGERROR "Please install Android Studio or set ANDROID_HOME environment variable."
        call :LOGERROR "Common locations checked:"
        call :LOGERROR "  - C:\Users\%USERNAME%\AppData\Local\Android\Sdk"
        call :LOGERROR "  - C:\Android\Sdk"
        call :LOGERROR "  - %LOCALAPPDATA%\Android\Sdk"
        call :LOGERROR "  - D:\Android\Sdk"
        call :LOGERROR ""
        call :LOGERROR "To fix this:"
        call :LOGERROR "  1. Install Android Studio from https://developer.android.com/studio"
        call :LOGERROR "  2. Or set ANDROID_HOME environment variable to your SDK location"
        goto :ERROR_EXIT
    )
)

REM Verify essential SDK components
if not exist "%SDK_PATH%\platform-tools" (
    call :LOGWARN "Android SDK platform-tools not found. Please install via Android Studio SDK Manager."
)

if not exist "%SDK_PATH%\build-tools" (
    call :LOGWARN "Android SDK build-tools not found. Please install via Android Studio SDK Manager."
)

REM Create local.properties file with SDK path
call :LOGINFO "Creating android/local.properties..."
echo sdk.dir=%SDK_PATH:\=\\% > android\local.properties >>"%LOGFILE%" 2>&1
if exist "android\local.properties" (
    call :LOGINFO "✓ Android SDK configured successfully"
    call :LOGINFO "SDK Path: %SDK_PATH%"
) else (
    call :LOGERROR "Failed to create local.properties file"
    goto :ERROR_EXIT
)

REM Step 6: Check and fix Gradle compatibility issues
call :LOGINFO ""
call :LOGINFO "[6/9] Checking and fixing Gradle compatibility issues..."
call :LOGINFO "Changing to android directory: %CD%\android"

cd android
if %errorlevel% neq 0 (
    call :LOGERROR "Failed to change to android directory"
    call :LOGERROR "Current directory: %CD%"
    goto :ERROR_EXIT
)

REM Verify Gradle wrapper exists
if not exist "gradlew.bat" (
    call :LOGERROR "gradlew.bat not found in android directory"
    call :LOGERROR "This indicates the prebuild step may have failed"
    call :LOGERROR "Current android directory contents:"
    dir >>"%LOGFILE%" 2>&1
    call :LOGERROR ""
    call :LOGERROR "SOLUTION: The prebuild step likely failed. Try:"
    call :LOGERROR "1. Go back to project root: cd .."
    call :LOGERROR "2. Run: npx expo prebuild --platform android --clean"
    call :LOGERROR "3. Check if android/gradlew.bat is created"
    call :LOGERROR "4. If still failing, try: npx expo run:android"
    cd ..
    goto :ERROR_EXIT
) else (
    call :LOGINFO "✓ Found gradlew.bat in android directory"
)

REM Check current Gradle version
if exist "gradle\wrapper\gradle-wrapper.properties" (
    call :LOGINFO "Current Gradle wrapper configuration:"
    type "gradle\wrapper\gradle-wrapper.properties" >>"%LOGFILE%" 2>&1
) else (
    call :LOGWARN "gradle-wrapper.properties not found"
)

REM Update gradle wrapper to use a stable version
call :LOGINFO "Updating Gradle wrapper to version 8.0.2 (compatible with JDK 17+)..."
call gradlew.bat wrapper --gradle-version 8.0.2 --distribution-type bin >>"%LOGFILE%" 2>&1
if %errorlevel% neq 0 (
    call :LOGWARN "Failed to update Gradle wrapper, continuing with existing version..."
    call :LOGWARN "You may need to update manually if build fails"
) else (
    call :LOGINFO "✓ Gradle wrapper updated successfully"
)

REM Clean any cached build files
call :LOGINFO "Cleaning Gradle build cache..."
call gradlew.bat clean >>"%LOGFILE%" 2>&1
if %errorlevel% neq 0 (
    call :LOGWARN "Gradle clean failed, continuing anyway..."
) else (
    call :LOGINFO "✓ Gradle cache cleaned"
)

call :LOGINFO "✓ Gradle compatibility fixes applied"

REM Step 7: Check Gradle daemon and system info
call :LOGINFO ""
call :LOGINFO "[7/9] Checking Gradle daemon and system info..."

call :LOGINFO "Stopping any existing Gradle daemons..."
call gradlew.bat --stop >>"%LOGFILE%" 2>&1

call :LOGINFO "System information:"
call gradlew.bat --version >>"%LOGFILE%" 2>&1

call :LOGINFO "✓ Gradle system check completed"

    call :LOGERROR "Android directory contents:"
    dir >>"%LOGFILE%" 2>&1
    goto :ERROR_EXIT
)
call :LOGINFO "Running: gradlew.bat assembleDebug --info --warning-mode all --no-daemon --stacktrace"
REM Check multiple possible APK locations
set APK_PATH=
if exist "app\build\outputs\apk\debug\app-debug.apk" (
    set APK_PATH=app\build\outputs\apk\debug\app-debug.apk
    call :LOGINFO "Found APK at: app\build\outputs\apk\debug\app-debug.apk"
) else if exist "app\build\outputs\apk\app-debug.apk" (
    set APK_PATH=app\build\outputs\apk\app-debug.apk
    call :LOGINFO "Found APK at: app\build\outputs\apk\app-debug.apk"
) else if exist "build\outputs\apk\debug\app-debug.apk" (
    set APK_PATH=build\outputs\apk\debug\app-debug.apk
    call :LOGINFO "Found APK at: build\outputs\apk\debug\app-debug.apk"
) else (
    call :LOGINFO "APK not found in standard locations, searching entire android directory..."
    call :LOGINFO "Searching for *.apk files..."
    for /r . %%f in (*.apk) do (
        if exist "%%f" (
            set APK_PATH=%%f
            call :LOGINFO "Found APK at: %%f"
            goto :APK_FOUND
        )
    )
    call :LOGINFO "No APK files found anywhere in android directory"
    call :LOGINFO "This suggests the Gradle build actually failed despite exit code 0"
)

:APK_FOUND
if exist "%APK_PATH%" (
    call :LOGINFO ""
    call :LOGINFO "========================================="
    call :LOGINFO "✓ ANDROID APK BUILD COMPLETED SUCCESSFULLY!"
    call :LOGINFO "========================================="
    call :LOGINFO ""
    call :LOGINFO "APK Location: android\%APK_PATH%"
    
    REM Get APK file size
    for %%A in ("%APK_PATH%") do (
        set APK_SIZE=%%~zA
        call :LOGINFO "APK Size: !APK_SIZE! bytes"
    )
    
    call :LOGINFO ""
    call :LOGINFO "INSTALLATION INSTRUCTIONS:"
    call :LOGINFO "1. Enable 'Developer options' on your Android device"
    call :LOGINFO "2. Enable 'USB debugging' in Developer options"
    call :LOGINFO "3. Connect your device via USB"
    call :LOGINFO "4. Install using ADB:"
    call :LOGINFO "   adb install android\%APK_PATH%"
    call :LOGINFO ""
    call :LOGINFO "OR transfer the APK file to your device and install manually"
    call :LOGINFO "(You may need to enable 'Install from unknown sources')"
    call :LOGINFO ""
    call :LOGINFO "NOTE: This is a DEBUG APK suitable for testing only."
    call :LOGINFO "For production release, configure signing and use 'assembleRelease'."
    call :LOGINFO ""
    call :LOGINFO "Build log saved to: %LOGFILE%"
    call :LOGINFO "Build completed at: %date% %time%"
    call :LOGINFO ""
) else (
    call :LOGERROR "Build reported success but APK file not found"
    call :LOGERROR "This indicates the Gradle build actually failed"
    call :LOGERROR ""
    call :LOGERROR "Searched locations:"
    call :LOGERROR "  - app\build\outputs\apk\debug\app-debug.apk"
    call :LOGERROR "  - app\build\outputs\apk\app-debug.apk"
    call :LOGERROR "  - build\outputs\apk\debug\app-debug.apk"
    call :LOGERROR ""
    call :LOGERROR "Android directory structure:"
    dir /s >>"%LOGFILE%" 2>&1
    call :LOGERROR "Check the log file for full directory listing: %LOGFILE%"
    call :LOGERROR ""
    call :LOGERROR "RECOMMENDED SOLUTION:"
    call :LOGERROR "Use EAS Build instead for reliable cloud-based building:"
    call :LOGERROR "  npx eas build --platform android --profile preview"
    
    goto :ERROR_EXIT
)

cd ..
goto :SUCCESS_EXIT

REM =============================================================================
REM FUNCTIONS
REM =============================================================================

:LOGINFO
echo %~1
echo [%date% %time%] INFO: %~1 >> "%LOGFILE%"
goto :eof

:LOGWARN
echo [WARNING] %~1
echo [%date% %time%] WARN: %~1 >> "%LOGFILE%"
goto :eof

:LOGERROR
echo [ERROR] %~1
echo [%date% %time%] ERROR: %~1 >> "%LOGFILE%"
goto :eof
