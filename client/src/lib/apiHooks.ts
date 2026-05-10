/**
 * API Hooks - Backend Integration Points
 * 
 * These hooks are designed to work with mock data initially.
 * Replace the mock implementations with actual API calls when backend is ready.
 * 
 * BACKEND INTEGRATION GUIDE:
 * 1. Replace mockData imports with actual axios calls
 * 2. Update endpoint URLs to match your backend
 * 3. Keep the function signatures unchanged for frontend compatibility
 */

import { AxiosInstance } from "axios";
import { delay, mockHerbs, mockUsers, generateMockToken } from "./mockData";

// ============================================================================
// AUTHENTICATION HOOKS
// ============================================================================

/**
 * Hook: Login User
 * 
 * BACKEND: Replace with POST /auth/login
 * Expected Response: { token: string, user: { id, email, role, name } }
 */
export async function apiLogin(
  apiClient: AxiosInstance,
  email: string,
  password: string
) {
  // TODO: Replace with actual API call
  // const response = await apiClient.post("/auth/login", { email, password });
  // return response.data;

  // MOCK IMPLEMENTATION
  await delay();
  const user = mockUsers[email as keyof typeof mockUsers];
  if (!user || user.password !== password) {
    throw new Error("Invalid credentials");
  }
  return {
    token: generateMockToken(user.user.id),
    user: user.user,
  };
}

// ============================================================================
// COLLECTOR ENDPOINTS
// ============================================================================

/**
 * Hook: Harvest Herb
 * 
 * BACKEND: Replace with POST /herbs/harvest
 * Expected Response: { herbId: string, message: string }
 */
export async function apiHarvestHerb(
  apiClient: AxiosInstance,
  data: {
    name: string;
    species: string;
    location: string;
    quantity: string;
    harvestDate: string;
  }
) {
  // TODO: Replace with actual API call
  // const response = await apiClient.post("/herbs/harvest", data);
  // return response.data;

  // MOCK IMPLEMENTATION
  await delay();
  const herbId = `herb-${Date.now()}`;
  return {
    herbId,
    message: "Herb harvested successfully",
  };
}

/**
 * Hook: Transfer Herb
 * 
 * BACKEND: Replace with POST /herbs/transfer
 * Expected Response: { message: string }
 */
export async function apiTransferHerb(
  apiClient: AxiosInstance,
  data: {
    herbId: string;
    recipientEmail: string;
    notes: string;
  }
) {
  // TODO: Replace with actual API call
  // const response = await apiClient.post("/herbs/transfer", data);
  // return response.data;

  // MOCK IMPLEMENTATION
  await delay();
  return { message: "Herb transferred successfully" };
}

/**
 * Hook: Get My Herbs
 * 
 * BACKEND: Replace with GET /herbs/my-herbs
 * Expected Response: { herbs: Herb[] }
 */
export async function apiGetMyHerbs(apiClient: AxiosInstance) {
  // TODO: Replace with actual API call
  // const response = await apiClient.get("/herbs/my-herbs");
  // return response.data;

  // MOCK IMPLEMENTATION
  await delay();
  return {
    herbs: mockHerbs.slice(0, 3),
  };
}

// ============================================================================
// PROCESSOR ENDPOINTS
// ============================================================================

/**
 * Hook: Process Herb
 * 
 * BACKEND: Replace with POST /herbs/process
 * Expected Response: { message: string }
 */
export async function apiProcessHerb(
  apiClient: AxiosInstance,
  data: {
    herbId: string;
    processingMethod: string;
    duration: string;
    temperature: string;
    notes: string;
  }
) {
  // TODO: Replace with actual API call
  // const response = await apiClient.post("/herbs/process", data);
  // return response.data;

  // MOCK IMPLEMENTATION
  await delay();
  return { message: "Processing recorded successfully" };
}

/**
 * Hook: Package Herb
 * 
 * BACKEND: Replace with POST /herbs/package
 * Expected Response: { message: string }
 */
export async function apiPackageHerb(
  apiClient: AxiosInstance,
  data: {
    herbId: string;
    packageSize: string;
    packageType: string;
    quantity: string;
    expiryDate: string;
  }
) {
  // TODO: Replace with actual API call
  // const response = await apiClient.post("/herbs/package", data);
  // return response.data;

  // MOCK IMPLEMENTATION
  await delay();
  return { message: "Packaging recorded successfully" };
}

/**
 * Hook: Distribute Herb
 * 
 * BACKEND: Replace with POST /herbs/distribute
 * Expected Response: { message: string }
 */
export async function apiDistributeHerb(
  apiClient: AxiosInstance,
  data: {
    herbId: string;
    recipientEmail: string;
    distributionDate: string;
    notes: string;
  }
) {
  // TODO: Replace with actual API call
  // const response = await apiClient.post("/herbs/distribute", data);
  // return response.data;

  // MOCK IMPLEMENTATION
  await delay();
  return { message: "Distribution recorded successfully" };
}

/**
 * Hook: Get In-Progress Herbs
 * 
 * BACKEND: Replace with GET /herbs/in-progress
 * Expected Response: { herbs: InProgressHerb[] }
 */
export async function apiGetInProgressHerbs(apiClient: AxiosInstance) {
  // TODO: Replace with actual API call
  // const response = await apiClient.get("/herbs/in-progress");
  // return response.data;

  // MOCK IMPLEMENTATION
  await delay();
  return {
    herbs: mockHerbs.slice(1, 4).map((herb) => ({
      id: herb.id,
      name: herb.name,
      species: herb.species,
      status: herb.status,
      receivedDate: herb.harvestDate,
      currentStage: herb.status,
    })),
  };
}

// ============================================================================
// ADMIN ENDPOINTS
// ============================================================================

/**
 * Hook: Get All Herbs
 * 
 * BACKEND: Replace with GET /herbs/all
 * Expected Response: { herbs: HerbDetail[] }
 */
export async function apiGetAllHerbs(
  apiClient: AxiosInstance,
  filters?: { status?: string; search?: string }
) {
  // TODO: Replace with actual API call
  // const response = await apiClient.get("/herbs/all", { params: filters });
  // return response.data;

  // MOCK IMPLEMENTATION
  await delay();
  let filtered = [...mockHerbs];

  if (filters?.status && filters.status !== "all") {
    filtered = filtered.filter((h) => h.status === filters.status);
  }

  if (filters?.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(
      (h) =>
        h.name.toLowerCase().includes(search) ||
        h.species.toLowerCase().includes(search) ||
        h.id.toLowerCase().includes(search)
    );
  }

  return { herbs: filtered };
}

// ============================================================================
// PUBLIC ENDPOINTS (No Authentication Required)
// ============================================================================

/**
 * Hook: Verify Herb (Public)
 * 
 * BACKEND: Replace with GET /herbs/verify/:herbId
 * Expected Response: { herb: HerbVerificationData }
 */
export async function apiVerifyHerb(herbId: string) {
  // TODO: Replace with actual API call
  // const response = await axios.get(`/api/herbs/verify/${herbId}`);
  // return response.data;

  // MOCK IMPLEMENTATION
  await delay();
  const herb = mockHerbs.find((h) => h.id === herbId);

  if (!herb) {
    throw new Error("Herb not found");
  }

  return {
    herb: {
      ...herb,
      collectorName: "John Collector",
      processorName: "Jane Processor",
    },
  };
}

// ============================================================================
// BACKEND INTEGRATION CHECKLIST
// ============================================================================

/**
 * INTEGRATION STEPS:
 * 
 * 1. AUTHENTICATION
 *    - [ ] Replace apiLogin with actual POST /auth/login
 *    - [ ] Verify JWT token is returned and stored
 *    - [ ] Test with demo credentials
 * 
 * 2. COLLECTOR FEATURES
 *    - [ ] Replace apiHarvestHerb with POST /herbs/harvest
 *    - [ ] Replace apiTransferHerb with POST /herbs/transfer
 *    - [ ] Replace apiGetMyHerbs with GET /herbs/my-herbs
 *    - [ ] Verify QR code generation works with real herbIds
 * 
 * 3. PROCESSOR FEATURES
 *    - [ ] Replace apiProcessHerb with POST /herbs/process
 *    - [ ] Replace apiPackageHerb with POST /herbs/package
 *    - [ ] Replace apiDistributeHerb with POST /herbs/distribute
 *    - [ ] Replace apiGetInProgressHerbs with GET /herbs/in-progress
 * 
 * 4. ADMIN FEATURES
 *    - [ ] Replace apiGetAllHerbs with GET /herbs/all
 *    - [ ] Verify filtering and search work correctly
 *    - [ ] Test timeline data structure
 * 
 * 5. PUBLIC VERIFICATION
 *    - [ ] Replace apiVerifyHerb with GET /herbs/verify/:herbId
 *    - [ ] Test QR code scanning and verification
 *    - [ ] Verify blockchain hash display
 * 
 * 6. ERROR HANDLING
 *    - [ ] Test all error scenarios (404, 401, 500)
 *    - [ ] Verify error messages display correctly
 *    - [ ] Test network timeout handling
 * 
 * 7. TESTING
 *    - [ ] Test all workflows end-to-end
 *    - [ ] Verify JWT token refresh if needed
 *    - [ ] Test role-based access control
 */
