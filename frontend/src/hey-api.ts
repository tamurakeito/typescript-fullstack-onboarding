import type { CreateClientConfig } from "./client/client.gen";

const token = localStorage.getItem("token");

export const createClientConfig: CreateClientConfig = (config) => ({
  ...config,
  headers: {
    Authorization: `Bearer ${token}`,
  },
  baseUrl: import.meta.env.VITE_API_BASE_URL,
});
