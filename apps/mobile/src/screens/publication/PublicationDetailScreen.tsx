import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { useOffer } from '../../hooks/useOffers';
import { useRequest } from '../../hooks/useRequests';
import { useFavoriteToggle } from '../../hooks/useFavoriteToggle';
import { Chip } from '../../components/Chip/Chip';
import { Badge, PublicationStatusBadge, PublicationTypeBadge } from '../../components/Badge/Badge';
import { Button } from '../../components/Button/Button';
import { useTheme } from '../../theme/ThemeProvider';
import { formatCurrency, formatRelativeDate, initials } from '../../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'PublicationDetail'>;

export function PublicationDetailScreen({ route }: Props) {
  const { type, id } = route.params;
  return type === 'OFFER' ? <OfferDetail id={id} /> : <RequestDetail id={id} />;
}

function OfferDetail({ id }: { id: number }) {
  const theme = useTheme();
  const { data: offer, isLoading } = useOffer(id);
  const favoriteState = useFavoriteToggle('OFFER', id);

  if (isLoading || !offer) return <LoadingView />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.surface0 }} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <PublicationTypeBadge type="OFFER" />
          <FavoriteToggle {...favoriteState} />
        </View>
        <Chip>{`${offer.category?.icon ?? ''} ${offer.category?.name ?? ''}`}</Chip>
        <Text style={{ fontSize: 21, fontWeight: '600', color: theme.colors.ink900 }}>{offer.title}</Text>
        <Text style={{ color: theme.colors.ink500 }}>
          📍 {offer.locationLabel || offer.location} · {formatRelativeDate(offer.createdAt)}
        </Text>
        <PublicationStatusBadge status={offer.status} />
        <Text style={{ color: theme.colors.ink700, lineHeight: 22 }}>{offer.description}</Text>
        <Text style={{ fontFamily: 'monospace', fontSize: 22, fontWeight: '700', color: theme.colors.ink900 }}>{formatCurrency(offer.price)}</Text>
        <AuthorRow name={offer.provider.fullName} trustBadge={offer.provider.trustBadge} />
        <Button label="Contacter" onPress={() => Alert.alert('Messagerie', 'Disponible prochainement sur mobile.')} />
      </ScrollView>
    </SafeAreaView>
  );
}

function RequestDetail({ id }: { id: number }) {
  const theme = useTheme();
  const { data: request, isLoading } = useRequest(id);
  const favoriteState = useFavoriteToggle('REQUEST', id);

  if (isLoading || !request) return <LoadingView />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.surface0 }} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <PublicationTypeBadge type="REQUEST" />
          <FavoriteToggle {...favoriteState} />
        </View>
        <Chip>{`${request.category?.icon ?? ''} ${request.category?.name ?? ''}`}</Chip>
        <Text style={{ fontSize: 21, fontWeight: '600', color: theme.colors.ink900 }}>{request.title}</Text>
        <Text style={{ color: theme.colors.ink500 }}>
          📍 {request.locationLabel || request.location} · {formatRelativeDate(request.createdAt)}
        </Text>
        <PublicationStatusBadge status={request.status} />
        <Text style={{ color: theme.colors.ink700, lineHeight: 22 }}>{request.description}</Text>
        <Text style={{ fontFamily: 'monospace', fontSize: 22, fontWeight: '700', color: theme.colors.ink900 }}>Budget : {formatCurrency(request.budget)}</Text>
        <AuthorRow name={request.client.fullName} />
        <Button label="Contacter" onPress={() => Alert.alert('Messagerie', 'Disponible prochainement sur mobile.')} />
      </ScrollView>
    </SafeAreaView>
  );
}

function AuthorRow({ name, trustBadge }: { name: string; trustBadge?: string | null }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.surface2, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontWeight: '700', color: theme.colors.ink500 }}>{initials(name)}</Text>
      </View>
      <View>
        <Text style={{ fontWeight: '700', color: theme.colors.ink900 }}>{name}</Text>
        {trustBadge && <Badge tone="success">{trustBadge}</Badge>}
      </View>
    </View>
  );
}

function FavoriteToggle({ favorite, pending, onToggle }: { favorite: boolean; pending: boolean; onToggle: () => void }) {
  const theme = useTheme();
  return (
    <Text onPress={pending ? undefined : onToggle} style={{ fontSize: 20, color: favorite ? theme.colors.demande : theme.colors.ink500 }}>
      {favorite ? '♥' : '♡'}
    </Text>
  );
}

function LoadingView() {
  const theme = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.surface0, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: theme.colors.ink500 }}>Chargement...</Text>
    </SafeAreaView>
  );
}
