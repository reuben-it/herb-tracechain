/**
 * SMS Sender — Sends reply SMS via Twilio or logs to console in mock mode.
 */

require('dotenv').config();

const USE_MOCK = process.env.USE_MOCK_SMS === 'true';

let twilioClient = null;

// Initialize Twilio client only when not in mock mode
if (!USE_MOCK) {
  try {
    const twilio = require('twilio');
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  } catch (err) {
    console.error('[SMS Sender] Failed to initialize Twilio:', err.message);
  }
}

/**
 * Send a reply SMS to the given phone number.
 * In mock mode, just logs to console.
 */
async function sendReply(toNumber, message) {
  if (USE_MOCK) {
    console.log(`\n📱 [MOCK SMS REPLY]`);
    console.log(`   To:      ${toNumber}`);
    console.log(`   Message: ${message}\n`);
    return;
  }

  if (!twilioClient) {
    console.error('[SMS Sender] Twilio client not initialized');
    return;
  }

  try {
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: toNumber
    });
    console.log(`[SMS] Reply sent to ${toNumber}`);
  } catch (err) {
    console.error(`[SMS] Failed to send reply to ${toNumber}:`, err.message);
  }
}

module.exports = { sendReply };
