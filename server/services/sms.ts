/**
 * SMS Service Integration
 * Supports sending SMS messages to farmers
 * 
 * Configure with environment variables:
 * - SMS_PROVIDER: "twilio" (default) or "mock"
 * - TWILIO_ACCOUNT_SID
 * - TWILIO_AUTH_TOKEN
 * - TWILIO_PHONE_NUMBER
 */

interface SMSConfig {
  provider: "twilio" | "mock";
  accountSid?: string;
  authToken?: string;
  phoneNumber?: string;
}

const config: SMSConfig = {
  provider:  process.env.SMS_PROVIDER === "twilio" ? "twilio" : "mock",
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  phoneNumber: process.env.TWILIO_PHONE_NUMBER,
};

export async function sendSMS(phoneNumber: string, message: string): Promise<boolean> {
  try {
    if (config.provider === "twilio") {
      // Twilio integration (requires twilio package: npm install twilio)
      if (!config.accountSid || !config.authToken || !config.phoneNumber) {
        console.warn("Twilio SMS provider configured but credentials missing. Using mock.");
        return sendMockSMS(phoneNumber, message);
      }

      try {
        const twilio = require("twilio");
        const client = twilio(config.accountSid, config.authToken);

        const result = await client.messages.create({
          body: message,
          from: config.phoneNumber,
          to: phoneNumber,
        });

        console.log(`SMS sent to ${phoneNumber} (SID: ${result.sid})`);
        return true;
      } catch (err: any) {
        console.error("Twilio SMS error:", err.message);
        // Fall back to mock if Twilio fails
        return sendMockSMS(phoneNumber, message);
      }
    } else {
      // Mock SMS (logs to console, useful for development)
      return sendMockSMS(phoneNumber, message);
    }
  } catch (err: any) {
    console.error("SMS sending error:", err);
    return false;
  }
}

function sendMockSMS(phoneNumber: string, message: string): boolean {
  console.log(`\n📱 [MOCK SMS] To: ${phoneNumber}`);
  console.log(`   Message: ${message}\n`);
  return true;
}

export default { sendSMS };
