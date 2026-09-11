/**
 * Piste "conseil technologique" (marine + or), calquee sur la direction
 * artistique validee par l'utilisateur (cf. cyberneticconsulting.ca) : marine
 * profond pour l'autorite/la confiance, or chaud pour les temps forts (badges
 * numerotes, mise en avant dans les titres, CTA secondaires). Remplace
 * deliberement la piste precedente adossee a branding_settings — a resynchroniser
 * avec l'admin si cette direction est confirmee au-dela de l'essai.
 * Offre (sarcelle) et Demande (violet) restent deliberement eloignees des
 * couleurs semantiques (succes/erreur/avertissement) : ce sont deux natures
 * de publication, pas deux statuts.
 */
export const lightPalette = {
  brand: '#0B1E45',
  brandEmphasis: '#16305F',
  brandTint: '#E7EBF3',
  brandSecondary: '#F2B705',
  brandSecondaryTint: '#FCF1D2',

  offre: '#0F9D8B',
  offreTint: '#E4F7F3',

  demande: '#7C3AED',
  demandeTint: '#F1EAFE',

  success: '#16A34A',
  successTint: '#E7F8EC',

  warning: '#B45309',
  warningTint: '#FDF1DF',

  danger: '#DC2626',
  dangerTint: '#FDEAEA',

  // Accent chaud reserve aux temps forts (bannieres, favoris actifs) : ne
  // remplace pas `brand`, qui reste lie au logo et a branding_settings.
  accentWarm: '#E2633D',
  accentWarmTint: '#FCE9E1',

  ink900: '#12142A',
  ink700: '#2C2F49',
  ink500: '#5A5F80',
  ink300: '#9297B5',

  // Bandes claires ivoire/creme entre le blanc pur, comme les sections
  // alternees du site de reference plutot qu'un simple gris.
  surface0: '#FCF8ED',
  surface1: '#FFFFFF',
  surface2: '#F6F1E1',

  border: '#EAE3CE',
  borderStrong: '#DBCFA6',
} as const;

export const darkPalette = {
  brand: '#7C97C9',
  brandEmphasis: '#9BB0D8',
  brandTint: '#1B2C4D',
  brandSecondary: '#F5C93B',
  brandSecondaryTint: '#3A2E0C',

  offre: '#3FD9C4',
  offreTint: '#0E2A28',

  demande: '#B79BFF',
  demandeTint: '#241C42',

  success: '#57D687',
  successTint: '#123321',

  warning: '#F0B155',
  warningTint: '#3A2A0E',

  danger: '#FF8080',
  dangerTint: '#3A1717',

  accentWarm: '#F0906E',
  accentWarmTint: '#3A241C',

  ink900: '#F1F2FA',
  ink700: '#D3D6EC',
  ink500: '#A0A5C8',
  ink300: '#6B6F94',

  surface0: '#0D0E1E',
  surface1: '#161829',
  surface2: '#1E2138',

  border: '#2A2D4C',
  borderStrong: '#3B3E63',
} as const;

export type PaletteToken = keyof typeof lightPalette;
export type Palette = Record<PaletteToken, string>;
