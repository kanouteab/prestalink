import { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { PublicationFormValues, PublicationKind } from '@prestalink/validation';
import type { RootStackParamList } from '../../navigation/types';
import { PublicationForm } from '../../features/publications/PublicationForm';
import { Chip } from '../../components/Chip/Chip';
import { Button } from '../../components/Button/Button';
import { useCreateOffer } from '../../hooks/useOffers';
import { useCreateRequest } from '../../hooks/useRequests';
import { useIsAuthenticated } from '../../store/authStore';
import { useTheme } from '../../theme/ThemeProvider';

export function PublishScreen() {
  const theme = useTheme();
  const isAuthenticated = useIsAuthenticated();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.surface0, padding: theme.spacing.xl, gap: theme.spacing.lg, justifyContent: 'center' }}>
        <Text style={{ fontSize: 18, fontWeight: '700', textAlign: 'center', color: theme.colors.ink900 }}>Connectez-vous pour publier</Text>
        <Button label="Se connecter" onPress={() => navigation.navigate('Login')} />
      </SafeAreaView>
    );
  }

  return <PublishForm />;
}

function PublishForm() {
  const theme = useTheme();
  const [kind, setKind] = useState<PublicationKind>('OFFER');
  const createOffer = useCreateOffer();
  const createRequest = useCreateRequest();
  const submitting = createOffer.isPending || createRequest.isPending;

  const onSubmit = async (values: PublicationFormValues) => {
    try {
      if (values.kind === 'OFFER') await createOffer.mutateAsync(values);
      else await createRequest.mutateAsync(values);
      Alert.alert('Publie', values.kind === 'OFFER' ? 'Offre publiee avec succes' : 'Demande publiee avec succes');
    } catch {
      Alert.alert('Erreur', 'Impossible de publier pour le moment');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.surface0 }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.lg }}>
        <Text style={{ fontSize: 22, fontWeight: '600', color: theme.colors.ink900 }}>Publier</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Chip selected={kind === 'OFFER'} onPress={() => setKind('OFFER')}>
            Offre
          </Chip>
          <Chip selected={kind === 'REQUEST'} onPress={() => setKind('REQUEST')}>
            Demande
          </Chip>
        </View>
        <PublicationForm key={kind} kind={kind} submitting={submitting} onSubmit={onSubmit} />
      </ScrollView>
    </SafeAreaView>
  );
}
