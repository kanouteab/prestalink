import { ActivityIndicator, FlatList, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';
import { usePublicFeed } from '../../hooks/usePublicFeed';
import { useCategories } from '../../hooks/useCategories';
import { OfferCardItem, RequestCardItem } from '../../features/publications/PublicationCardItem';
import { Chip } from '../../components/Chip/Chip';
import { EmptyState } from '../../components/EmptyState/EmptyState';

export function HomeScreen() {
  const theme = useTheme();
  const { items, isLoading, refetch } = usePublicFeed();
  const { data: categories } = useCategories();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.surface0 }} edges={['top']}>
      <FlatList
        data={items}
        keyExtractor={(item) => `${item.type}-${item.data.id}`}
        contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.lg }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={theme.colors.brand} />}
        ListHeaderComponent={
          <View style={{ gap: theme.spacing.lg, marginBottom: theme.spacing.md }}>
            <View>
              <Text style={{ fontSize: 24, fontWeight: '600', color: theme.colors.ink900 }}>PrestaLink</Text>
              <Text style={{ color: theme.colors.ink500, marginTop: 4 }}>Trouvez le bon prestataire, pres de chez vous.</Text>
            </View>
            {categories && categories.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {categories.map((category) => (
                    <Chip key={category.id}>{`${category.icon} ${category.name}`}</Chip>
                  ))}
                </View>
              </ScrollView>
            )}
          </View>
        }
        renderItem={({ item }) => (item.type === 'OFFER' ? <OfferCardItem offer={item.data} /> : <RequestCardItem request={item.data} />)}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={theme.colors.brand} style={{ marginTop: 40 }} />
          ) : (
            <EmptyState title="Aucune publication" message="Revenez bientot, ou soyez le premier a publier une offre ou une demande." />
          )
        }
      />
    </SafeAreaView>
  );
}
