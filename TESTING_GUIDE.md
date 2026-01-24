# 🧪 StudentKonnect Testing Guide

## Quick Start Testing

Follow this guide to test all the features we've implemented!

---

## ✅ Prerequisites

1. **Database is set up** ✅
   - All chat tables created in Supabase
   - RLS policies enabled
   - Triggers active

2. **App is running**
   ```bash
   cd /home/ubuntu/studentKonnect
   npm start
   ```

---

## 📱 Test Flow

### Step 1: Sign Up Multiple Users

**User 1:**
1. Navigate to `/onboarding/institution-select`
2. Select "University"
3. Fill in details:
   - Name: Alice Johnson
   - Student Number: 202401001
   - University: University of Cape Town
   - Course: Computer Science
   - Year: 3rd Year
   - Email: alice@student.com
   - Password: password123!
4. Enable biometric security (optional)
5. Click "Create Account"
6. ✅ Profile created automatically!

**User 2:**
1. Sign out
2. Repeat process with:
   - Name: Bob Smith
   - Student Number: 202401002
   - University: Stellenbosch University
   - Course: Business Administration
   - Year: 2nd Year
   - Email: bob@student.com
   - Password: password123!

**User 3:**
1. Sign out
2. Repeat process with:
   - Name: Carol Williams
   - Student Number: 202401003
   - University: University of Pretoria
   - Course: Engineering
   - Year: 4th Year
   - Email: carol@student.com
   - Password: password123!

---

### Step 2: Test User Discovery

**As Alice:**
1. Go to Chat tab
2. Tap "Discover" tab
3. Search for "Bob" or "Smith"
4. Tap "Connect" button
5. ✅ Connection created!

**As Bob:**
1. Go to Discover tab
2. Search for "Carol"
3. Tap "Connect"
4. ✅ Now connected to Carol!

---

### Step 3: Test 1-on-1 Chat

**As Alice:**
1. Go to "Chats" tab
2. You should see Bob in your conversations
3. Tap on Bob's chat
4. Send message: "Hey Bob! How are you?"
5. ✅ Message sent!

**As Bob (on another device/browser):**
1. Go to "Chats" tab
2. See Alice's message appear in real-time
3. Tap on Alice's chat
4. Reply: "Hi Alice! I'm good, thanks!"
5. ✅ Real-time messaging works!

**Continue conversation:**
- Send multiple messages
- Check timestamps
- Verify unread counts
- Test pull-to-refresh

---

### Step 4: Test Group Chat

**As Alice:**
1. Go to "Groups" tab
2. Tap "Create Group" button
3. Fill in:
   - Name: Study Group - CS
   - Description: Computer Science study group
   - Public: Yes
4. Tap "Create"
5. ✅ Group created!

**Add Members:**
1. In the group, tap "Add Members"
2. Select Bob and Carol
3. ✅ Members added!

**Send Group Messages:**
1. Type: "Welcome everyone!"
2. Send message
3. ✅ Group message sent!

**As Bob:**
1. Go to "Groups" tab
2. See "Study Group - CS"
3. Open group
4. See Alice's welcome message
5. Reply: "Thanks for adding me!"
6. ✅ Group chat works!

---

### Step 5: Test Accommodation Feature

**As Alice:**
1. Go to Accommodation tab
2. See 3 demo listings
3. Tap on "Modern Studio Near Campus"
4. View details:
   - Price: $1,200/month
   - 1 bedroom, 1 bathroom
   - Amenities: WiFi, Kitchen, Parking
5. Tap heart to favorite
6. ✅ Accommodation feature works!

**Test Search:**
1. Search for "Boston"
2. See filtered results
3. ✅ Search works!

**Test Filters:**
1. Tap filter button
2. Select "Studio"
3. See only studio listings
4. ✅ Filters work!

---

### Step 6: Test Marketplace Feature

**As Bob:**
1. Go to Marketplace tab
2. See 4 demo items in grid layout
3. Tap on "MacBook Air M1"
4. View details:
   - Price: $750
   - Condition: Like New
   - Category: Electronics
5. Tap heart to favorite
6. ✅ Marketplace feature works!

**Test Categories:**
1. Tap "Electronics" category
2. See only electronics
3. Try other categories
4. ✅ Category filtering works!

**Test Featured:**
1. Tap "Featured" tab
2. See items with star badges
3. ✅ Featured items work!

---

### Step 7: Test Call Logs

**Simulate a call:**
1. Open Bob's chat
2. Tap voice call button
3. (Call interface would appear in production)
4. End call after a few seconds

**View Call History:**
1. Go to Chat tab → "Calls"
2. See call log with:
   - Participant name
   - Call type (voice/video)
   - Duration
   - Timestamp
3. ✅ Call logging works!

---

### Step 8: Test Status Feature

**As Carol:**
1. Go to Chat tab → "Status" tab
2. Tap "+" button
3. Type: "Studying for finals! 📚"
4. Tap "Post"
5. ✅ Status posted!

**As Alice:**
1. Go to "Status" tab
2. See Carol's status (if connected)
3. Tap to view
4. ✅ Status viewing works!

**Check Expiry:**
- Status should disappear after 24 hours
- Or manually set `expires_at` in database for testing

---

## 🎯 Feature Checklist

### Onboarding ✅
- [ ] Institution type selection works
- [ ] Quick registration works
- [ ] Full registration works
- [ ] Biometric toggle works
- [ ] Profile created automatically
- [ ] User can sign in after signup

### Chat System ✅
- [ ] User discovery works
- [ ] Connections can be created
- [ ] 1-on-1 messaging works
- [ ] Messages appear in real-time
- [ ] Unread counts update
- [ ] Last message displays correctly
- [ ] Timestamps are accurate

### Group Chat ✅
- [ ] Can create groups
- [ ] Can add members
- [ ] Group messages work
- [ ] All members see messages
- [ ] Admin controls work
- [ ] Can leave group

### Accommodation ✅
- [ ] Listings display correctly
- [ ] Search works
- [ ] Filters work
- [ ] Favorites work
- [ ] Detail modal works
- [ ] Pull-to-refresh works

### Marketplace ✅
- [ ] Grid layout displays
- [ ] Category badges show
- [ ] Condition badges show
- [ ] Search works
- [ ] Category filters work
- [ ] Featured tab works
- [ ] Favorites work
- [ ] View counter increments

### Calls ✅
- [ ] Call logs created
- [ ] Call history displays
- [ ] Duration tracked
- [ ] Call types differentiated

### Status ✅
- [ ] Can post status
- [ ] Can view friend's status
- [ ] View count works
- [ ] Expires after 24 hours

---

## 🐛 Common Issues & Solutions

### Issue: "Can't see other users in Discover"
**Solution:** 
- Make sure at least 2 users are signed up
- Check that profiles were created (check Supabase dashboard)
- Verify RLS policies are enabled

### Issue: "Messages not sending"
**Solution:**
- Check internet connection
- Verify Supabase connection
- Check browser console for errors
- Ensure conversation exists

### Issue: "Real-time not working"
**Solution:**
- Check that Supabase Realtime is enabled
- Verify subscription is active
- Check browser console for connection errors

### Issue: "Accommodation/Marketplace empty"
**Solution:**
- Run seed script: `node scripts/seed-demo-data.js`
- Check Supabase dashboard for data
- Verify table names match

### Issue: "Profile not created on signup"
**Solution:**
- Check that trigger `on_auth_user_created` exists
- Verify trigger is enabled
- Check Supabase logs for errors

---

## 📊 Verify in Supabase Dashboard

### Check Tables Have Data

1. Go to: https://supabase.com/dashboard/project/ortjjekmexmyvkkotioo/editor

2. **Check profiles table:**
   - Should have entries for all signed-up users
   - Each profile should have: full_name, institution_name, course_program

3. **Check connections table:**
   - Should have entries for connected users
   - Status should be 'accepted'

4. **Check conversations table:**
   - Should have entries for each chat
   - participant1_id and participant2_id should match user IDs

5. **Check messages table:**
   - Should have all sent messages
   - conversation_id should match conversations table
   - sender_id should match user IDs

6. **Check chat_groups table:**
   - Should have created groups
   - created_by should match user ID

7. **Check group_members table:**
   - Should have members for each group
   - Roles should be 'admin' or 'member'

8. **Check accommodations table:**
   - Should have 3 demo listings
   - All fields populated

9. **Check marketplaceItems table:**
   - Should have 4 demo items
   - Categories and conditions set

10. **Check call_logs table:**
    - Should have call entries
    - Duration and status tracked

---

## 🎊 Success Criteria

Your app is working correctly if:

✅ **Users can sign up** with all 5 institution types
✅ **Profiles are created automatically** on signup
✅ **Users can discover** other students
✅ **Users can connect** with each other
✅ **1-on-1 chat works** with real-time updates
✅ **Group chats work** with multiple members
✅ **Accommodation listings** display and are searchable
✅ **Marketplace items** display in grid with filters
✅ **Call logs** are created and displayed
✅ **Statuses** can be posted and viewed
✅ **All data persists** in Supabase
✅ **Real-time updates** work across devices
✅ **Security policies** prevent unauthorized access

---

## 🚀 Next Steps After Testing

Once all tests pass:

1. **Add Real Images**
   - Upload to Supabase Storage
   - Update image URLs in database

2. **Implement WebRTC**
   - Add actual voice/video calling
   - Use Agora, Twilio, or WebRTC directly

3. **Add Push Notifications**
   - Notify users of new messages
   - Call notifications
   - Group mentions

4. **Deploy to Production**
   - Build production app
   - Deploy to App Store / Play Store
   - Monitor with analytics

5. **Add More Features**
   - Payment integration for marketplace
   - Booking system for accommodation
   - Rewards redemption
   - And more!

---

## 📝 Test Report Template

Use this template to document your testing:

```
# StudentKonnect Test Report
Date: [Date]
Tester: [Your Name]
Version: [App Version]

## Onboarding
- [ ] Sign up works: YES / NO
- [ ] Profile created: YES / NO
- Issues: [None / List issues]

## Chat
- [ ] Discovery works: YES / NO
- [ ] Messaging works: YES / NO
- [ ] Real-time works: YES / NO
- Issues: [None / List issues]

## Groups
- [ ] Create group: YES / NO
- [ ] Add members: YES / NO
- [ ] Group chat: YES / NO
- Issues: [None / List issues]

## Accommodation
- [ ] Listings display: YES / NO
- [ ] Search works: YES / NO
- [ ] Filters work: YES / NO
- Issues: [None / List issues]

## Marketplace
- [ ] Items display: YES / NO
- [ ] Categories work: YES / NO
- [ ] Featured works: YES / NO
- Issues: [None / List issues]

## Overall
- [ ] All features working: YES / NO
- [ ] Ready for production: YES / NO
- Recommendations: [List recommendations]
```

---

## 🎉 Happy Testing!

Your StudentKonnect app is feature-complete and ready for testing. Follow this guide to verify everything works as expected!

For issues or questions, check the CHAT_SYSTEM_COMPLETE.md documentation or review the code comments.

Good luck! 🚀
