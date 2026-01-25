# StudentKonnect Social Features

## Overview
This document describes the social and communication features implemented in StudentKonnect, including user discovery, connection management, messaging, and calling capabilities.

## Features Implemented

### 1. Discover Users (`/discover-users`)
**Purpose:** Find and connect with other students on the platform

**Features:**
- View all registered users (excluding yourself)
- Search by name, institution, or program
- See user profiles with:
  - Name, avatar, institution, course/program
  - Bio
  - Online status (green dot indicator)
- Connection status indicators:
  - **None**: Show "Connect" button
  - **Pending**: Show "Pending" status
  - **Connected**: Show "Message" button + connected icon
- Pull-to-refresh functionality

**Navigation:** Home → More Options → Discover Users

**Database Tables:**
- `profiles` - User information
- `user_online_status` - Real-time online status
- `user_connections` - Connection relationships

---

### 2. Connection Requests (`/connection-requests`)
**Purpose:** Manage incoming and outgoing connection requests

**Features:**
- **Two tabs:**
  - **Incoming**: Requests you've received
  - **Sent**: Requests you've sent
- **Incoming requests actions:**
  - Accept - Creates connection
  - Decline - Rejects connection
- **Outgoing requests actions:**
  - Cancel Request - Removes pending request
- Shows user details for each request
- Real-time request counts in tab headers
- Pull-to-refresh functionality

**Navigation:** Home → More Options → Connection Requests

**Database Operations:**
- Accept: Updates `user_connections.status` to "accepted"
- Decline: Updates `user_connections.status` to "rejected"
- Cancel: Deletes record from `user_connections`

---

### 3. Real-Time Chat (`/chat`)
**Purpose:** One-on-one messaging between connected users

**Features:**
- Real-time message delivery using Supabase Realtime
- Message bubbles with timestamps
- Online/offline status indicator
- Read receipts (messages marked as read when viewed)
- **NEW: Voice and Video call buttons** in header
- Keyboard-aware scrolling
- Auto-scroll to latest message

**Navigation:** 
- Discover Users → Message button (for connected users)
- Direct link: `/chat?userId={userId}`

**Database Tables:**
- `direct_messages` - Chat messages
- `user_online_status` - Online status

---

### 4. Voice Call (`/voice-call`)
**Purpose:** Audio-only calls between users

**Features:**
- Call status indicators:
  - Connecting → Ringing → Connected → Ended
- Call duration timer (MM:SS format)
- **Controls:**
  - Mute/Unmute microphone
  - Speaker on/off
  - End call (red button)
- Pulsing avatar animation during ringing
- Toast notifications for status changes

**Navigation:** Chat screen → Phone icon button

**Parameters:**
- `userId` - ID of the user being called
- `userName` - Name of the user (for display)

**Implementation Note:** 
Currently uses simulated connection. For production, integrate WebRTC service like:
- Agora (recommended for Africa)
- Twilio Voice
- Stream Video SDK
- 100ms

---

### 5. Video Call (`/video-call`)
**Purpose:** Video calls between users

**Features:**
- Full-screen remote video view
- Picture-in-picture local video (top-right corner)
- Call status indicators
- Call duration timer
- **Controls:**
  - Mute/Unmute microphone
  - Camera on/off
  - Switch camera (front/back)
  - End call (red button)
- Auto-hiding controls (tap screen to show/hide)
- Controls auto-hide after 3 seconds

**Navigation:** Chat screen → Video icon button

**Parameters:**
- `userId` - ID of the user being called
- `userName` - Name of the user (for display)

**Implementation Note:** 
Currently uses simulated connection. For production, integrate WebRTC service like:
- Agora Video (recommended for Africa)
- Twilio Video
- Stream Video SDK
- 100ms

---

## Database Schema

### user_connections
```sql
CREATE TABLE user_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  addressee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### direct_messages
```sql
CREATE TABLE direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### user_online_status
```sql
CREATE TABLE user_online_status (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMPTZ DEFAULT NOW()
);
```

---

## User Flow

### Connecting with Users
1. User opens **Discover Users**
2. Searches or browses available users
3. Clicks **Connect** button
4. Request sent → Status changes to "Pending"
5. Other user receives notification in **Connection Requests**
6. Other user clicks **Accept**
7. Both users now connected → Can message each other

### Starting a Chat
1. User finds connected user in **Discover Users**
2. Clicks **Message** button
3. Opens chat screen
4. Can send messages, make voice/video calls

### Making Calls
1. User opens chat with connected user
2. Clicks **Phone icon** for voice call OR **Video icon** for video call
3. Call screen opens
4. Call connects (simulated for now)
5. Use controls to mute, toggle video, etc.
6. Click red button to end call

---

## Testing Checklist

### Discover Users
- [ ] Users display correctly (excluding current user)
- [ ] Search works for name, institution, program
- [ ] Online status shows correctly
- [ ] Connect button works
- [ ] Message button appears for connected users
- [ ] Pull-to-refresh updates list

### Connection Requests
- [ ] Incoming requests display correctly
- [ ] Sent requests display correctly
- [ ] Accept button creates connection
- [ ] Decline button rejects request
- [ ] Cancel button removes sent request
- [ ] Tab counts update correctly

### Chat
- [ ] Messages send and receive in real-time
- [ ] Messages display correctly (sender vs receiver)
- [ ] Timestamps show correctly
- [ ] Online status updates
- [ ] Read receipts work
- [ ] Voice call button navigates correctly
- [ ] Video call button navigates correctly

### Voice Call
- [ ] Call status transitions work
- [ ] Duration timer counts correctly
- [ ] Mute button toggles
- [ ] Speaker button toggles
- [ ] End call returns to chat

### Video Call
- [ ] Call status transitions work
- [ ] Duration timer counts correctly
- [ ] Controls show/hide on tap
- [ ] Mute button toggles
- [ ] Camera button toggles
- [ ] Camera switch button works
- [ ] End call returns to chat

---

## Next Steps for Production

### 1. Implement Real WebRTC
Choose and integrate a WebRTC service:

**Agora (Recommended for SA/Africa):**
```bash
npm install agora-react-native-rtc
```
- Good pricing for African markets
- Low latency
- Reliable infrastructure

**Integration Steps:**
1. Sign up for Agora account
2. Get App ID and Token
3. Replace simulated connection in voice-call.tsx and video-call.tsx
4. Implement signaling via Supabase Realtime
5. Handle call invitations and acceptance
6. Test with real devices

### 2. Add Push Notifications
For incoming calls and messages:
```bash
npm install expo-notifications
```

### 3. Add Call History
Create table to store call records:
```sql
CREATE TABLE call_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caller_id UUID REFERENCES profiles(id),
  receiver_id UUID REFERENCES profiles(id),
  call_type TEXT CHECK (call_type IN ('voice', 'video')),
  duration INTEGER, -- seconds
  status TEXT CHECK (status IN ('completed', 'missed', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. Optimize Performance
- Implement pagination for Discover Users (currently limited to 50)
- Add message pagination in chat
- Optimize Realtime subscriptions
- Add connection pooling

---

## Known Limitations

1. **Calls are simulated** - Need WebRTC integration for real calls
2. **No call notifications** - Users must be in chat to receive calls
3. **No group chat** - Only one-on-one messaging
4. **No media messages** - Only text messages supported
5. **No typing indicators** - Can be added with Realtime presence
6. **No message reactions** - Can be added to direct_messages table

---

## Support

For questions or issues with these features, check:
1. Supabase dashboard for RLS policies
2. Realtime subscriptions in Supabase
3. Database triggers and functions
4. Console logs in development mode
