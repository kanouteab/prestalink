import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';
import { EmptyState } from '../../components/EmptyState/EmptyState';

/**
 * Chat temps reel deja disponible cote Web (packages/api-client/RealtimeClient
 * + apps/web/src/features/chat) — le portage mobile est le prochain chantier,
 * pas encore fait dans cette passe.
 */
export function MessagesScreen() {
  const theme = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.surface0, padding: theme.spacing.xl }} edges={['top']}>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <EmptyState glyph="💬" title="Messagerie" message="La messagerie temps reel arrive prochainement sur mobile. Disponible des maintenant sur la version Web." />
      </View>
    </SafeAreaView>
  );
}
