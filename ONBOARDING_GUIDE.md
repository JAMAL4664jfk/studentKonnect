# StudentKonnect Onboarding Flow Guide

## Overview

A complete, multi-step onboarding flow for StudentKonnect that supports different user types (University students, TVET students, College students, Staff, and Parents) with optional biometric authentication.

---

## 🎯 Features

### 1. Institution Type Selection
- **5 User Types**: University, TVET College, College, Staff, Parent
- **Visual Cards**: Each type has a unique color, icon, and feature list
- **Responsive Grid**: 2-column layout (except Parent which spans full width)
- **Hero Banner**: "Connecting More Than 300 Million Students"

### 2. Quick Registration (Students Only)
- **Student Number Lookup**: Enter student number to find existing profile
- **Institution Selector**: Dropdown with 15+ universities, 12+ TVET colleges, 10+ private colleges
- **Profile Matching**: Simulates API call to find student in database
- **Fallback**: If profile not found, redirects to full registration

### 3. Full Registration
- **Dynamic Fields**: Changes based on institution type
  - Students: Full name, student number, institution, course, year, email, password
  - Staff: Full name, institution, email, password (no student number/course)
  - Parents: Full name, institution, email, password (no student number/course)
- **Validation**: Real-time form validation with error messages
- **Password Requirements**: 8+ characters, 1 number, 1 special character
- **Biometric Security**: Optional fingerprint/face recognition setup

### 4. Biometric Authentication
- **Hardware Detection**: Checks if device supports biometric
- **Type Detection**: Identifies Face ID, Fingerprint, or Iris
- **Secure Storage**: Saves biometric preference in AsyncStorage
- **Login Integration**: Allows quick login with biometric

---

## 📁 File Structure

```
app/
├── onboarding/
│   ├── institution-select.tsx    # Step 1: Choose institution type
│   ├── quick-registration.tsx    # Step 2: Quick lookup (students)
│   └── full-registration.tsx     # Step 3: Complete registration
lib/
└── biometric-auth.ts             # Biometric authentication helper
```

---

## 🚀 User Flow

### For Students (University/TVET/College)

1. **Start** → `/onboarding/institution-select`
2. **Select Type** → University/TVET/College
3. **Quick Registration** → `/onboarding/quick-registration`
   - Enter student number
   - Select institution
   - Click "Find My Profile"
4. **Profile Found?**
   - ✅ Yes → Auto-fill data → Full Registration
   - ❌ No → Manual entry → Full Registration
5. **Full Registration** → `/onboarding/full-registration`
   - Fill all required fields
   - Enable biometric (optional)
   - Create account
6. **Success** → Navigate to `/(tabs)`

### For Staff/Parents

1. **Start** → `/onboarding/institution-select`
2. **Select Type** → Staff or Parent
3. **Full Registration** → `/onboarding/full-registration` (skip quick registration)
   - Fill required fields (no student number/course)
   - Enable biometric (optional)
   - Create account
4. **Success** → Navigate to `/(tabs)`

---

## 🎨 Design Specifications

### Colors by Institution Type

| Type | Color | Hex Code |
|------|-------|----------|
| University | Blue | `#3b82f6` |
| TVET College | Teal | `#14b8a6` |
| College | Brown | `#a16207` |
| Staff | Orange | `#ea580c` |
| Parent | Pink | `#db2777` |

### Screen Layout

- **Background**: Blue gradient (`#1e3a8a` → `#3b82f6` → `#60a5fa`)
- **Cards**: White with 95% opacity, rounded corners (24px), shadow
- **Buttons**: Primary color, rounded (12px), bold text
- **Inputs**: White background, 2px border, rounded (12px), icon on left

---

## 🔐 Biometric Authentication

### Setup Process

1. **Check Availability**
   ```typescript
   const capability = await checkBiometricCapability();
   ```

2. **Enable During Registration**
   ```typescript
   if (biometricEnabled && biometricAvailable) {
     await enableBiometricAuth(email);
   }
   ```

3. **Login with Biometric**
   ```typescript
   const result = await loginWithBiometric();
   if (result.success) {
     // Auto-login with stored email
   }
   ```

### Security Features

- ✅ Hardware-backed authentication
- ✅ Fallback to password if biometric fails
- ✅ Secure storage with AsyncStorage
- ✅ User email encryption
- ✅ Re-authentication required for sensitive actions

---

## 📝 Form Validation

### Full Name
- ✅ Required
- ✅ Minimum 2 characters
- ❌ Error: "Full name must be at least 2 characters"

### Student Number (Students Only)
- ✅ Required
- ✅ Minimum 5 characters
- ✅ Numeric only
- ❌ Error: "Student number must be at least 5 characters"

### Institution
- ✅ Required
- ✅ Must select from dropdown
- ❌ Error: "Please select an institution"

### Course/Program (Students Only)
- ✅ Required
- ✅ Minimum 2 characters
- ❌ Error: "Course/Program must be at least 2 characters"

### Year of Study (Students Only)
- ✅ Required
- ✅ Must select from dropdown
- ❌ Error: "Please select year of study"

### Email
- ✅ Required
- ✅ Valid email format (regex: `/\S+@\S+\.\S+/`)
- ❌ Error: "Invalid email format"

### Password
- ✅ Required
- ✅ Minimum 8 characters
- ✅ At least 1 number
- ✅ At least 1 special character (`!@#$%^&*`)
- ❌ Error: "Password must contain at least 1 number and 1 special character"

---

## 🗄️ Database Integration

### User Metadata Stored in Supabase Auth

```typescript
{
  full_name: string,
  student_number?: string,
  institution_type: "university" | "tvet_college" | "college" | "staff" | "parent",
  institution_name: string,
  course_program?: string,
  year_of_study?: string,
  biometric_enabled: boolean,
  terms_accepted: true,
  terms_accepted_at: ISO timestamp
}
```

### Quick Lookup (Mock Implementation)

Currently simulates API call. In production, replace with:

```typescript
const { data, error } = await supabase
  .from('student_profiles')
  .select('*')
  .eq('student_number', studentNumber)
  .eq('institution', institutionName)
  .single();
```

---

## 📦 Dependencies

### Required Packages

```json
{
  "expo-local-authentication": "^14.0.0",
  "@react-native-picker/picker": "^2.6.0",
  "@react-native-async-storage/async-storage": "^1.21.0",
  "expo-linear-gradient": "^12.7.0",
  "react-native-toast-message": "^2.2.0"
}
```

### Installation

```bash
npm install expo-local-authentication @react-native-picker/picker
```

---

## 🧪 Testing Checklist

### Institution Selection Screen
- [ ] All 5 institution cards display correctly
- [ ] Colors match design specifications
- [ ] Icons render properly
- [ ] Tapping card navigates to correct screen
- [ ] "Sign In" link works
- [ ] Responsive on different screen sizes

### Quick Registration Screen
- [ ] Student number input accepts numeric only
- [ ] Institution dropdown shows correct list
- [ ] "Find My Profile" button triggers lookup
- [ ] Loading indicator shows during lookup
- [ ] Success/error toasts display correctly
- [ ] "Register Manually Instead" link works
- [ ] "Back to Options" returns to previous screen

### Full Registration Screen
- [ ] All fields render based on institution type
- [ ] Real-time validation works
- [ ] Error messages display correctly
- [ ] Password visibility toggle works
- [ ] Biometric toggle appears if available
- [ ] Form submission creates Supabase account
- [ ] Success toast and navigation work
- [ ] Pre-filled data from quick lookup displays

### Biometric Authentication
- [ ] Hardware detection works
- [ ] Biometric type identified correctly
- [ ] Toggle enables/disables biometric
- [ ] Authentication prompt appears
- [ ] Success/failure handled correctly
- [ ] Fallback to password works
- [ ] Settings persist across app restarts

---

## 🔧 Configuration

### Institution Lists

Update institution lists in each file:
- `institution-select.tsx` (features only)
- `quick-registration.tsx` (full lists)
- `full-registration.tsx` (full lists)

### Supabase Integration

Ensure `.env` has:
```
SUPABASE_URL=https://ortjjekmexmyvkkotioo.supabase.co
SUPABASE_ANON_KEY=your_anon_key
```

### Navigation

Update `app/_layout.tsx` to include onboarding routes:
```typescript
<Stack.Screen name="onboarding/institution-select" options={{ headerShown: false }} />
<Stack.Screen name="onboarding/quick-registration" options={{ headerShown: false }} />
<Stack.Screen name="onboarding/full-registration" options={{ headerShown: false }} />
```

---

## 🎬 Getting Started

### 1. Navigate to Onboarding

```typescript
router.push("/onboarding/institution-select");
```

### 2. Or Set as Initial Route

In `app/index.tsx`:
```typescript
export default function Index() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace("/onboarding/institution-select");
  }, []);
  
  return null;
}
```

---

## 🐛 Troubleshooting

### Biometric Not Working

1. Check device has biometric hardware
2. Ensure user has enrolled fingerprint/face
3. Verify permissions in `app.json`:
   ```json
   {
     "expo": {
       "plugins": [
         [
           "expo-local-authentication",
           {
             "faceIDPermission": "Allow $(PRODUCT_NAME) to use Face ID."
           }
         ]
       ]
     }
   }
   ```

### Picker Not Showing

1. Install `@react-native-picker/picker`
2. Rebuild app: `npx expo prebuild --clean`
3. Restart development server

### Navigation Issues

1. Ensure all routes are defined in `_layout.tsx`
2. Check `expo-router` is properly configured
3. Verify screen names match file paths

---

## 📈 Future Enhancements

- [ ] Add email verification step
- [ ] Implement actual student profile API
- [ ] Add profile photo upload
- [ ] Support multiple languages
- [ ] Add terms & conditions checkbox
- [ ] Implement social login (Google, Facebook)
- [ ] Add progress indicator across steps
- [ ] Support dark mode
- [ ] Add accessibility features
- [ ] Implement analytics tracking

---

## 📞 Support

For issues or questions:
- Check GitHub Issues
- Review Expo documentation
- Test on physical device for biometric features

---

**Created**: January 24, 2026
**Version**: 1.0.0
**Author**: StudentKonnect Team
