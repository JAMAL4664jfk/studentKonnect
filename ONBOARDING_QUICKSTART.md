# Onboarding Flow - Quick Start Guide

## 🚀 How to Test the New Onboarding Flow

### Step 1: Start the App

```bash
cd /home/ubuntu/studentKonnect
npm start
```

### Step 2: Navigate to Onboarding

In your app, navigate to:
```
/onboarding/institution-select
```

Or add this to your `app/index.tsx`:
```typescript
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function Index() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace("/onboarding/institution-select");
  }, []);
  
  return null;
}
```

---

## 📱 Testing Scenarios

### Scenario 1: University Student (Quick Registration)

1. **Select Institution Type**
   - Tap "University" card (blue)
   
2. **Quick Registration**
   - Enter student number: `202412345`
   - Select university: "University of Cape Town"
   - Tap "Find My Profile"
   - Wait for lookup (simulated 1.5s delay)
   
3. **Full Registration** (auto-filled if profile found)
   - Verify pre-filled data
   - Enter email: `student@uct.ac.za`
   - Enter password: `Password123!`
   - Toggle biometric ON (if available)
   - Tap "Create Account"

### Scenario 2: TVET College Student (Manual Registration)

1. **Select Institution Type**
   - Tap "TVET College" card (teal)
   
2. **Quick Registration**
   - Enter student number: `987654`
   - Select college: "College of Cape Town"
   - Tap "Register Manually Instead"
   
3. **Full Registration** (manual entry)
   - Full name: `Jane Smith`
   - Student number: `987654`
   - Institution: "College of Cape Town"
   - Course: `N6 Electrical Engineering`
   - Year: `3rd Year`
   - Email: `jane@example.com`
   - Password: `SecurePass1!`
   - Tap "Create Account"

### Scenario 3: Staff Member

1. **Select Institution Type**
   - Tap "Staff" card (orange)
   
2. **Full Registration** (no quick registration)
   - Full name: `Dr. John Professor`
   - Institution: "University of Pretoria"
   - Email: `john.prof@up.ac.za`
   - Password: `StaffPass123!`
   - Toggle biometric ON
   - Tap "Create Account"

### Scenario 4: Parent

1. **Select Institution Type**
   - Tap "Parent" card (pink, full width)
   
2. **Full Registration**
   - Full name: `Mary Parent`
   - Institution: "Stellenbosch University"
   - Email: `mary.parent@gmail.com`
   - Password: `ParentPass1!`
   - Tap "Create Account"

---

## ✅ What to Check

### Visual Design
- [ ] Blue gradient background displays correctly
- [ ] Institution cards have correct colors
- [ ] Icons render properly
- [ ] Cards have shadows and rounded corners
- [ ] Text is readable on all backgrounds
- [ ] Buttons have proper styling

### Functionality
- [ ] Navigation between screens works
- [ ] Form inputs accept text
- [ ] Dropdowns show institution lists
- [ ] Password visibility toggle works
- [ ] Validation errors appear in real-time
- [ ] Toast messages display correctly
- [ ] Loading indicators show during async operations

### Biometric Authentication
- [ ] Biometric toggle only shows if hardware available
- [ ] Correct biometric type detected (Face ID/Fingerprint)
- [ ] Authentication prompt appears when enabled
- [ ] Success/failure handled gracefully
- [ ] Settings persist after app restart

### Error Handling
- [ ] Empty fields show validation errors
- [ ] Invalid email format rejected
- [ ] Weak passwords rejected
- [ ] Network errors handled gracefully
- [ ] Duplicate email handled by Supabase

---

## 🔧 Common Issues & Solutions

### Issue: Biometric not showing
**Solution**: Test on physical device, not simulator. Ensure device has biometric enrolled.

### Issue: Picker dropdown not working
**Solution**: 
```bash
npm install @react-native-picker/picker
npx expo prebuild --clean
```

### Issue: Navigation not working
**Solution**: Ensure routes are defined in `app/_layout.tsx`:
```typescript
<Stack.Screen name="onboarding/institution-select" options={{ headerShown: false }} />
<Stack.Screen name="onboarding/quick-registration" options={{ headerShown: false }} />
<Stack.Screen name="onboarding/full-registration" options={{ headerShown: false }} />
```

### Issue: Supabase errors
**Solution**: Check `.env` file has correct Supabase credentials:
```
SUPABASE_URL=https://ortjjekmexmyvkkotioo.supabase.co
SUPABASE_ANON_KEY=your_key_here
```

---

## 📊 Test Data

### Valid Test Accounts

| Type | Email | Password | Student # | Institution |
|------|-------|----------|-----------|-------------|
| University | `test@uct.ac.za` | `Test123!` | `202412345` | University of Cape Town |
| TVET | `student@cct.ac.za` | `Pass123!` | `987654` | College of Cape Town |
| College | `learner@boston.ac.za` | `Boston1!` | `555666` | Boston City Campus |
| Staff | `staff@up.ac.za` | `Staff123!` | N/A | University of Pretoria |
| Parent | `parent@gmail.com` | `Parent1!` | N/A | Stellenbosch University |

---

## 🎯 Success Criteria

✅ All 5 institution types selectable
✅ Quick registration flow works for students
✅ Full registration accepts all required fields
✅ Form validation prevents invalid submissions
✅ Biometric authentication setup works
✅ Supabase account created successfully
✅ User redirected to main app after signup
✅ Toast notifications display correctly
✅ All navigation flows work smoothly

---

## 📸 Screenshots to Capture

1. Institution selection screen
2. Quick registration with student number
3. Full registration form (all fields)
4. Biometric security toggle
5. Success toast message
6. Main app after successful signup

---

## 🚀 Next Steps After Testing

1. **Add to main navigation**: Update your auth flow to start with institution selection
2. **Customize institution lists**: Add/remove institutions based on your target market
3. **Connect to real API**: Replace mock student lookup with actual database query
4. **Add analytics**: Track which institution types are most popular
5. **Implement email verification**: Send verification email after signup
6. **Add profile completion**: Guide users to complete their profile after signup

---

## 📞 Need Help?

- Check `ONBOARDING_GUIDE.md` for detailed documentation
- Review individual screen files for implementation details
- Check `lib/biometric-auth.ts` for biometric functions
- Test on physical device for best results

---

**Happy Testing!** 🎉
