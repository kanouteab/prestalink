/**
 * Palette PrestaLink. Offre (sarcelle) et Demande (violet) sont deliberement
 * eloignees des couleurs semantiques (succes/erreur/avertissement) : ce sont
 * deux natures de publication, pas deux statuts.
 */
export const lightPalette = {
  brand: '#2F5FED',
  brandEmphasis: '#1E45C4',
  brandTint: '#EAF0FF',

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

  ink900: '#12142A',
  ink700: '#2C2F49',
  ink500: '#5A5F80',
  ink300: '#9297B5',

  surface0: '#F5F6FC',
  surface1: '#FFFFFF',
  surface2: '#EEF1FB',

  border: '#E1E4F2',
  borderStrong: '#C7CCE6',
} as const;

export const darkPalette = {
  brand: '#7C97FF',
  brandEmphasis: '#A9BBFF',
  brandTint: '#1B2350',

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
