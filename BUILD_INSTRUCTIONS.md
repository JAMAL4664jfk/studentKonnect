# Build Instructions for Google Play Resubmission

## Overview
This document provides instructions for building a new APK/AAB after fixing the Google Play permission rejection issue.

## What Was Fixed
- Removed `READ_MEDIA_IMAGES` and `READ_MEDIA_VIDEO` permissions.
- Removed `READ_EXTERNAL_STORAGE` permission.
- Configured `expo-image-picker` to use Android Photo Picker (no permissions required).
- Updated all image selection code to work without media library permissions.
- **Latest Fix**: Removed `blockedPermissions` from `app.config.ts` which was causing manifest merger issues, and explicitly added `CAMERA` and `RECORD_AUDIO` to the permissions list to ensure they are correctly included.
- Version bumped to 1.5 (versionCode 7).

## Prerequisites
1. EAS CLI installed: `npm install -g eas-cli`
2. Logged into your Expo account: `eas login`
3. Project configured with EAS Build

## Build Commands

### Option 1: Build with EAS (Recommended)

#### For Production AAB (Google Play):
```bash
eas build --platform android --profile production
```

#### For Preview/Testing APK:
```bash
eas build --platform android --profile preview
```

### Option 2: Local Build with Expo

#### Generate Android project:
```bash
npx expo prebuild --platform android --clean
```

#### Build AAB locally:
```bash
cd android
./gradlew bundleRelease
```
The AAB will be at: `android/app/build/outputs/bundle/release/app-release.aab`

## Verify the Build

### 1. Check AndroidManifest.xml
After building, verify that the `AndroidManifest.xml` does NOT contain:
- `android.permission.READ_MEDIA_IMAGES`
- `android.permission.READ_MEDIA_VIDEO`
- `android.permission.READ_EXTERNAL_STORAGE`

And DOES contain:
- `android.permission.CAMERA`
- `android.permission.RECORD_AUDIO`

### 2. Test on Device
1. Install the APK on a test device.
2. Test image selection features:
   - Profile image upload
   - Chat image/video sending
   - Wallet ID upload
   - Wallet selfie upload
3. Verify that:
   - No permission dialogs appear for gallery access on Android 13+.
   - Image selection works using the system photo picker.
   - Camera still works (with permission prompt).

## Upload to Google Play

### Steps:
1. Go to [Google Play Console](https://play.google.com/console).
2. Select your app.
3. Navigate to "Production" or "Testing" track.
4. Click "Create new release".
5. Upload the new AAB file (**version 1.5, versionCode 7**).
6. Add release notes mentioning the permission fix:
   ```
   - Fixed Google Play policy compliance for photo/video permissions
   - Now uses Android Photo Picker for one-time media access
   - Improved privacy and security
   - Fixed permission configuration for camera and audio
   ```
7. Review and roll out the release.

## Important Notes

### Version Information:
- **App Version**: 1.5
- **Version Code**: 7
- **Package Name**: com.scholarfinhub.official

### Permissions Still Used:
- `CAMERA` (for taking photos)
- `RECORD_AUDIO` (for video recording/audio features)
- `POST_NOTIFICATIONS` (for push notifications)
- `INTERNET` (for network access)
- `ACCESS_NETWORK_STATE` (for checking connectivity)

## Troubleshooting

### If permissions still appear in manifest:
1. Clean the build: `npx expo prebuild --clean`
2. Remove `android/` and `ios/` folders.
3. Run prebuild again: `npx expo prebuild --platform android`
4. Rebuild the app.

### If EAS build fails:
1. Check your `eas.json` configuration.
2. Ensure all dependencies are properly installed.
3. Run `eas build:configure` to reconfigure if needed.
