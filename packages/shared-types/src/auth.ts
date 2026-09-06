export interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  country: string;
  streetAddress: string;
  postalCode: string;
  /**
   * Non consomme par le backend aujourd'hui (livrable H) : conserve ici pour
   * que le formulaire d'onboarding puisse l'envoyer des que l'API l'acceptera,
   * sans changement de contrat cote client.
   */
  role?: 'CLIENT' | 'PRESTATAIRE';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}
