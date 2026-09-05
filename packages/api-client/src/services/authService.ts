import type { ApiClient } from '../httpClient.js';
import type {
  LoginRequest,
  LoginResult,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  UserResponse,
} from '@prestalink/shared-types';

export function createAuthService(client: ApiClient) {
  return {
    register: (payload: RegisterRequest) =>
      client.post<UserResponse>('/api/auth/register', payload, { auth: false }),

    login: (payload: LoginRequest) =>
      client.post<LoginResult>('/api/auth/login', payload, { auth: false }),

    logout: () => client.post<void>('/api/auth/logout'),

    me: () => client.get<UserResponse>('/api/auth/me'),

    sendVerificationEmail: () => client.post<void>('/api/auth/send-verification-email', undefined, { auth: false }),
    verifyEmail: (token: string) => client.get<void>('/api/auth/verify-email', { token }, { auth: false }),

    sendPhoneVerificationCode: () => client.post<void>('/api/auth/send-phone-verification-code', undefined, { auth: false }),
    verifyPhone: (code: string) => client.post<void>('/api/auth/verify-phone', { code }, { auth: false }),

    forgotPassword: (payload: ForgotPasswordRequest) =>
      client.post<void>('/api/auth/forgot-password', payload, { auth: false }),

    resetPassword: (payload: ResetPasswordRequest) =>
      client.post<void>('/api/auth/reset-password', payload, { auth: false }),

    findEmail: (payload: { phone: string; fullName: string }) =>
      client.post<{ maskedEmail: string }>('/api/auth/find-email', payload, { auth: false }),
  };
}

export type AuthService = ReturnType<typeof createAuthService>;
