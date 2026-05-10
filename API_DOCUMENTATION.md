# Herb-Tracechain API Documentation

This document describes all API endpoints required for the Phase 5 frontend.

## Base URL

```
http://localhost:5000/api
```

Or set via environment variable:
```
VITE_API_URL=<backend_url>
```

## Authentication

All authenticated endpoints require the `Authorization` header:
```
Authorization: Bearer <JWT_TOKEN>
```

The JWT token is obtained from the login endpoint and stored in localStorage.

---

## Authentication Endpoints

### Login
**POST** `/auth/login`

Authenticate user and receive JWT token.

**Request:**
```json
{
  "email": "collector@example.com",
  "password": "password"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-123",
    "email": "collector@example.com",
    "role": "collector",
    "name": "John Collector"
  }
}
```

**Error (401):**
```json
{
  "message": "Invalid credentials"
}
```

---

## Herb Management Endpoints

### Harvest Herb
**POST** `/herbs/harvest`

Record a new herb harvest.

**Authentication:** Required (collector role)

**Request:**
```json
{
  "name": "Basil",
  "species": "Ocimum basilicum",
  "location": "Field A",
  "quantity": "50",
  "harvestDate": "2026-05-08"
}
```

**Response (201):**
```json
{
  "herbId": "herb-abc123",
  "message": "Herb harvested successfully"
}
```

**Error (400):**
```json
{
  "message": "Missing required fields"
}
```

---

### Transfer Herb
**POST** `/herbs/transfer`

Transfer herb to another user (processor).

**Authentication:** Required (collector role)

**Request:**
```json
{
  "herbId": "herb-abc123",
  "recipientEmail": "processor@example.com",
  "notes": "Ready for processing"
}
```

**Response (200):**
```json
{
  "message": "Herb transferred successfully"
}
```

**Error (404):**
```json
{
  "message": "Herb not found"
}
```

---

### Get My Herbs
**GET** `/herbs/my-herbs`

Retrieve all herbs belonging to the current user.

**Authentication:** Required

**Response (200):**
```json
{
  "herbs": [
    {
      "id": "herb-abc123",
      "name": "Basil",
      "species": "Ocimum basilicum",
      "harvestDate": "2026-05-08",
      "status": "HARVESTED",
      "location": "Field A"
    }
  ]
}
```

---

### Process Herb
**POST** `/herbs/process`

Record processing details for a herb.

**Authentication:** Required (processor role)

**Request:**
```json
{
  "herbId": "herb-abc123",
  "processingMethod": "Drying",
  "duration": "24",
  "temperature": "60",
  "notes": "Dried at low temperature"
}
```

**Response (200):**
```json
{
  "message": "Processing recorded successfully"
}
```

---

### Package Herb
**POST** `/herbs/package`

Record packaging details for a herb.

**Authentication:** Required (processor role)

**Request:**
```json
{
  "herbId": "herb-abc123",
  "packageSize": "500g",
  "packageType": "Box",
  "quantity": "10",
  "expiryDate": "2027-05-08"
}
```

**Response (200):**
```json
{
  "message": "Packaging recorded successfully"
}
```

---

### Distribute Herb
**POST** `/herbs/distribute`

Record distribution of herb to recipient.

**Authentication:** Required (processor role)

**Request:**
```json
{
  "herbId": "herb-abc123",
  "recipientEmail": "retailer@example.com",
  "distributionDate": "2026-05-08",
  "notes": "Shipped via courier"
}
```

**Response (200):**
```json
{
  "message": "Distribution recorded successfully"
}
```

---

### Get In-Progress Herbs
**GET** `/herbs/in-progress`

Retrieve herbs currently being processed.

**Authentication:** Required (processor role)

**Response (200):**
```json
{
  "herbs": [
    {
      "id": "herb-abc123",
      "name": "Basil",
      "species": "Ocimum basilicum",
      "status": "PROCESSING",
      "receivedDate": "2026-05-07",
      "currentStage": "PROCESSING"
    }
  ]
}
```

---

### Get All Herbs
**GET** `/herbs/all`

Retrieve all herbs in the system (admin only).

**Authentication:** Required (admin role)

**Query Parameters:**
- `status` (optional): Filter by status (HARVESTED, PROCESSED, PACKAGED, DISTRIBUTED, VERIFIED)
- `search` (optional): Search by name, species, or ID

**Response (200):**
```json
{
  "herbs": [
    {
      "id": "herb-abc123",
      "name": "Basil",
      "species": "Ocimum basilicum",
      "status": "VERIFIED",
      "harvestDate": "2026-05-08",
      "ethereumHash": "0x1234567890abcdef...",
      "verificationStatus": "verified",
      "timeline": [
        {
          "stage": "HARVESTED",
          "timestamp": "2026-05-08T10:00:00Z",
          "status": "completed"
        },
        {
          "stage": "PROCESSED",
          "timestamp": "2026-05-09T10:00:00Z",
          "status": "completed"
        },
        {
          "stage": "PACKAGED",
          "timestamp": "2026-05-10T10:00:00Z",
          "status": "completed"
        },
        {
          "stage": "DISTRIBUTED",
          "timestamp": "2026-05-11T10:00:00Z",
          "status": "completed"
        },
        {
          "stage": "VERIFIED",
          "timestamp": "2026-05-12T10:00:00Z",
          "status": "completed"
        }
      ],
      "collectorEmail": "collector@example.com",
      "processorEmail": "processor@example.com",
      "notes": "High quality basil"
    }
  ]
}
```

---

### Verify Herb (Public)
**GET** `/herbs/verify/:herbId`

Retrieve herb information for public verification. No authentication required.

**Authentication:** Not required

**Response (200):**
```json
{
  "herb": {
    "id": "herb-abc123",
    "name": "Basil",
    "species": "Ocimum basilicum",
    "status": "VERIFIED",
    "harvestDate": "2026-05-08",
    "ethereumHash": "0x1234567890abcdef...",
    "verificationStatus": "verified",
    "timeline": [
      {
        "stage": "HARVESTED",
        "timestamp": "2026-05-08T10:00:00Z",
        "status": "completed"
      },
      {
        "stage": "PROCESSED",
        "timestamp": "2026-05-09T10:00:00Z",
        "status": "completed"
      },
      {
        "stage": "PACKAGED",
        "timestamp": "2026-05-10T10:00:00Z",
        "status": "completed"
      },
      {
        "stage": "DISTRIBUTED",
        "timestamp": "2026-05-11T10:00:00Z",
        "status": "completed"
      },
      {
        "stage": "VERIFIED",
        "timestamp": "2026-05-12T10:00:00Z",
        "status": "completed"
      }
    ],
    "collectorName": "John Collector",
    "processorName": "Jane Processor",
    "notes": "High quality basil"
  }
}
```

**Error (404):**
```json
{
  "message": "Herb not found"
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "message": "Invalid request data"
}
```

### 401 Unauthorized
```json
{
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

---

## Request/Response Headers

### Request Headers
```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>  (for authenticated endpoints)
```

### Response Headers
```
Content-Type: application/json
```

---

## Data Models

### User
```typescript
{
  id: string;
  email: string;
  role: "collector" | "processor" | "admin";
  name: string;
}
```

### Herb
```typescript
{
  id: string;
  name: string;
  species: string;
  status: "HARVESTED" | "PROCESSED" | "PACKAGED" | "DISTRIBUTED" | "VERIFIED";
  harvestDate: string; // ISO 8601 date
  ethereumHash: string;
  verificationStatus: "verified" | "pending" | "failed";
  timeline: TimelineEvent[];
  collectorEmail: string;
  processorEmail?: string;
  notes: string;
}
```

### TimelineEvent
```typescript
{
  stage: "HARVESTED" | "PROCESSED" | "PACKAGED" | "DISTRIBUTED" | "VERIFIED";
  timestamp: string; // ISO 8601 datetime
  status: "completed" | "current" | "future";
}
```

---

## Rate Limiting

No rate limiting is currently implemented. Implement rate limiting on the backend for production.

---

## CORS

The frontend expects the backend to allow CORS requests from:
- `http://localhost:3000`
- `http://localhost:5173`
- Production domain

Configure CORS headers:
```
Access-Control-Allow-Origin: <frontend_url>
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## Implementation Notes

1. **JWT Token**: Store in localStorage after login. Include in all authenticated requests.
2. **Error Handling**: Display toast notifications for all errors.
3. **Loading States**: Show loading indicators during API calls.
4. **Pagination**: Not currently implemented. Add if needed for large datasets.
5. **Caching**: Consider implementing caching for GET endpoints to improve performance.

---

## Testing

Use tools like Postman or curl to test endpoints:

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"collector@example.com","password":"password"}'

# Harvest herb (with token)
curl -X POST http://localhost:5000/api/herbs/harvest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"name":"Basil","species":"Ocimum basilicum","location":"Field A","quantity":"50","harvestDate":"2026-05-08"}'

# Get all herbs (admin)
curl -X GET http://localhost:5000/api/herbs/all \
  -H "Authorization: Bearer <TOKEN>"

# Verify herb (public)
curl -X GET http://localhost:5000/api/herbs/verify/herb-abc123
```

---

## Future Enhancements

1. Add batch operations for multiple herbs
2. Implement webhook notifications
3. Add file upload for herb images/documents
4. Implement export functionality (CSV, PDF)
5. Add real-time updates via WebSocket
6. Implement advanced filtering and sorting
7. Add audit logging for all operations
