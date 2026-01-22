# Scholar Fin Hub - Migration Fixes Breakdown

## Issues Identified

### 1. Navigation/Routing Issues
- [ ] Service buttons don't navigate to their respective screens
- [ ] Missing service detail screens (Marketplace, Accommodation, Loans, etc.)
- [ ] Wallet balance card doesn't navigate to transactions
- [ ] "More" button not showing options (Buy Electricity, Buy Airtime, etc.)
- [ ] Student Dating screen not accessible

### 2. Wallet Card UI
- [ ] Wallet card should look like Visa Mastercard design
- [ ] Missing card number, expiry date, CVV styling
- [ ] Missing card chip and contactless icons

### 3. Transaction Features
- [ ] Missing "Download Statement" button
- [ ] Need PDF/CSV export functionality
- [ ] Missing date range selector for statements

### 4. Chat Functionality
- [ ] Missing real-time messaging with Supabase
- [ ] Missing message send/receive logic
- [ ] Missing chat list with real conversations
- [ ] Missing message timestamps and read status
- [ ] Missing typing indicators

### 5. Profile Features
- [ ] Missing profile picture upload
- [ ] Need image picker integration (expo-image-picker)
- [ ] Missing profile picture display
- [ ] Missing edit profile functionality

### 6. Supabase Integration
- [ ] Pull real transaction data from Supabase
- [ ] Pull real chat messages from Supabase
- [ ] Pull user profiles from Supabase
- [ ] Real-time subscriptions for chat

---

## Phase-by-Phase Implementation Plan

### Phase 1: Fix Service Navigation (Priority: HIGH)
**Goal:** Make all service buttons functional with proper navigation

**Tasks:**
1. Analyze original React.js routing structure
2. Create missing service screens:
   - Marketplace screen
   - Accommodation screen
   - Student Loans screen
   - Tutoring screen
   - E-Hailing screen
   - Podcasts screen
   - Wellness screen
   - Career screen
   - Student Dating screen
3. Add navigation routes for all services
4. Connect service buttons to routes
5. Add "More" options modal (Buy Electricity, Buy Airtime, etc.)

**Deliverable:** All service buttons navigate to functional screens

---

### Phase 2: Redesign Wallet Card & More Options (Priority: HIGH)
**Goal:** Make wallet card look like Visa Mastercard and restore More options

**Tasks:**
1. Redesign wallet card component:
   - Add card chip icon
   - Add contactless payment icon
   - Add card number (masked: **** **** **** 1234)
   - Add expiry date
   - Add cardholder name
   - Add Visa/Mastercard logo
   - Add gradient background
2. Implement "More" options bottom sheet:
   - Buy Electricity
   - Buy Airtime
   - Buy Data
   - Pay Bills
   - Send Money
   - Request Money
3. Make wallet card clickable to view transactions

**Deliverable:** Professional card UI and functional More options

---

### Phase 3: Student Dating Screen (Priority: MEDIUM)
**Goal:** Implement Student Dating feature with Supabase integration

**Tasks:**
1. Analyze original Dating.tsx from React.js project
2. Create dating profile cards with swipe functionality
3. Integrate with Supabase dating_profiles table
4. Add like/dislike actions
5. Add matches view
6. Add profile creation flow

**Deliverable:** Functional Student Dating screen with real data

---

### Phase 4: Transaction Statement Download (Priority: MEDIUM)
**Goal:** Add statement download functionality

**Tasks:**
1. Add "Download Statement" button to transactions screen
2. Implement date range picker
3. Generate PDF statement with transaction details
4. Generate CSV export option
5. Use expo-file-system for file operations
6. Add share functionality (expo-sharing)

**Deliverable:** Users can download transaction statements in PDF/CSV

---

### Phase 5: Complete Chat Functionality (Priority: HIGH)
**Goal:** Implement real-time chat with Supabase

**Tasks:**
1. Analyze original Chat.tsx from React.js project
2. Create Supabase chat schema:
   - conversations table
   - messages table
   - participants table
3. Implement real-time message sending/receiving
4. Add message list with FlatList
5. Add typing indicators
6. Add read receipts
7. Add message timestamps
8. Add chat search functionality

**Deliverable:** Fully functional real-time chat system

---

### Phase 6: Profile Picture Upload (Priority: MEDIUM)
**Goal:** Allow users to upload and display profile pictures

**Tasks:**
1. Install expo-image-picker
2. Add "Edit Profile" button on Profile screen
3. Implement image picker (camera + gallery)
4. Upload image to Supabase Storage
5. Update user profile with image URL
6. Display profile picture on Profile screen
7. Display profile picture in chat
8. Add image compression for optimization

**Deliverable:** Users can upload and display profile pictures

---

## Implementation Order

1. **Phase 1** - Fix navigation (blocking other features)
2. **Phase 2** - Wallet card UI and More options (high visibility)
3. **Phase 5** - Chat functionality (core feature)
4. **Phase 3** - Student Dating (popular feature)
5. **Phase 4** - Transaction downloads (utility feature)
6. **Phase 6** - Profile pictures (nice-to-have)

---

## Success Criteria

✅ All service buttons navigate to functional screens
✅ Wallet card looks professional (Visa Mastercard style)
✅ More options modal shows all quick actions
✅ Chat works with real-time messaging
✅ Student Dating screen is functional
✅ Users can download transaction statements
✅ Users can upload profile pictures
✅ All data pulled from Supabase (not mock data)

---

## Next Steps

Starting with **Phase 1: Fix Service Navigation**
