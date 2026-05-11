# Architecture — Blockchain-Based Botanical Traceability System

## Overview
Dual-blockchain supply chain traceability platform for medicinal herbs.
- Hyperledger Fabric v2.5.0 — permissioned private ledger
- Ethereum Sepolia testnet — public hash anchoring

## Network
- Org1 (Collectors): peer0.org1.example.com — port 7051
- Org2 (Processors): peer0.org2.example.com — port 9051
- Orderer: port 7050 (Raft consensus)
- Channel: mychannel
- Chaincode: herbcc (Go, CCaaS on port 9999)

## Ethereum
- Contract: HerbVerification.sol
- Address: 0xb9bdFbC3f659a863FFF8646046059B9C8BDfaB8E
- Anchors SHA-256 hash on harvest and distribute events
- Verify: https://sepolia.etherscan.io/address/0xb9bdFbC3f659a863FFF8646046059B9C8BDfaB8E

## Services
| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | React + Vite + Tailwind |
| Backend API | 3001 | Node.js + Express, Fabric SDK, ethers.js |
| SMS Gateway | 3002 | Inbound SMS parsing, relays to backend |
| Chaincode | 9999 | Go binary (CCaaS) |

## Data Flow
Collector (web) → POST /herbs/harvest → Fabric + Ethereum
SMS → Gateway:3002 → POST /herbs/harvest → Fabric + Ethereum
Consumer → Scan QR → GET /herbs/verify/:herbId → Fabric + Ethereum

## Herb Status Flow
HARVESTED → IN_TRANSIT → PROCESSING → PACKAGED → DISTRIBUTED

## Key Files
| File | Purpose |
|------|---------|
| fabric/chaincode/herb-go/herb.go | Go chaincode |
| backend/ethereumService.js | Ethereum anchoring |
| backend/routes-herbs.js | REST API routes |
| eth/contracts/HerbVerification.sol | Solidity contract |
| client/src/contexts/AuthContext.tsx | JWT auth context |