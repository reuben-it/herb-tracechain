# SMS Gateway — Herb-Tracechain

Standalone SMS gateway that receives herb harvest data via text message and records it on the blockchain through the backend API.

## How It Works

```
Farmer sends SMS → Twilio → POST /sms/incoming → Parse SMS → POST /herbs/harvest (backend) → MongoDB + Fabric
                                                            → Reply SMS (success/error)
```

## Quick Start

### 1. Install
```bash
cd sms-gateway
npm install
```

### 2. Configure
```bash
cp .env.example .env
# Edit .env if needed (defaults work for local dev)
```

### 3. Run
```bash
# Make sure the backend is running on port 5000 first!
npm run dev
```

Gateway starts on `http://localhost:3002`

## SMS Format

```
HARVEST HerbID:H001 Collector:C01 Location:Kerala Herb:Ashwagandha Qty:50 Unit:kg Notes:Fresh
```

| Field | Required | Example |
|-------|----------|---------|
| HerbID | Yes | H001 |
| Collector | Yes | C01 |
| Location | Yes | Kerala |
| Herb | Yes | Ashwagandha |
| Qty | Yes | 50 |
| Unit | Yes | kg |
| Notes | No | Fresh-harvest |

**Rules:**
- Must start with `HARVEST` (case-insensitive)
- No spaces in field values (use hyphens: `Notes:Fresh-Batch`)
- HerbID should be unique per harvest

## Testing (Mock Mode)

No Twilio account needed — `USE_MOCK_SMS=true` logs replies to console.

### Test via API:
```bash
# PowerShell
Invoke-RestMethod -Uri http://localhost:3002/sms/test -Method POST -ContentType "application/json" -Body '{"text":"HARVEST HerbID:H001 Collector:C01 Location:Kerala Herb:Ashwagandha Qty:50 Unit:kg","from":"+911234567890"}'
```

### Test parse errors:
```bash
Invoke-RestMethod -Uri http://localhost:3002/sms/test -Method POST -ContentType "application/json" -Body '{"text":"HARVEST HerbID:H001 Collector:C01"}'
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Gateway info |
| GET | `/health` | Health check |
| POST | `/sms/incoming` | Twilio webhook (real SMS) |
| POST | `/sms/test` | Mock test (simulate SMS) |

## Twilio Setup (Production)

1. Create account at [twilio.com](https://twilio.com)
2. Get a trial phone number
3. Set in `.env`: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
4. Set `USE_MOCK_SMS=false`
5. In Twilio Console → Phone Numbers → Messaging webhook:
   Set to `https://<your-domain>/sms/incoming`

## Architecture

- **Port 3002** — SMS gateway
- **Port 5000** — Backend API (must be running)
- Auto-authenticates with backend using collector credentials
- JWT token is cached and refreshed on 401
