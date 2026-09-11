import { useMemo, useState } from 'react';
import { usePublicFeed } from '../../hooks/usePublicFeed';
import { useCategories } from '../../hooks/useCategories';
import { PublicationGrid } from '../../features/publications/PublicationGrid';
import { OfferCardItem, RequestCardItem } from '../../features/publications/PublicationCardItem';
import { Chip, Input } from '../../components';
import { useTranslation } from '../../i18n/useTranslation';
import shared from '../shared.module.css';
import styles from './ExplorePage.module.css';

type TypeFilter = 'ALL' | 'OFFER' | 'REQUEST';

export function ExplorePage() {
  const { items, isLoading } = usePublicFeed();
  const { data: categories } = useCategories();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');
  const [categoryId, setCategoryId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (!items) return items;
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      if (typeFilter !== 'ALL' && item.type !== typeFilter) return false;
      if (categoryId !== null && item.data.category?.id !== categoryId) return false;
      if (query && !item.data.title.toLowerCase().includes(query) && !item.data.description.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [items, search, typeFilter, categoryId]);

  return (
    <div className={shared.page}>
      <header className={shared.pageHeader}>
        <h1>{t('explore.title')}</h1>
        <p>{t('explore.subtitle')}</p>
      </header>

      <div className={shared.toolbar}>
        <Input
          label={t('explore.searchLabel')}
          placeholder={t('explore.searchPlaceholder')}
          className={styles.search}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <Chip as="button" selected={typeFilter === 'ALL'} onClick={() => setTypeFilter('ALL')}>
          {t('explore.filterAll')}
        </Chip>
        <Chip as="button" selected={typeFilter === 'OFFER'} onClick={() => setTypeFilter('OFFER')}>
          {t('explore.filterOffers')}
        </Chip>
        <Chip as="button" selected={typeFilter === 'REQUEST'} onClick={() => setTypeFilter('REQUEST')}>
          {t('explore.filterRequests')}
        </Chip>
      </div>

      {categories && categories.length > 0 && (
        <div className={shared.chipsRow}>
          <Chip as="button" selected={categoryId === null} onClick={() => setCategoryId(null)}>
            {t('explore.allCategories')}
          </Chip>
          {categories.map((category) => (
            <Chip as="button" key={category.id} selected={categoryId === category.id} onClick={() => setCategoryId(category.id)}>
              {category.icon} {category.name}
            </Chip>
          ))}
        </div>
      )}

      <PublicationGrid
        items={filtered}
        isLoading={isLoading}
        keyExtractor={(item) => `${item.type}-${item.data.id}`}
        renderItem={(item) => (item.type === 'OFFER' ? <OfferCardItem offer={item.data} /> : <RequestCardItem request={item.data} />)}
        emptyTitle={t('explore.emptyTitle')}
        emptyMessage={t('explore.emptyMessage')}
      />
    </div>
  );
}
