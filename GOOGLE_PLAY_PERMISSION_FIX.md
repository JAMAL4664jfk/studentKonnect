# Google Play Permission Fix - READ_MEDIA_IMAGES/READ_MEDIA_VIDEO

## Issue
Google Play rejected the app due to improper use of READ_MEDIA_IMAGES/READ_MEDIA_VIDEO permissions. The app only requires one-time or infrequent access to media files, which doesn't qualify for persistent media permissions under Google Play's Photo and Video Permissions policy.

## Solution
Removed all media library permission requests and configured the app to use the Android Photo Picker, which doesn't require READ_MEDIA_IMAGES/READ_MEDIA_VIDEO permissions on Android 13+ (API 33+).

## Changes Made

### 1. app.config.ts
- Added `expo-image-picker` plugin configuration with `photosPermission: false`
- This prevents expo-image-picker from automatically adding READ_MEDIA_IMAGES/READ_MEDIA_VIDEO permissions to the AndroidManifest.xml during build
- Camera permission is still enabled for taking photos

### 2. lib/image-picker-utils.ts
- Removed `requestMediaLibraryPermission()` function
- Updated `selectPhoto()` to use Android Photo Picker without requesting permissions
- Added documentation explaining that Android 13+ uses the photo picker which doesn't require permissions

### 3. app/chat-detail.tsx
- Removed `expo-media-library` import
- Removed `requestMediaLibraryPermissionsAsync()` call from `handleChooseMedia()`
- Changed "Download" button to "Share" button for images (sharing doesn't require permissions)
- Uses `expo-sharing` instead of `MediaLibrary.createAssetAsync()` for saving images

### 4. app/wallet-upload-id.tsx
- Removed `requestGalleryPermission()` function
- Removed permission check before launching image library

### 5. app/wallet-upload-profile-image.tsx
- Removed `requestMediaLibraryPermissionsAsync()` call
- Added comment explaining Android Photo Picker usage

### 6. app/wallet-upload-selfie.tsx
- Removed `requestGalleryPermission()` function
- Removed permission check before launching image library

## How It Works

### Android 13+ (API 33+)
The Android Photo Picker is automatically used when calling `ImagePicker.launchImageLibraryAsync()`. This is a system UI that allows users to select photos without granting the app persistent access to all media files. No permissions are required.

### Android 12 and below
The system file picker is used, which also doesn't require READ_MEDIA_IMAGES/READ_MEDIA_VIDEO permissions for one-time file selection.

## Testing
After building a new APK/AAB:
1. The AndroidManifest.xml should NOT contain READ_MEDIA_IMAGES or READ_MEDIA_VIDEO permissions
2. Image selection should work without requesting media permissions
3. Camera functionality should still work (CAMERA permission is still requested)
4. Users can share/save images using the system share sheet instead of direct gallery access

## Next Steps
1. Build a new APK/AAB using `eas build` or `expo build`
2. Verify the AndroidManifest.xml doesn't contain the problematic permissions
3. Test the app to ensure image selection still works
4. Submit the new build to Google Play

## References
- [Google Play Photo and Video Permissions Policy](https://support.google.com/googleplay/android-developer/answer/14115180)
- [Android Photo Picker](https://developer.android.com/training/data-storage/shared/photopicker)
- [Expo ImagePicker Documentation](https://docs.expo.dev/versions/latest/sdk/imagepicker/)
