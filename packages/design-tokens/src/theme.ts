import { lightPalette, darkPalette, type Palette } from './palette.js';
import { fontFamilies, typeScale } from './typography.js';
import { spacing, radius } from './spacing.js';
import { lightElevation, darkElevation, type ElevationStyle, type ElevationToken } from './elevation.js';

export interface Theme {
  mode: 'light' | 'dark';
  colors: Palette;
  fontFamilies: typeof fontFamilies;
  typography: typeof typeScale;
  spacing: typeof spacing;
  radius: typeof radius;
  elevation: Record<ElevationToken, ElevationStyle>;
}

export const lightTheme: Theme = {
  mode: 'light',
  colors: lightPalette,
  fontFamilies,
  typography: typeScale,
  spacing,
  radius,
  elevation: lightElevation,
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: darkPalette,
  fontFamilies,
  typography: typeScale,
  spacing,
  radius,
  elevation: darkElevation,
};
