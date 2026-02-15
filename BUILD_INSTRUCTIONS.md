# Build Instructions for Google Play Resubmission

## Overview
This document provides instructions for building a new APK/AAB after fixing the Google Play permission rejection issue.

## What Was Fixed
- Removed READ_MEDIA_IMAGES and READ_MEDIA_VIDEO permissions
- Configured expo-image-picker to use Android Photo Picker (no permissions required)
- Updated all image selection code to work without media library permissions
- Version bumped to 1.4 (versionCode 5)

## Prerequisites
1. EAS CLI installed: `npm install -g eas-cli`
2. Logged into your Expo account: `eas login`
3. Project configured with EAS Build

## Build Commands

### Option 1: Build with EAS (Recommended)

#### For Production APK:
```bash
eas build --platform android --profile production
```

#### For Production AAB (Google Play):
```bash
eas build --platform android --profile production --local=false
```

#### For Preview/Testing:
```bash
eas build --platform android --profile preview
```

### Option 2: Local Build with Expo

#### Generate Android project:
```bash
npx expo prebuild --platform android
```

#### Build APK locally:
```bash
cd android
./gradlew assembleRelease
```

The APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

#### Build AAB locally:
```bash
cd android
./gradlew bundleRelease
```

The AAB will be at: `android/app/build/outputs/bundle/release/app-release.aab`

## Verify the Build

### 1. Check AndroidManifest.xml
After building, extract the APK/AAB and verify that the AndroidManifest.xml does NOT contain:
- `android.permission.READ_MEDIA_IMAGES`
- `android.permission.READ_MEDIA_VIDEO`
- `android.permission.READ_EXTERNAL_STORAGE` (for media access)

### 2. Test on Device
1. Install the APK on a test device
2. Test image selection features:
   - Profile image upload
   - Chat image/video sending
   - Wallet ID upload
   - Wallet selfie upload
3. Verify that:
   - No permission dialogs appear for gallery access on Android 13+
   - Image selection works using the system photo picker
   - Camera still works (with permission prompt)

## Upload to Google Play

### Steps:
1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app
3. Navigate to "Production" or "Testing" track
4. Click "Create new release"
5. Upload the new AAB file (version 1.4, versionCode 5)
6. Add release notes mentioning the permission fix:
   ```
   - Fixed Google Play policy compliance for photo/video permissions
   - Now uses Android Photo Picker for one-time media access
   - Improved privacy and security
   ```
7. Review and roll out the release

## Important Notes

### Version Information:
- **App Version**: 1.4
- **Version Code**: 5
- **Package Name**: com.scholarfinhub.official

### What Changed:
- **app.config.ts**: Added expo-image-picker plugin configuration
- **lib/image-picker-utils.ts**: Removed media library permission requests
- **app/chat-detail.tsx**: Removed MediaLibrary usage, replaced with Sharing
- **app/wallet-upload-*.tsx**: Removed permission requests

### Permissions Still Used:
- CAMERA (for taking photos)
- POST_NOTIFICATIONS (for push notifications)
- INTERNET (for network access)
- ACCESS_NETWORK_STATE (for checking connectivity)

## Troubleshooting

### If permissions still appear in manifest:
1. Clean the build: `npx expo prebuild --clean`
2. Remove `android/` and `ios/` folders
3. Run prebuild again: `npx expo prebuild --platform android`
4. Rebuild the app

### If image selection doesn't work:
1. Ensure you're testing on Android 13+ for best experience
2. On older Android versions, the system picker is used (still no permissions required)
3. Check that expo-image-picker is up to date: `npx expo install expo-image-picker`

### If EAS build fails:
1. Check your eas.json configuration
2. Ensure all dependencies are properly installed
3. Run `eas build:configure` to reconfigure if needed

## Support
For issues with the build process, refer to:
- [Expo EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Expo ImagePicker Documentation](https://docs.expo.dev/versions/latest/sdk/imagepicker/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)

## Next Steps After Upload
1. Wait for Google Play review (typically 1-3 days)
2. Monitor the review status in Play Console
3. If approved, the app will be available to users
4. If rejected again, check the rejection reason and make necessary adjustments
