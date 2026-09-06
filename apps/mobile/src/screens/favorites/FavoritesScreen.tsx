import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFavorites } from '../../hooks/useFavorites';
import { OfferCardItem, RequestCardItem } from '../../features/publications/PublicationCardItem';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { useTheme } from '../../theme/ThemeProvider';

export function FavoritesScreen() {
  const theme = useTheme();
  const { data, isLoading } = useFavorites();
  const available = data?.filter((favorite) => favorite.available);
  const unavailableCount = data?.filter((favorite) => !favorite.available).length ?? 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.surface0 }} edges={['bottom']}>
      <FlatList
        data={available}
        keyExtractor={(favorite) => `${favorite.publicationType}-${favorite.publicationId}`}
        contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.lg }}
        ListHeaderComponent={<Text style={{ fontSize: 22, fontWeight: '600', color: theme.colors.ink900, marginBottom: 8 }}>Favoris</Text>}
        renderItem={({ item }) =>
          item.publicationType === 'OFFER' && item.offer ? (
            <OfferCardItem offer={item.offer} />
          ) : item.request ? (
            <RequestCardItem request={item.request} />
          ) : null
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={theme.colors.brand} style={{ marginTop: 40 }} />
          ) : (
            <EmptyState title="Aucun favori" message="Ajoutez des offres ou des demandes a vos favoris pour les retrouver ici." />
          )
        }
        ListFooterComponent={
          unavailableCount > 0 ? (
            <View style={{ marginTop: theme.spacing.md }}>
              <Text style={{ color: theme.colors.ink300, fontSize: 12.5, textAlign: 'center' }}>
                {unavailableCount} publication(s) mise(s) en favori ont ete supprimees depuis.
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
