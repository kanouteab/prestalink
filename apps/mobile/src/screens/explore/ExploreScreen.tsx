import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';
import { usePublicFeed } from '../../hooks/usePublicFeed';
import { useCategories } from '../../hooks/useCategories';
import { OfferCardItem, RequestCardItem } from '../../features/publications/PublicationCardItem';
import { Chip } from '../../components/Chip/Chip';
import { Input } from '../../components/Input/Input';
import { EmptyState } from '../../components/EmptyState/EmptyState';

type TypeFilter = 'ALL' | 'OFFER' | 'REQUEST';

export function ExploreScreen() {
  const theme = useTheme();
  const { items, isLoading } = usePublicFeed();
  const { data: categories } = useCategories();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');
  const [categoryId, setCategoryId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (!items) return items;
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      if (typeFilter !== 'ALL' && item.type !== typeFilter) return false;
      if (categoryId !== null && item.data.category?.id !== categoryId) return false;
      if (query && !item.data.title.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [items, search, typeFilter, categoryId]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.surface0 }} edges={['top']}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => `${item.type}-${item.data.id}`}
        contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.lg }}
        ListHeaderComponent={
          <View style={{ gap: theme.spacing.md, marginBottom: theme.spacing.md }}>
            <Text style={{ fontSize: 22, fontWeight: '600', color: theme.colors.ink900 }}>Explorer</Text>
            <Input label="Rechercher" placeholder="Ex : plomberie, menage..." value={search} onChangeText={setSearch} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Chip selected={typeFilter === 'ALL'} onPress={() => setTypeFilter('ALL')}>
                  Tout
                </Chip>
                <Chip selected={typeFilter === 'OFFER'} onPress={() => setTypeFilter('OFFER')}>
                  Offres
                </Chip>
                <Chip selected={typeFilter === 'REQUEST'} onPress={() => setTypeFilter('REQUEST')}>
                  Demandes
                </Chip>
              </View>
            </ScrollView>
            {categories && categories.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Chip selected={categoryId === null} onPress={() => setCategoryId(null)}>
                    Toutes categories
                  </Chip>
                  {categories.map((category) => (
                    <Chip key={category.id} selected={categoryId === category.id} onPress={() => setCategoryId(category.id)}>
                      {`${category.icon} ${category.name}`}
                    </Chip>
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
            <EmptyState title="Aucun resultat" message="Essayez d'elargir votre recherche ou vos filtres." />
          )
        }
      />
    </SafeAreaView>
  );
}
