import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { realtimeTopics } from '@prestalink/api-client';
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';

function Splash() {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface0 }]}>
      <Text style={[styles.title, { color: theme.colors.ink900 }]}>PrestaLink</Text>
      <Text style={[styles.subtitle, { color: theme.colors.ink500 }]}>
        Scaffold mobile pret — memes tokens que le Web, meme backend Spring Boot.
      </Text>
      <Text style={[styles.mono, { color: theme.colors.brand }]}>{realtimeTopics.feed()}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Splash />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 27,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
  },
  mono: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
});
