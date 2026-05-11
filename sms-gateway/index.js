/**
 * SMS Gateway — Main Server
 *
 * Receives incoming SMS (via Twilio webhook or mock test endpoint),
 * parses the message, authenticates with the backend, and calls
 * POST /herbs/harvest to record the herb on the blockchain.
 *
 * Port: 3002
 * Backend: http://localhost:5000 (Express API with MongoDB + Fabric)
 */

require('dotenv').config();
const express = require('express');
const axios   = require('axios');
const { parseSMS }  = require('./parser');
const { sendReply } = require('./sender');

const app = express();
app.use(express.urlencoded({ extended: false })); // Twilio sends form-encoded
app.use(express.json());

const PORT        = process.env.PORT || 3002;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// ---------------------------------------------------------------------------
// JWT Token Cache — auto-login with collector credentials on startup
// ---------------------------------------------------------------------------
let cachedToken = null;

async function getJwtToken() {
  if (cachedToken) return cachedToken;

  const email = process.env.BACKEND_COLLECTOR_EMAIL;
  const password = process.env.BACKEND_COLLECTOR_PASSWORD;

  if (!email || !password) {
    console.error('[Auth] BACKEND_COLLECTOR_EMAIL and BACKEND_COLLECTOR_PASSWORD must be set in .env');
    return null;
  }

  try {
    console.log(`[Auth] Logging in as ${email}...`);
    const response = await axios.post(`${BACKEND_URL}/auth/login`, {
      email,
      password
    });
    cachedToken = response.data.token;
    console.log(`[Auth] ✅ Logged in successfully. Token cached.`);
    return cachedToken;
  } catch (err) {
    const errMsg = err.response?.data?.message || err.message;
    console.error(`[Auth] ❌ Login failed: ${errMsg}`);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Call backend to record a harvest
// ---------------------------------------------------------------------------
async function recordHarvest(parsed) {
  const token = await getJwtToken();
  if (!token) {
    return { success: false, error: 'Authentication failed — cannot reach backend' };
  }

  try {
    const response = await axios.post(
      `${BACKEND_URL}/herbs/harvest`,
      {
        name:        parsed.herb,
        species:     '',  // not available via SMS
        location:    parsed.location,
        quantity:    parsed.qty,
        unit:        parsed.unit,
        harvestDate: new Date().toISOString().split('T')[0],
        notes:       `${parsed.notes} | Collector: ${parsed.collector} | SMS HerbID: ${parsed.herbId}`
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return { success: true, data: response.data };
  } catch (err) {
    // If 401, clear cached token so next request re-authenticates
    if (err.response?.status === 401) {
      cachedToken = null;
    }
    const errMsg = err.response?.data?.message || err.message;
    return { success: false, error: errMsg };
  }
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// Health check
app.get('/', (_req, res) => {
  res.json({
    name: 'Herb-Tracechain SMS Gateway',
    status: 'running',
    port: PORT,
    backendUrl: BACKEND_URL,
    mockMode: process.env.USE_MOCK_SMS === 'true',
    endpoints: {
      health: 'GET /',
      twilioWebhook: 'POST /sms/incoming',
      mockTest: 'POST /sms/test'
    }
  });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'SMS gateway running', mock: process.env.USE_MOCK_SMS });
});

// ---------------------------------------------------------------------------
// POST /sms/incoming — Twilio webhook (receives real SMS)
// ---------------------------------------------------------------------------
app.post('/sms/incoming', async (req, res) => {
  // Twilio sends: Body (message text), From (sender number)
  const messageText = req.body.Body || req.body.text || '';
  const fromNumber  = req.body.From || req.body.from || 'unknown';

  console.log(`\n📨 [SMS RECEIVED]`);
  console.log(`   From: ${fromNumber}`);
  console.log(`   Text: ${messageText}`);

  // Parse the SMS
  const parsed = parseSMS(messageText);

  if (!parsed) {
    await sendReply(fromNumber,
      'ERROR: Could not parse message.\nFormat: HARVEST HerbID:xxx Collector:xxx Location:xxx Herb:xxx Qty:xxx Unit:kg'
    );
    return res.status(200).send('OK');
  }

  if (parsed.error) {
    await sendReply(fromNumber, `ERROR: ${parsed.error}`);
    return res.status(200).send('OK');
  }

  console.log('   Parsed:', JSON.stringify(parsed));

  // Call backend
  const result = await recordHarvest(parsed);

  if (result.success) {
    const herbId = result.data.herbId || 'N/A';
    await sendReply(fromNumber,
      `✅ SUCCESS: Herb "${parsed.herb}" recorded!\nID: ${herbId}\nLocation: ${parsed.location}\nQty: ${parsed.qty} ${parsed.unit}`
    );
  } else {
    await sendReply(fromNumber, `❌ ERROR: ${result.error}`);
  }

  res.status(200).send('OK');
});

// ---------------------------------------------------------------------------
// POST /sms/test — Mock test endpoint (simulate SMS without Twilio)
// ---------------------------------------------------------------------------
app.post('/sms/test', async (req, res) => {
  const { text, from } = req.body;

  if (!text) {
    return res.status(400).json({
      error: 'text field required',
      example: 'HARVEST HerbID:H001 Collector:C01 Location:Kerala Herb:Ashwagandha Qty:50 Unit:kg'
    });
  }

  const fromNumber = from || '+910000000000';

  console.log(`\n🧪 [TEST SMS]`);
  console.log(`   From: ${fromNumber}`);
  console.log(`   Text: ${text}`);

  // Parse
  const parsed = parseSMS(text);

  if (!parsed) {
    return res.json({ status: 'parse_failed', input: text });
  }

  if (parsed.error) {
    return res.json({ status: 'parse_error', error: parsed.error, input: text });
  }

  console.log('   Parsed:', JSON.stringify(parsed));

  // Call backend
  const result = await recordHarvest(parsed);

  if (result.success) {
    await sendReply(fromNumber,
      `✅ SUCCESS: Herb "${parsed.herb}" recorded! ID: ${result.data.herbId}`
    );
    return res.json({
      status: 'success',
      parsed,
      backendResponse: result.data
    });
  } else {
    await sendReply(fromNumber, `❌ ERROR: ${result.error}`);
    return res.json({
      status: 'backend_error',
      parsed,
      error: result.error
    });
  }
});

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
app.listen(PORT, async () => {
  console.log(`\n🌿 SMS Gateway running on http://localhost:${PORT}`);
  console.log(`   Mock mode: ${process.env.USE_MOCK_SMS === 'true' ? 'ON (no real SMS)' : 'OFF (Twilio active)'}`);
  console.log(`   Backend:   ${BACKEND_URL}`);

  // Pre-authenticate with backend on startup
  await getJwtToken();

  console.log(`\n   Test with:`);
  console.log(`   POST http://localhost:${PORT}/sms/test`);
  console.log(`   Body: {"text":"HARVEST HerbID:H001 Collector:C01 Location:Kerala Herb:Ashwagandha Qty:50 Unit:kg"}\n`);
});
