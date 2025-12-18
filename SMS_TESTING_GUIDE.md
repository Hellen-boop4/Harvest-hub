# SMS Testing Guide - Harvest Hub

## 🚀 Quick Start (Mock SMS - Recommended for Testing)

### Step 1: No Configuration Needed!
The system defaults to **mock SMS** which logs messages to your terminal console. No setup required.

**To receive SMS on your phone for testing**, you have two options:
1. **Mock Mode (Console Only)**: See SMS messages in your server terminal - no phone needed
2. **Twilio Mode (Real SMS)**: Configure Twilio to send real SMS to your phone (see "Switching to Real SMS" below)

### Step 2: Register a Farmer
1. Go to **Farmers → Register Farmer**
2. Fill in the form with test data:
   - First Name: `John`
   - Surname: `Doe`
   - Phone: `+254712345678` (any format works)
   - ID Number: `12345678` (any unique number)
3. Click **Register**

### Step 3: Check Terminal Output
Look at your **server terminal** (where `npm run dev` is running). You should see:

```
📱 [MOCK SMS] To: +254712345678
   Message: Welcome to Harvest Hub John! Your account (fm0001) is ready. Start recording milk collections today!
```

✅ **SMS Test Successful!**

---

## 🧪 Test Other SMS Triggers

### Test Milk Collection SMS
1. Go to **Milk → Add Milk**
2. Select a farmer and enter:
   - Quantity: `50` (liters)
   - Fat: `3.5` (%)
   - SNF: `8.2` (%)
3. Click **Save**
4. **Check terminal** — you'll see:
   ```
   📱 [MOCK SMS] To: +254712345678
      Message: 50L milk collected. Fat: 3.5%, SNF: 8.2%. Keep up the good work!
   ```

### Test Payout SMS
1. Go to **Finance → Process Payouts**
2. Select a month (must have milk collections recorded)
3. Click **Process**
4. **Check terminal** — you'll see:
   ```
   📱 [MOCK SMS] To: +254712345678
      Message: Payout for 2025-12 processed! Earned: KES 5000, Deductions: KES 800, Net: KES 4200. Check your account.
   ```

---

## 🔧 Switching to Real SMS (Twilio)

### Prerequisites
1. **Twilio Account**: Create one at [twilio.com](https://www.twilio.com)
2. **Get Your Credentials**:
   - Account SID
   - Auth Token
   - Phone Number (the number that will send SMS)

### Configuration
Create or update `.env` file in your project root:

```env
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

**Example with real Twilio values:**
```env
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_abc123
TWILIO_PHONE_NUMBER=+14155552671
```

### Restart the Server
```powershell
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

You should see in the terminal:
```
Attempting to connect to MongoDB: ...
✓ MongoDB connected successfully
10:56:43 AM [express] ✓ MongoDB connected
```

### Test Real SMS
1. Register a farmer with a **real phone number**
2. Check your phone — you should receive an SMS!

---

## 🐛 Troubleshooting

### "SMS Sending Error" but Still Works?
- **Normal!** The system logs failures but continues. Mock SMS doesn't fail.

### Not Seeing SMS Logs?
Check:
1. **Is the server running?** Look for `✓ MongoDB connected` in terminal
2. **Is SMS_PROVIDER set correctly?** Check your `.env` file
3. **Are you looking at the right terminal?** SMS logs appear in the **backend server terminal**, not the browser console

### Twilio SMS Not Working?
1. Check `.env` file has correct credentials
2. Verify phone number format: `+1234567890` (with country code)
3. Try a different phone number (some carriers block SMS)
4. Check [Twilio Console](https://www.twilio.com/console/sms/logs) for error messages

### "Twilio SMS provider configured but credentials missing"
This means:
- `SMS_PROVIDER=twilio` is set
- But one or more credentials are missing in `.env`
- System automatically falls back to **mock SMS**
- Fill in the missing credentials and restart server

---

## 📊 What Gets SMS'd?

| Event | SMS Content | When |
|-------|-------------|------|
| **Farmer Registration** | Welcome message + member number | Immediately after registration |
| **Milk Collection** | Quantity, Fat%, SNF%, encouragement | When milk is recorded |
| **Payout Processing** | Earned, Deductions, Net amount | After admin processes payout |

---

## 🔐 Security Notes

- **Never commit `.env`** with real Twilio credentials to Git
- Use `.env.example` as template (already created in your project)
- In production, use environment variables from your deployment platform (Heroku, AWS, etc.)

---

## 💡 Quick Reference

### Mock Mode (Development)
```env
SMS_PROVIDER=mock
# No other SMS vars needed
```

### Twilio Mode (Production)
```env
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=ACxxxxx...
TWILIO_AUTH_TOKEN=your_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

---

**Need Help?** Check the terminal logs when registering/adding milk. The logs will show exactly what SMS was attempted to send and any errors.
