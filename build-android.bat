@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Building Android APK locally...
echo ========================================

REM Step 1: Install Node.js dependencies
echo.
echo [1/6] Installing Node.js dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: npm install failed. Exiting.
    pause
    exit /b %errorlevel%
)
echo ✓ Dependencies installed successfully

REM Step 2: Clean any existing android directory to avoid conflicts
echo.
echo [2/6] Cleaning existing Android project...
if exist "android" (
    rmdir /s /q android
    echo ✓ Cleaned existing Android project
) else (
    echo ✓ No existing Android project to clean
)

REM Step 3: Generate native Android project files (prebuild)
echo.
echo [3/6] Generating native Android project files...
call npx expo prebuild --platform android --no-install --clean
if %errorlevel% neq 0 (
    echo ERROR: expo prebuild failed. Exiting.
    pause
    exit /b %errorlevel%
)
echo ✓ Native Android project generated

REM Step 4: Configure Android SDK location
echo.
echo [4/6] Configuring Android SDK location...

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

REM Step 5: Fix Gradle compatibility issues
echo.
echo [5/6] Fixing Gradle compatibility issues...

REM Update gradle wrapper to use a more stable version
echo Updating Gradle wrapper to version 8.10.2...
cd android
call gradlew wrapper --gradle-version 8.10.2 --distribution-type bin
if %errorlevel% neq 0 (
    echo WARNING: Failed to update Gradle wrapper, continuing with existing version...
)

REM Clean any cached build files
echo Cleaning build cache...
call gradlew clean
if %errorlevel% neq 0 (
    echo WARNING: Gradle clean failed, continuing...
)

echo ✓ Gradle compatibility fixes applied

REM Step 6: Build the APK
echo.
echo [6/6] Building Android APK...
echo This may take several minutes on first build...

REM Build debug APK (unsigned, for testing)
call gradlew assembleDebug --warning-mode all --no-daemon
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Gradle build failed.
    echo.
    echo Troubleshooting tips:
    echo 1. Ensure you have JDK 17 or higher installed
    echo 2. Check that Android SDK is properly installed
    echo 3. Try running: gradlew clean assembleDebug
    echo 4. Check the problems report for detailed errors
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