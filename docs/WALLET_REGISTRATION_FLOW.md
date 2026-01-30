# Wallet Registration Flow - Chronological Order

This document explains the proper sequence of API calls for wallet registration and login.

---

## Registration Flow (New User)

### Step 1: Verify Mobile
**Endpoint:** `POST /customer/verify_mobile`

**Purpose:** Check if phone number exists and if user has a PIN

**Request:**
```json
{
  "phone_number": "0836624434"
}
```

**Response (User exists, no PIN):**
```json
{
  "endpoint": "/v3/qa/customer/verify_mobile",
  "statusCode": 401,
  "environment": "qa",
  "success": false,
  "messages": "Your account does not have a pin, please create a pin to continue. But first let us verify your identity.",
  "result_code": "2001",
  "data": {
    "customerId": "31827954",
    "first_name": "SIZO",
    "last_name": "TESTING"
  }
}
```

**Response (User doesn't exist):**
```json
{
  "success": false,
  "messages": "Phone number not registered",
  "result_code": "404"
}
```

**Response (User exists with PIN):**
```json
{
  "success": true,
  "messages": "Phone number verified",
  "result_code": "0"
}
```

---

### Step 2: Verify Customer (Get Full Profile)
**Endpoint:** `GET /customer/verify?customer_id={customerId}`

**Purpose:** Retrieve complete customer profile details

**Request:**
```
GET /customer/verify?customer_id=31827954
```

**Response:**
```json
{
  "endpoint": "/v3/qa/customer/verify?customer_id=31827954",
  "statusCode": 200,
  "environment": "qa",
  "success": true,
  "messages": "Customer Verification",
  "result_code": "0",
  "data": {
    "id": "306",
    "customerId": "31827954",
    "first_name": "Ignatius",
    "last_name": "Mutizwa",
    "email": null,
    "identity_number": "8bf645a90e6efa31b44dc507305bc82597202d124dfcbb3e419368f9c88b16ca4c0b2a91a009094305",
    "msisdn": "+27836624434",
    "industry": null,
    "occupation": null,
    "occupation_other": null,
    "source_of_funds": null,
    "dateOfBirth": "19811120",
    "gender": "Male",
    "date_created": "2025-10-15 17:20:35",
    "registration_type": "customer",
    "wallet_type": "2",
    "account_number": "6821947"
  }
}
```

---

### Step 3: Check Customer
**Endpoint:** `POST /customer/check_customer`

**Purpose:** Validate that ID number and phone number match

**Request:**
```json
{
  "id_number": "0501016793082",
  "phone_number": "0836624434"
}
```

**Response:**
```json
{
  "endpoint": "/v3/qa/customer/check_customer",
  "statusCode": 200,
  "environment": "qa",
  "success": true,
  "messages": "Customer verified",
  "result_code": "0",
  "data": {
    "customer_id": "31827954",
    "verified": true
  }
}
```

---

### Step 4: Register Customer
**Endpoint:** `POST /customer/register`

**Purpose:** Create new customer account or update existing

**Request:**
```json
{
  "id_number": "0501016793082",
  "phone_number": "0836624434",
  "first_name": "SIZO",
  "last_name": "TESTING",
  "middle_name": "",
  "privacy": true,
  "gtc": true,
  "registration_step": "1",
  "registration_type": "customer",
  "referrer_id": "t0nw2v"
}
```

**Response:**
```json
{
  "endpoint": "/v3/qa/customer/register",
  "statusCode": 200,
  "environment": "qa",
  "success": true,
  "messages": "Customer Updated",
  "result_code": "0",
  "data": {
    "first_name": "SIZO",
    "last_name": "TESTING",
    "middle_name": "",
    "version": "1",
    "registration_step": "1",
    "otp_verified": 1
  }
}
```

---

### Step 5: Create PIN (Next Endpoint Needed)
After registration, user needs to create a PIN to complete account setup.

---

## Login Flow (Existing User with PIN)

### Step 1: Login
**Endpoint:** `POST /customer/login`

**Request:**
```json
{
  "phone_number": "0844050611",
  "pin": "12345"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "messages": "Login successful",
  "result_code": "0",
  "data": {
    "access_token": "eyJ...",
    "access_token_expires_in": 3600,
    "refresh_token": "eyJ...",
    "refresh_token_expires_in": 86400
  }
}
```

---

## Implementation Status

### ✅ Implemented Endpoints

1. **verifyMobile(phoneNumber)** - Check if user exists and has PIN
2. **verifyCustomer(customerId)** - Get full customer profile (GET request)
3. **checkCustomer(idNumber, phoneNumber)** - Validate ID and phone match
4. **register(registrationData)** - Create/update customer account
5. **login(phoneNumber, pin)** - Authenticate user

### ⏳ Pending Endpoints

1. **verifyCustomer(customerId)** - ✅ Get full customer profile
2. **Create PIN** - Set initial PIN for new users
2. **Reset PIN** - Change existing PIN
3. **Verify OTP** - Confirm phone number ownership
4. **Get Profile** - Retrieve customer details
5. **Get Balance** - Check wallet balance
6. **Get Transactions** - View transaction history

---

## UI Flow Recommendation

### New User Registration:

```
1. User enters phone number
   ↓
2. Call verifyMobile()
   ↓
3. If result_code = "404" (not registered):
   → Show full registration form
   ↓
4. User fills in: ID, name, agrees to terms
   ↓
5. Call checkCustomer() to validate ID + phone
   ↓
6. If valid, call register()
   ↓
7. Call verifyCustomer() with returned customerId
   ↓
8. Show "Create PIN" screen with customer details
   ↓
9. Call createPin() (needs implementation)
   ↓
10. Navigate to wallet dashboard
```

### Existing User (No PIN):

```
1. User enters phone number
   ↓
2. Call verifyMobile()
   ↓
3. If result_code = "2001" (no PIN):
   → Extract customerId from response
   ↓
4. Call verifyCustomer(customerId)
   → Show full customer profile
   → Show "Create PIN" screen
   ↓
5. Call createPin()
   ↓
6. Navigate to wallet dashboard
```

### Existing User (With PIN):

```
1. User enters phone number
   ↓
2. Call verifyMobile()
   ↓
3. If success = true:
   → Show PIN entry screen
   ↓
4. User enters PIN
   ↓
5. Call login()
   ↓
6. Navigate to wallet dashboard
```

---

## Error Handling

### result_code Reference:

- **"0"** - Success
- **"404"** - Phone number not registered
- **"2001"** - Account exists but no PIN set
- **"401"** - Unauthorized (invalid credentials)
- **"ERROR"** - Network or parsing error

### Common Errors:

**"White Label not authorized"**
- **Cause:** Invalid or expired API credentials
- **Solution:** Contact Payelio for valid credentials

**"Network request failed"**
- **Cause:** No internet connection or API unreachable
- **Solution:** Check device connectivity

**"Invalid JSON response"**
- **Cause:** API returned non-JSON data
- **Solution:** Check API endpoint and request format

---

## Testing Checklist

### New User Registration:
- [ ] verifyMobile returns 404 for new phone
- [ ] checkCustomer validates ID + phone
- [ ] register creates new account
- [ ] OTP verification works (if required)
- [ ] PIN creation works
- [ ] Can login after registration

### Existing User (No PIN):
- [ ] verifyMobile returns result_code "2001"
- [ ] Shows customer data from response
- [ ] Can create PIN
- [ ] Can login with new PIN

### Existing User (With PIN):
- [ ] verifyMobile returns success
- [ ] Can login with correct PIN
- [ ] Login fails with wrong PIN
- [ ] Session persists after app restart

---

## Next Steps

1. **Get valid API credentials** from Payelio
2. **Implement Create PIN endpoint**
3. **Implement OTP verification** (if required)
4. **Update registration UI** to follow proper flow
5. **Test complete registration → login flow**
6. **Implement remaining wallet endpoints** (balance, transactions, etc.)

---

## API Methods Available

```typescript
// Wallet API Service
import { walletAPI } from '@/lib/wallet-api';

// Registration flow
const verifyResult = await walletAPI.verifyMobile(phoneNumber);
if (verifyResult.data?.customerId) {
  const customerProfile = await walletAPI.verifyCustomer(verifyResult.data.customerId);
}
const checkResult = await walletAPI.checkCustomer(idNumber, phoneNumber);
const registerResult = await walletAPI.register(registrationData);

// Login
const loginResult = await walletAPI.login(phoneNumber, pin);

// Session management
await walletAPI.logout();
```

---

## Notes

- All endpoints require `client-key` and `client-pass` headers
- Responses include `result_code` for flow control
- `success: false` doesn't always mean error (e.g., result_code "2001")
- Always check `result_code` to determine next action
- Tokens are stored securely using AsyncStorage
- Logs are available for debugging via console
