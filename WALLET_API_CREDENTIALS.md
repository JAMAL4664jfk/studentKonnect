# Wallet API Test Credentials

## ⚠️ Important: Test Credentials Status

The test credentials provided in the Postman collection **do not work** with the QA environment API.

### Tested Combinations (All Failed)

| Phone Number | PIN | Status |
|--------------|-----|--------|
| 0844050611 | 67891 | ❌ Invalid |
| 0844050611 | 88020 | ❌ Invalid |
| 0844050611 | 00700 | ❌ Invalid |
| 0844050611 | 13579 | ❌ Invalid |
| 0712527698 | 67891 | ❌ Invalid |
| 0712527698 | 88020 | ❌ Invalid |
| 0712527698 | 00700 | ❌ Invalid |
| 0712527698 | 13579 | ❌ Invalid |
| 0845153175 | 67891 | ❌ Invalid |
| 0845153175 | 88020 | ❌ Invalid |
| 0845153175 | 00700 | ❌ Invalid |
| 0845153175 | 13579 | ❌ Invalid |
| 0827790818 | 67891 | ❌ Invalid |
| 0827790818 | 88020 | ❌ Invalid |
| 0827790818 | 00700 | ❌ Invalid |
| 0827790818 | 13579 | ❌ Invalid |

### API Response

All combinations return:
```json
{
  "statusCode": 403,
  "environment": "qa",
  "success": false,
  "messages": "The mobile number and pin combination do not match or are invalid.",
  "result_code": "AE001",
  "data": {
    "username": "+27XXXXXXXXXX"
  }
}
```

## ✅ API Configuration (Fixed)

**Correct API URL:** `https://api.payelio.com/v3/`
- ❌ **Wrong:** `https://apin.payelio.com/v3/qa/` (DNS does not resolve)
- ❌ **Wrong:** `https://api.payelio.com/v3/qa/` (Returns 403)
- ✅ **Correct:** `https://api.payelio.com/v3/` (VERIFIED WORKING in Postman)

**Client Credentials:**
```
client-key: b154e7-b21b2f-f0a14d-96affa-6d3fb9
client-pass: mwDv794ZLsTi0ezF3EBK4ZMsHtAWH1cR
```

## 📋 Next Steps

To proceed with testing, you need to:

1. **Contact the API provider** to get valid test credentials for the QA environment
2. **Or register a new test account** using the customer registration endpoint
3. **Or use your own account** if you have one

### Test API Connectivity

You can verify the API is accessible:
```bash
curl -X POST "https://api.payelio.com/v3/qa/customer/login" \
  -H "Content-Type: application/json" \
  -H "client-key: b154e7-b21b2f-f0a14d-96affa-6d3fb9" \
  -H "client-pass: mwDv794ZLsTi0ezF3EBK4ZMsHtAWH1cR" \
  -d '{"phone_number":"YOUR_PHONE","pin":"YOUR_PIN"}'
```

## 🔧 What's Been Fixed

1. ✅ **API URL corrected** in `.env` file
2. ✅ **Error handling improved** to show actual API error messages
3. ✅ **Network connectivity confirmed** - API is reachable
4. ✅ **Client credentials verified** - Headers are accepted by API

The integration is **ready to work** once valid test credentials are provided.
