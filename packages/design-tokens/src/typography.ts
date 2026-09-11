/**
 * Trois familles : Sora (titres, caractere), Work Sans (interface et texte
 * courant), IBM Plex Mono (prix, identifiants, donnees chiffrees).
 *
 * Sur React Native, `fontFamilies` sert de reference logique : chaque plateforme
 * charge les fichiers de police (expo-font) et mappe vers le nom de fonte reel
 * (ex. "Sora_700Bold") ; sur Web, ces piles CSS sont utilisees telles quelles.
 */
export const fontFamilies = {
  display: '"Sora", "Segoe UI", system-ui, sans-serif',
  body: '"Work Sans", "Segoe UI", system-ui, sans-serif',
  mono: '"IBM Plex Mono", "SFMono-Regular", Consolas, monospace',
} as const;

export type TypeRole =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'bodyLarge'
  | 'body'
  | 'bodySmall'
  | 'caption';

export interface TypeStyle {
  fontSize: number;
  lineHeight: number;
  fontWeight: '400' | '500' | '600' | '700' | '800';
  letterSpacing?: number;
  textTransform?: 'none' | 'uppercase';
}

export const typeScale: Record<TypeRole, TypeStyle> = {
  display: { fontSize: 34, lineHeight: 41, fontWeight: '600' },
  h1: { fontSize: 27, lineHeight: 34, fontWeight: '600' },
  h2: { fontSize: 22, lineHeight: 29, fontWeight: '500' },
  h3: { fontSize: 17, lineHeight: 23, fontWeight: '700' },
  bodyLarge: { fontSize: 17, lineHeight: 26, fontWeight: '400' },
  body: { fontSize: 15.5, lineHeight: 24, fontWeight: '400' },
  bodySmall: { fontSize: 13, lineHeight: 20, fontWeight: '400' },
  caption: {
    fontSize: 11.5,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
};
