/**
 * Contenu public deja expose par le backend sans authentification
 * (GET /api/admin/banners/active, GET /api/admin/branding/active) — a ne pas
 * confondre avec les endpoints CRUD /api/admin/banners et /api/admin/branding
 * qui restent hors perimetre de la refonte (reserves au back-office admin).
 */
export interface HomeBannerResponse {
  id: number;
  title: string;
  subtitle: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
  imageUrl: string;
  feature1?: string;
  feature2?: string;
  feature3?: string;
  feature4?: string;
  isActive: boolean;
}

export interface BrandingSettingsResponse {
  id: number;
  faviconUrl?: string;
  sidebarLogoUrl?: string;
  loginLogoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  slogan?: string;
  isActive: boolean;
}
