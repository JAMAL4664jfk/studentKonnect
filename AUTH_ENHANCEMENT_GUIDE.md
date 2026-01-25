# Authentication Enhancement Guide

## Overview
This document describes the enhanced authentication system for StudentKonnect with comprehensive South African institutions support, improved validation, and better UX.

---

## ✅ What's Been Implemented

### 1. **StudentKonnect Logo Integration**
- Logo added to `assets/images/student-konnect-logo.png`
- Displayed prominently on both signin and signup screens
- 128x128px with proper scaling

### 2. **Comprehensive SA Institutions Database**
- **26 Universities** (Traditional + Universities of Technology)
- **50+ TVET Colleges** (All 9 provinces covered)
- Each institution includes:
  - Full name
  - Short name
  - Logo URL
  - Type (university/tvet)
- File: `constants/sa-institutions-with-logos.ts`

### 3. **Enhanced Signup Form**
New fields added:
- ✅ **Full Name** (min 2 characters)
- ✅ **Email** (with validation)
- ✅ **Phone Number** (SA format: +27 + 9 digits)
- ✅ **Student Number** (min 5 characters)
- ✅ **Institution** (scrollable picker with logos and search)
- ✅ **Course/Program** (free text)
- ✅ **Year of Study** (1, 2, 3, 4+ buttons)
- ✅ **Password** (strong validation)
- ✅ **Confirm Password** (must match)

### 4. **Password Validation**
Requirements:
- Minimum 8 characters
- At least 1 number
- At least 1 special character (!@#$%^&*(),.?":{}|<>)
- Real-time validation with error messages

### 5. **Phone Number Handling**
- Country code: **+27** (South Africa)
- Format: User enters 10 digits starting with 0 (e.g., 0812345678)
- Stored as: E.164 format (+27812345678)
- Validation: Checks for valid SA phone number format

### 6. **Institution Picker**
- Modal with scrollable list
- Search functionality (by name or short name)
- Institution logos displayed
- Selected institution shown with checkmark
- Clean, modern UI

### 7. **Improved UX**
- Show/hide password toggles
- Real-time validation errors
- Loading states
- Toast notifications
- Keyboard-aware scrolling
- Gradient background
- Clean card-based layout

---

## 🗄️ Database Schema Updates

### Required SQL Migration

Run this in **Supabase SQL Editor**:

```sql
-- Add email and phone_number columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS institution_id TEXT;

-- Add unique constraint on email
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_unique 
ON profiles(email) WHERE email IS NOT NULL;

-- Add index on phone_number
CREATE INDEX IF NOT EXISTS profiles_phone_number_idx 
ON profiles(phone_number) WHERE phone_number IS NOT NULL;

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Function to sync user data from auth.users to profiles
CREATE OR REPLACE FUNCTION sync_user_email()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (
    id, 
    email, 
    full_name, 
    phone_number, 
    student_id, 
    institution_id, 
    institution_name, 
    course_program, 
    year_of_study
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone_number',
    NEW.raw_user_meta_data->>'student_id',
    NEW.raw_user_meta_data->>'institution_id',
    NEW.raw_user_meta_data->>'institution_name',
    NEW.raw_user_meta_data->>'course_program',
    NEW.raw_user_meta_data->>'year_of_study'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    phone_number = COALESCE(EXCLUDED.phone_number, profiles.phone_number),
    student_id = COALESCE(EXCLUDED.student_id, profiles.student_id),
    institution_id = COALESCE(EXCLUDED.institution_id, profiles.institution_id),
    institution_name = COALESCE(EXCLUDED.institution_name, profiles.institution_name),
    course_program = COALESCE(EXCLUDED.course_program, profiles.course_program),
    year_of_study = COALESCE(EXCLUDED.year_of_study, profiles.year_of_study);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-sync on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION sync_user_email();

-- Backfill existing users
UPDATE profiles
SET email = auth.users.email
FROM auth.users
WHERE profiles.id = auth.users.id
AND profiles.email IS NULL;
```

### Updated Profiles Table Schema

```typescript
interface Profile {
  id: string;                    // UUID from auth.users
  email: string;                 // NEW: User email
  phone_number: string;          // NEW: +27... format
  full_name: string;             // User's full name
  student_id: string;            // Student number
  institution_id: string;        // NEW: Institution ID from constants
  institution_name: string;      // Institution full name
  course_program: string;        // Course/Program name
  year_of_study: string;         // "1", "2", "3", "4+"
  avatar_url?: string;           // Profile picture
  bio?: string;                  // User bio
  created_at: string;            // Timestamp
  updated_at: string;            // Timestamp
}
```

---

## 📋 Implementation Checklist

### ✅ Completed
- [x] Create SA institutions database with logos
- [x] Add StudentKonnect logo to assets
- [x] Redesign auth screen with modern UI
- [x] Add email field with validation
- [x] Add phone number field with +27 country code
- [x] Add confirm password field
- [x] Implement strong password validation
- [x] Create scrollable institution picker with search
- [x] Add show/hide password toggles
- [x] Implement real-time form validation
- [x] Create SQL migration script

### ⚠️ Requires Manual Action
- [ ] Run SQL migration in Supabase SQL Editor
- [ ] Test signup flow with real data
- [ ] Test signin flow
- [ ] Verify profile creation in database
- [ ] Test on physical device (phone number input)

---

## 🧪 Testing Guide

### Test Signup Flow

1. **Open app** → Should show signin screen with logo
2. **Click "Sign Up"** → Should switch to signup form
3. **Fill in details:**
   - Full Name: "John Doe"
   - Email: "john.doe@example.com"
   - Phone: "0812345678" (will be stored as +27812345678)
   - Student Number: "202312345"
   - Institution: Click to open picker → Search "Stellenbosch" → Select
   - Course: "Computer Science"
   - Year: Click "3"
   - Password: "MyPass123!" (meets all requirements)
   - Confirm: "MyPass123!"
4. **Click "Create Account"**
5. **Verify:**
   - Toast shows "Account Created!"
   - Redirects to home screen
   - Check Supabase profiles table for new record

### Test Validation

**Email validation:**
- Empty → "Email is required"
- "notanemail" → "Invalid email format"
- "test@example.com" → ✓

**Phone validation:**
- Empty → "Phone number is required"
- "123" → "Invalid phone number"
- "0812345678" → ✓

**Password validation:**
- "short" → "Password must be at least 8 characters"
- "password123" → "Password must contain at least 1 special character"
- "Password!" → "Password must contain at least 1 number"
- "Password123!" → ✓

**Confirm password:**
- Different from password → "Passwords do not match"
- Same as password → ✓

### Test Institution Picker

1. Click institution field
2. Modal should open with all institutions
3. Search "UCT" → Should filter to University of Cape Town
4. Search "Boland" → Should show Boland TVET College
5. Click an institution → Should close modal and display selected
6. Logo should appear in the field

---

## 📱 UI/UX Features

### Signin Screen
- StudentKonnect logo at top
- Email field with envelope icon
- Password field with lock icon and show/hide toggle
- "Log In" button with loading state
- "Sign Up" link at bottom

### Signup Screen
- StudentKonnect logo at top
- All fields with appropriate icons
- Phone number with +27 prefix
- Institution picker with logos
- Year of study as button group (1, 2, 3, 4+)
- Password strength indicators via validation
- Confirm password field
- "Create Account" button with loading state
- "Log In" link at bottom

### Institution Picker Modal
- Search bar at top
- Scrollable list of institutions
- Each item shows:
  - Institution logo (left)
  - Full name (bold)
  - Type (university/tvet)
  - Checkmark if selected (right)
- Smooth animations
- Close button (X) at top right

---

## 🎨 Design Tokens

### Colors
- Background: Gradient (blue-900 → blue-500 → blue-400)
- Card: Background color (white in light, dark in dark mode)
- Primary: Blue (#3b82f6)
- Error: Red/Destructive color
- Muted: Gray text for placeholders

### Typography
- Logo: 3xl, bold
- Headings: xl, bold
- Labels: sm, medium
- Input text: base
- Error text: xs, destructive color

### Spacing
- Container padding: 6 (24px)
- Field gap: 4 (16px)
- Input padding: 4 horizontal, 3 vertical
- Border radius: xl (12px) for inputs, 3xl (24px) for cards

---

## 🔐 Security Features

1. **Password Requirements**
   - Minimum 8 characters
   - Must include number
   - Must include special character
   - Prevents weak passwords

2. **Email Validation**
   - Regex pattern matching
   - Prevents invalid formats

3. **Phone Number Validation**
   - SA-specific format
   - E.164 international format storage

4. **Supabase Auth**
   - Secure password hashing
   - Email verification (optional)
   - Row Level Security (RLS) policies

5. **Data Privacy**
   - Users can only access their own profile
   - Phone numbers stored securely
   - Email unique constraint prevents duplicates

---

## 🚀 Next Steps

### Immediate
1. **Run SQL migration** in Supabase
2. **Test signup** with real data
3. **Verify database** records created correctly

### Future Enhancements
1. **Email verification** flow
2. **SMS OTP** verification for phone numbers
3. **Social login** (Google, Facebook)
4. **Password reset** flow
5. **Profile editing** screen
6. **Institution logo hosting** (replace placeholder URLs)
7. **Add more institutions** (private colleges, etc.)
8. **Multi-language support** (Afrikaans, Zulu, etc.)

---

## 📄 Files Changed

### New Files
- `constants/sa-institutions-with-logos.ts` - Institution database
- `assets/images/student-konnect-logo.png` - App logo
- `scripts/add-email-phone-to-profiles.sql` - Database migration
- `AUTH_ENHANCEMENT_GUIDE.md` - This document

### Modified Files
- `app/auth.tsx` - Complete rewrite with new features
- Old version backed up to `app/auth-old-backup.tsx`

---

## 🐛 Troubleshooting

### Issue: "Email already exists"
**Solution:** Email must be unique. Use a different email or delete the existing user.

### Issue: "Invalid phone number"
**Solution:** Ensure format is 10 digits starting with 0 (e.g., 0812345678).

### Issue: "Institution picker not showing logos"
**Solution:** Check internet connection. Logos are loaded from URLs.

### Issue: "Password validation not working"
**Solution:** Check regex patterns in `validatePassword()` function.

### Issue: "Profile not created after signup"
**Solution:** 
1. Check if SQL migration was run
2. Verify `sync_user_email()` trigger exists
3. Check Supabase logs for errors

---

## 📞 Support

For issues with:
- **Database:** Check Supabase dashboard logs
- **Auth flow:** Check Supabase Auth logs
- **UI bugs:** Check React Native debugger console
- **Validation:** Check error state in component

---

## 📊 Statistics

- **Total Institutions:** 76
  - Universities: 26
  - TVET Colleges: 50
- **Provinces Covered:** All 9
- **Form Fields:** 9 (signup), 2 (signin)
- **Validation Rules:** 8
- **Password Requirements:** 3

---

## ✅ Success Criteria

A successful implementation means:
1. ✅ Users can see StudentKonnect logo
2. ✅ Users can select from all SA institutions
3. ✅ Users can enter email and phone number
4. ✅ Password validation works correctly
5. ✅ Confirm password matches
6. ✅ Data is saved to profiles table
7. ✅ Users can sign in with email/password
8. ✅ UI is clean and professional
9. ✅ All validations provide clear error messages
10. ✅ Institution picker is searchable and smooth

---

**Last Updated:** January 25, 2026  
**Version:** 2.0  
**Status:** Ready for Testing
