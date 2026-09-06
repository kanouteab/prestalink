import { ApiClient, createApiServices, type TokenStore } from '@prestalink/api-client';
import { readToken } from './authStorage';
import { useAuthStore } from '../store/authStore';

/**
 * EXPO_PUBLIC_API_BASE_URL doit pointer vers l'IP LAN de la machine de dev
 * (pas "localhost", qui sur un appareil/simulateur designe l'appareil
 * lui-meme) — voir apps/mobile/.env.example.
 */
const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

const tokenStore: TokenStore = {
  getToken: () => readToken(),
  onUnauthorized: () => {
    useAuthStore.getState().clearSession();
  },
};

export const apiClient = new ApiClient({ baseUrl, tokenStore });
export const api = createApiServices(apiClient);
