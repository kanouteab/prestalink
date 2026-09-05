import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme, type Theme } from '@prestalink/design-tokens';

const ThemeContext = createContext<Theme>(lightTheme);

/**
 * Consomme les memes tokens que le Web (@prestalink/design-tokens) : la
 * couleur, la typographie, l'espacement et les rayons ne divergent jamais
 * entre les deux plateformes, seule l'implementation des composants differe.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const colorScheme = useColorScheme();
  const theme = useMemo(() => (colorScheme === 'dark' ? darkTheme : lightTheme), [colorScheme]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
