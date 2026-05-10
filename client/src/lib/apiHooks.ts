import axios, { AxiosInstance } from "axios";

export async function apiLogin(apiClient: AxiosInstance, email: string, password: string) {
  const response = await apiClient.post("/auth/login", { email, password });
  return response.data;
}

export async function apiHarvestHerb(apiClient: AxiosInstance, data: { name: string; species: string; location: string; quantity: string; harvestDate: string }) {
  const response = await apiClient.post("/herbs/harvest", data);
  return response.data;
}

export async function apiTransferHerb(apiClient: AxiosInstance, data: { herbId: string; recipientEmail: string; notes: string }) {
  const response = await apiClient.post("/herbs/transfer", data);
  return response.data;
}

export async function apiGetMyHerbs(apiClient: AxiosInstance) {
  const response = await apiClient.get("/herbs/my-herbs");
  return response.data;
}

export async function apiProcessHerb(apiClient: AxiosInstance, data: { herbId: string; processingMethod: string; duration: string; temperature: string; notes: string }) {
  const response = await apiClient.post("/herbs/process", data);
  return response.data;
}

export async function apiPackageHerb(apiClient: AxiosInstance, data: { herbId: string; packageSize: string; packageType: string; quantity: string; expiryDate: string }) {
  const response = await apiClient.post("/herbs/package", data);
  return response.data;
}

export async function apiDistributeHerb(apiClient: AxiosInstance, data: { herbId: string; recipientEmail: string; distributionDate: string; notes: string }) {
  const response = await apiClient.post("/herbs/distribute", data);
  return response.data;
}

export async function apiGetInProgressHerbs(apiClient: AxiosInstance) {
  const response = await apiClient.get("/herbs/in-progress");
  return response.data;
}

export async function apiGetAllHerbs(apiClient: AxiosInstance, filters?: { status?: string; search?: string }) {
  const response = await apiClient.get("/herbs/all", { params: filters });
  return response.data;
}

export async function apiVerifyHerb(herbId: string) {
  const response = await axios.get(`https://solid-acorn-69g77pg9vgvwcrq9-3001.app.github.dev/herbs/verify/${herbId}`);
  return response.data;
}

export async function apiGetReadyToPackageHerbs(apiClient: AxiosInstance) {
  const response = await apiClient.get("/herbs/ready-to-package");
  return response.data;
}

export async function apiGetReadyToDistributeHerbs(apiClient: AxiosInstance) {
  const response = await apiClient.get("/herbs/ready-to-distribute");
  return response.data;
}