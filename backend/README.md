# Herb-Tracechain Backend API

Node.js + Express backend for the Herb-Tracechain blockchain supply chain system.

## Quick Start

### 1. Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier: [cloud.mongodb.com](https://cloud.mongodb.com))

### 2. Setup
```bash
cd backend
npm install

# Create .env from template
cp .env.example .env
# Edit .env — paste your MongoDB Atlas connection string
```

### 3. Seed Initial Users
```bash
npm run seed:users
```
Creates 3 accounts (all passwords: `password`):
| Email | Role |
|-------|------|
| collector@example.com | collector |
| processor@example.com | processor |
| admin@example.com | admin |

### 4. Run
```bash
npm run dev     # development (nodemon)
npm start       # production
```
Server starts on `http://localhost:5000`

## API Endpoints

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | — | Login with email/password |
| POST | `/auth/register` | — | Register new user |

### Herb Lifecycle
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/herbs/harvest` | collector | Record new harvest |
| POST | `/herbs/transfer` | collector | Transfer to processor |
| POST | `/herbs/process` | processor | Record processing |
| POST | `/herbs/package` | processor | Record packaging |
| POST | `/herbs/distribute` | processor | Record distribution |

### Queries
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/herbs/my-herbs` | any | User's herbs |
| GET | `/herbs/in-progress` | processor | Processing pipeline |
| GET | `/herbs/all` | admin | All herbs (filterable) |
| GET | `/herbs/verify/:herbId` | — | Public verification |

### Health Check
```
GET /health
```

## Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `MONGODB_URI` | MongoDB Atlas connection string | — |
| `JWT_SECRET` | JWT signing secret | — |
| `JWT_EXPIRES_IN` | Token expiry | 24h |
| `FABRIC_ENABLED` | Enable Fabric chaincode integration | false |
| `ETHEREUM_ENABLED` | Enable Ethereum hash anchoring | false |
