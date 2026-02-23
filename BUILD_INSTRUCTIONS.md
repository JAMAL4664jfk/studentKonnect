# Build Instructions for Google Play Resubmission

## Overview
This document provides instructions for building a new AAB after fixing Google Play permission issues.

## What Was Fixed (v1.8 — versionCode 9)

### Permissions Blocked (via `blockedPermissions` in `app.config.ts`)
- `android.permission.SYSTEM_ALERT_WINDOW` — Restricted permission injected by `expo-dev-client`; not required for production.
- `android.permission.WRITE_EXTERNAL_STORAGE` — Deprecated on Android 10+; not needed.
- `android.permission.READ_EXTERNAL_STORAGE` — Deprecated; app uses Android Photo Picker instead.
- `android.permission.USE_FINGERPRINT` — Deprecated; replaced by `USE_BIOMETRIC`.

### Dependency Change
- Moved `expo-dev-client` from `dependencies` to `devDependencies` in `package.json`.
  This prevents `expo-dev-client` from injecting `SYSTEM_ALERT_WINDOW` into production builds.

### Version Bump
- Version: `1.5` → `1.8`
- versionCode: `7` → `9`

### Previous Fixes (still in place)
- Removed `READ_MEDIA_IMAGES` and `READ_MEDIA_VIDEO` permissions.
- Configured `expo-image-picker` with `photosPermission: false` (uses Android Photo Picker).
- `targetSdkVersion` explicitly set to `35`.

---

## Prerequisites

1. EAS CLI installed: `npm install -g eas-cli`
2. Logged into your Expo account: `eas login`
3. Project configured with EAS Build

---

## Build Commands

### Option 1: Build with EAS (Recommended)

#### For Production AAB (Google Play):
```bash
eas build --platform android --profile production
```

#### For Preview/Testing AAB:
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

---

## Verify the Build

### 1. Check AndroidManifest.xml

After `expo prebuild`, verify that `android/app/src/main/AndroidManifest.xml` does **NOT** contain:
- `android.permission.SYSTEM_ALERT_WINDOW`
- `android.permission.WRITE_EXTERNAL_STORAGE`
- `android.permission.READ_EXTERNAL_STORAGE`
- `android.permission.USE_FINGERPRINT`
- `android.permission.READ_MEDIA_IMAGES`
- `android.permission.READ_MEDIA_VIDEO`

And **DOES** contain:
- `android.permission.CAMERA`
- `android.permission.RECORD_AUDIO`
- `android.permission.USE_BIOMETRIC`
- `android.permission.POST_NOTIFICATIONS`

### 2. Test on Device

1. Install the APK on a test device.
2. Test image selection features (profile image, wallet ID upload, selfie upload).
3. Test camera functionality.
4. Test audio recording.
5. Test biometric authentication (fingerprint/face).
6. Verify no unexpected permission dialogs appear.

---

## Upload to Google Play

1. Go to [Google Play Console](https://play.google.com/console).
2. Select your app.
3. Navigate to "Production" or "Testing" track.
4. Click "Create new release".
5. Upload the new AAB file (**version 1.8, versionCode 9**).
6. Add release notes:
   ```
   v1.8 - Permission compliance fixes:
   - Removed SYSTEM_ALERT_WINDOW (development-only permission)
   - Removed deprecated WRITE_EXTERNAL_STORAGE and READ_EXTERNAL_STORAGE
   - Removed deprecated USE_FINGERPRINT (USE_BIOMETRIC is used instead)
   - Improved Google Play policy compliance
   ```

---

## Permissions Reference

| Permission | Status | Reason |
|---|---|---|
| INTERNET | Included | Required for all network calls |
| ACCESS_NETWORK_STATE | Included | Required for connectivity checks |
| CAMERA | Included | Profile photos, wallet KYC |
| RECORD_AUDIO | Included | Voice calls, podcasts |
| POST_NOTIFICATIONS | Included | Push notifications |
| USE_BIOMETRIC | Included | Biometric login |
| VIBRATE | Included | Haptic feedback |
| FOREGROUND_SERVICE | Included | Audio/video playback |
| FOREGROUND_SERVICE_MEDIA_PLAYBACK | Included | Background media |
| MODIFY_AUDIO_SETTINGS | Included | Audio routing |
| WAKE_LOCK | Included | Keep screen on during calls |
| RECEIVE_BOOT_COMPLETED | Included | Scheduled notifications |
| SYSTEM_ALERT_WINDOW | BLOCKED | Dev-only; not allowed in production |
| WRITE_EXTERNAL_STORAGE | BLOCKED | Deprecated on Android 10+ |
| READ_EXTERNAL_STORAGE | BLOCKED | Deprecated; use Photo Picker |
| USE_FINGERPRINT | BLOCKED | Deprecated; USE_BIOMETRIC used instead |

---

## Troubleshooting

### If blocked permissions still appear in manifest:
1. Clean the build: `npx expo prebuild --clean`
2. Remove `android/` folder completely.
3. Run prebuild again: `npx expo prebuild --platform android`
4. Rebuild the app.

### If EAS build fails:
1. Check your `eas.json` configuration.
2. Ensure all dependencies are properly installed: `pnpm install`
3. Run `eas build:configure` to reconfigure if needed.

### Version Information:
- **App Version**: 1.8
- **Version Code**: 9
- **Package Name**: com.scholarfinhub.official
