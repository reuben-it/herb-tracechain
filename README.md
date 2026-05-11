# Blockchain-Based Botanical Traceability System
## Herb-Tracechain — a dual-blockchain supply chain traceability system for medicinal herbs

## Overview
Herb-Tracechain tracks medicinal herb batches from field harvest through processing, packaging, and distribution using a hybrid blockchain architecture. It combines Hyperledger Fabric for permissioned private record-keeping with Ethereum for public cryptographic verification, enabling any consumer to independently verify a product's authenticity via QR code.

Built as a Theme Based Project by CH Reuben Moses, 6th Semester IT, Vasavi College of Engineering (Autonomous), 2025–26.

## Architecture

- **Hyperledger Fabric v2.5.0** — permissioned private ledger, two-org network (Org1: Collectors, Org2: Processors), channel `mychannel`, Raft consensus
- **Ethereum (Sepolia testnet)** — public hash anchoring via `HerbVerification.sol`, contract at `0xb9bdFbC3f659a863FFF8646046059B9C8BDfaB8E`
- **Go chaincode (CCaaS)** — deployed as external binary on port 9999, handles all on-chain business logic
- **Node.js + Express** — backend API bridging Fabric SDK and Ethereum ethers.js
- **React + Vite + Tailwind** — role-based frontend dashboards
- **SMS Gateway** — inbound SMS parsing for rural collector access (mock mode supported)

## Features

- Full herb lifecycle tracking: Harvest → Transfer → Process → Package → Distribute
- Role-based access control enforced at chaincode level (Org1MSP / Org2MSP)
- Dual-blockchain verification: Fabric stores records, Ethereum anchors SHA-256 hashes
- QR code generation per herb batch for consumer-facing public verification
- JWT-authenticated REST API
- SMS harvest input for rural collectors without smartphone access
- Admin dashboard with status filtering and search across all herbs

## Folder Structure

```plaintext
herb-tracechain/
├── backend/                  # Node.js + Express API, Fabric SDK, Ethereum service
│   ├── index.js
│   ├── routes-herbs.js
│   ├── ethereumService.js
│   └── .env
├── fabric/
│   └── chaincode/
│       └── herb-go/          # Go chaincode (CCaaS binary)
│           ├── herb.go
│           ├── herbcc         # compiled Linux/amd64 binary
│           └── herbcc.tar.gz  # packaged for peer install
├── eth/
│   ├── contracts/
│   │   └── HerbVerification.sol
│   ├── scripts/
│   │   └── deploy.js
│   └── hardhat.config.js
├── client/                   # React frontend (Vite)
│   └── src/
│       ├── contexts/
│       │   └── AuthContext.tsx
│       └── lib/
│           └── apiHooks.ts
├── sms-gateway/              # SMS parsing and backend relay
│   └── index.js
├── docs/
│   └── architecture.md
├── .gitignore
└── README.md
```

## Demo Credentials

| Role | Email | Password | Redirects to |
|------|-------|----------|--------------|
| Collector | collector@example.com | password | /collector |
| Processor | processor@example.com | password | /processor |
| Admin | admin@example.com | password | /admin |

Public verify page (no login): `/verify/:herbId`

## Quick Start

### Prerequisites
- GitHub Codespaces (Ubuntu, 4-core) or WSL2 Ubuntu
- Docker Desktop with WSL2 backend
- Node.js v20.x, Go 1.22.2

### Start the network

```bash
# Terminal 1 — Fabric network
cd fabric-samples/test-network
./network.sh up createChannel -c mychannel -ca

# Install and commit chaincode (see startup-cmds.txt for full steps)
export PACKAGE_ID=<from queryinstalled>

# Terminal 1 — Chaincode binary (leave running)
cd fabric/chaincode/herb-go
CHAINCODE_SERVER_ADDRESS=0.0.0.0:9999 \
CORE_CHAINCODE_ID_NAME=$PACKAGE_ID \
CORE_PEER_TLS_ENABLED=false \
CORE_CHAINCODE_TLS_DISABLED=true \
./herbcc

# Terminal 2 — Backend
cd backend && node index.js

# Terminal 3 — Frontend
cd client && npm run dev

# Terminal 4 — SMS Gateway
cd sms-gateway && node index.js
```

### Health check

```bash
curl http://localhost:3001/health
curl http://localhost:3002/health
```

### Test SMS harvest

```bash
curl -X POST http://localhost:3002/sms/test \
  -H "Content-Type: application/json" \
  -d '{"text":"HARVEST HerbID:H001 Collector:C01 Location:Kerala Herb:Ashwagandha Qty:50 Unit:kg"}'
```

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | /auth/login | Login, returns JWT |
| POST | /herbs/harvest | Collector: record harvest + anchor Ethereum hash |
| POST | /herbs/transfer | Collector: transfer to processor |
| GET | /herbs/my-herbs | Collector: own herbs |
| POST | /herbs/process | Processor: record processing |
| POST | /herbs/package | Processor: record packaging |
| POST | /herbs/distribute | Processor: record distribution + anchor Ethereum hash |
| GET | /herbs/in-progress | Processor: IN_TRANSIT herbs |
| GET | /herbs/ready-to-package | Processor: PROCESSING herbs |
| GET | /herbs/ready-to-distribute | Processor: PACKAGED herbs |
| GET | /herbs/all | Admin: all herbs |
| GET | /herbs/verify/:herbId | Public: verify herb |

## Ethereum Contract

- **Network:** Sepolia testnet
- **Contract:** `0xb9bdFbC3f659a863FFF8646046059B9C8BDfaB8E`
- **Verify on Etherscan:** https://sepolia.etherscan.io/address/0xb9bdFbC3f659a863FFF8646046059B9C8BDfaB8E

| Function | Access | Description |
|----------|--------|-------------|
| storeHash(herbId, hash) | Owner only | Anchors hash after harvest/distribute |
| verifyHash(herbId) | Public | Returns stored hash |
| getTimestamp(herbId) | Public | Returns anchor timestamp |
| exists(herbId) | Public | Checks if herb is anchored |

## Development Status

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Project setup, repo, WSL2 environment | ✅ Complete |
| 2 | Fabric network — two-org, mychannel, Raft consensus | ✅ Complete |
| 3 | Go chaincode (CCaaS) — all lifecycle functions | ✅ Complete |
| 4 | Backend API — Node.js, Fabric SDK, JWT auth | ✅ Complete |
| 5 | Ethereum anchoring — Sepolia testnet, live | ✅ Complete |
| 6 | Frontend — React, role-based dashboards, QR codes | ✅ Complete |
| 7 | SMS Gateway — mock mode, end-to-end tested | ✅ Complete |

## Known Minor Issues

- Collector My Herbs list does not refresh automatically after a transfer (stale state)
- Ethereum hash field not displayed on the frontend verify page
- Species shows "N/A" for SMS-harvested herbs (SMS format does not include species)

## Repository

https://github.com/reuben-it/herb-tracechain
