/**
 * Une echelle d'elevation exprimee pour les trois cibles de rendu :
 * `web` (box-shadow), `ios` (shadow*), `android` (elevation).
 */
export interface ElevationStyle {
  web: string;
  ios: { shadowColor: string; shadowOpacity: number; shadowRadius: number; shadowOffset: { width: number; height: number } };
  android: { elevation: number };
}

export type ElevationToken = 'e0' | 'e1' | 'e2' | 'e3';

const shadowColorLight = '#12142A';
const shadowColorDark = '#000000';

export function buildElevation(shadowColor: string): Record<ElevationToken, ElevationStyle> {
  return {
    e0: {
      web: 'none',
      ios: { shadowColor, shadowOpacity: 0, shadowRadius: 0, shadowOffset: { width: 0, height: 0 } },
      android: { elevation: 0 },
    },
    e1: {
      web: `0 1px 2px rgba(18,20,42,.06), 0 1px 1px rgba(18,20,42,.04)`,
      ios: { shadowColor, shadowOpacity: 0.08, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } },
      android: { elevation: 2 },
    },
    e2: {
      web: `0 10px 30px rgba(18,20,42,.10)`,
      ios: { shadowColor, shadowOpacity: 0.12, shadowRadius: 14, shadowOffset: { width: 0, height: 8 } },
      android: { elevation: 8 },
    },
    e3: {
      web: `0 24px 60px rgba(18,20,42,.20)`,
      ios: { shadowColor, shadowOpacity: 0.22, shadowRadius: 28, shadowOffset: { width: 0, height: 16 } },
      android: { elevation: 16 },
    },
  };
}

export const lightElevation = buildElevation(shadowColorLight);
export const darkElevation = buildElevation(shadowColorDark);
