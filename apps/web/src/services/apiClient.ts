import { ApiClient, createApiServices, type TokenStore } from '@prestalink/api-client';
import { readToken } from './authStorage';
import { useAuthStore } from '../store/authStore';

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

const tokenStore: TokenStore = {
  getToken: () => readToken(),
  onUnauthorized: () => useAuthStore.getState().clearSession(),
};

export const apiClient = new ApiClient({ baseUrl, tokenStore });
export const api = createApiServices(apiClient);
