# System Architecture

## Overview

The system is a hybrid blockchain-based traceability platform designed to track the lifecycle of Ayurvedic herbs from harvesting to final product verification. It integrates a permissioned blockchain (Hyperledger Fabric), a public verification layer (Ethereum), backend services, and multiple user interfaces including SMS and web applications.

---

## Architecture Layers

### 1. Client Layer

The client layer consists of multiple user interfaces:

- Feature Phone Users (via SMS)
- Mobile Application (React Native)
- Web Portal (Next.js)

These clients interact with the backend using HTTP/JSON or SMS.

---

### 2. Gateway / Entry Layer

This layer acts as the entry point into the system.

- SMS Gateway: Converts SMS messages into structured data
- API Gateway / Load Balancer: Routes incoming requests to backend services

It ensures that inputs from different sources are standardized before processing.

---

### 3. Backend Layer (Node.js + Express)

The backend is the core control layer of the system.

#### Components:
- Authentication & Role-Based Access Control (RBAC)
- Validation & Business Logic
- API Endpoints (CRUD operations)
- Blockchain Integration (Fabric SDK + Ethereum client)

#### Responsibilities:
- Validates incoming data
- Enforces role-based actions (collector, processor, etc.)
- Invokes blockchain transactions
- Handles communication between Fabric, Ethereum, and off-chain storage

---

### 4. Hyperledger Fabric Network (Core Blockchain)

This is the primary system of record.

#### Components:
- Peer (Org1)
- Peer (Org2)
- Orderer
- Chaincode (Smart Contract)

#### Functionality:
- Stores complete herb lifecycle data
- Executes smart contracts (chaincode)
- Ensures transaction endorsement and consensus
- Replicates data across multiple peers

#### Key Feature:
Data written to the blockchain is distributed and synchronized across all peers, demonstrating decentralization and consistency.

---

### 5. Off-Chain Storage & Integrations

Certain data is stored outside the blockchain for efficiency.

#### Includes:
- Index Database (SQL/NoSQL)
- Object Storage (images, certificates)
- ERP Systems

#### Purpose:
- Store large files (e.g., images, lab reports)
- Improve query performance
- Enable integration with external systems

Only cryptographic hashes of this data are stored on the blockchain.

---

### 6. Ethereum Public Verification Layer

Ethereum is used as a secondary blockchain layer.

#### Purpose:
- Store hash of herb data
- Provide public, tamper-proof verification

#### Workflow:
- Backend generates hash of herb data
- Hash is stored in Ethereum smart contract
- During verification, hash is compared with Fabric data

This ensures transparency without exposing sensitive data.

---

### 7. QR Code Verification System

Each herb batch is assigned a unique QR code.

#### Flow:
- QR code contains a verification URL or herb ID
- User scans QR
- Backend fetches data from Fabric
- Hash is verified against Ethereum

#### Outcome:
- If hashes match → Authentic
- If mismatch → Tampered

---

### 8. SMS Integration

To support rural collectors:

- Users send structured SMS
- SMS Gateway converts it into API request
- Backend processes and stores data in blockchain

This enables participation without requiring smartphones or internet access.

---

## Data Flow Summary

1. User submits herb data (via app or SMS)
2. Gateway processes input
3. Backend validates and authenticates request
4. Smart contract is invoked on Hyperledger Fabric
5. Data is stored and replicated across peers
6. Hash of data is generated and stored on Ethereum
7. QR code is generated for the batch
8. Consumer scans QR to verify authenticity

---

## Key Design Principles

- **Decentralization:** Data replicated across multiple blockchain peers
- **Immutability:** Once stored, data cannot be altered
- **Transparency:** Public verification via Ethereum
- **Scalability:** Off-chain storage for large data
- **Inclusivity:** SMS-based access for rural users
