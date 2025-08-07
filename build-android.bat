@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Building Android APK locally...
echo ========================================

REM Step 1: Install Node.js dependencies
echo.
echo [1/5] Installing Node.js dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: npm install failed. Exiting.
    pause
    exit /b %errorlevel%
)
echo ✓ Dependencies installed successfully

REM Step 2: Generate native Android project files (prebuild)
echo.
echo [2/5] Generating native Android project files...
call npx expo prebuild --platform android --no-install
if %errorlevel% neq 0 (
    echo ERROR: expo prebuild failed. Exiting.
    pause
    exit /b %errorlevel%
)
echo ✓ Native Android project generated

REM Step 3: Configure Android SDK location
echo.
echo [3/5] Configuring Android SDK location...

REM Check if ANDROID_HOME is set
if defined ANDROID_HOME (
    echo Found ANDROID_HOME: %ANDROID_HOME%
    set SDK_PATH=%ANDROID_HOME%
) else (
    echo ANDROID_HOME not set, checking common locations...
    
    REM Check common Android SDK locations
    set SDK_PATH=
    if exist "C:\Users\%USERNAME%\AppData\Local\Android\Sdk" (
        set SDK_PATH=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
        echo Found Android SDK at: !SDK_PATH!
    ) else if exist "C:\Android\Sdk" (
        set SDK_PATH=C:\Android\Sdk
        echo Found Android SDK at: !SDK_PATH!
    ) else if exist "%LOCALAPPDATA%\Android\Sdk" (
        set SDK_PATH=%LOCALAPPDATA%\Android\Sdk
        echo Found Android SDK at: !SDK_PATH!
    ) else (
        echo ERROR: Android SDK not found in common locations.
        echo Please install Android Studio or set ANDROID_HOME environment variable.
        echo Common locations checked:
        echo   - C:\Users\%USERNAME%\AppData\Local\Android\Sdk
        echo   - C:\Android\Sdk
        echo   - %LOCALAPPDATA%\Android\Sdk
        pause
        exit /b 1
    )
)

REM Create local.properties file with SDK path
echo Creating android/local.properties...
echo sdk.dir=%SDK_PATH:\=\\% > android\local.properties
echo ✓ Android SDK configured

REM Step 4: Navigate to Android directory
echo.
echo [4/5] Preparing Android build environment...
cd android
if %errorlevel% neq 0 (
    echo ERROR: Could not find android directory. Exiting.
    pause
    exit /b %errorlevel%
)

REM Step 5: Build the APK
echo.
echo [5/5] Building Android APK...
echo This may take several minutes on first build...

REM Build debug APK (unsigned, for testing)
call gradlew assembleDebug
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Gradle build failed.
    echo.
    echo Troubleshooting tips:
    echo 1. Ensure you have JDK 17 or higher installed
    echo 2. Check that Android SDK is properly installed
    echo 3. Try running: gradlew clean assembleDebug
    echo.
    pause
    exit /b %errorlevel%
)

echo.
echo ========================================
echo ✓ Android APK build completed successfully!
echo ========================================
echo.
echo APK Location: android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo Note: This is a debug APK suitable for testing.
echo For production release, you'll need to configure signing and use 'assembleRelease'.
echo.

REM Go back to project root
cd ..

pause