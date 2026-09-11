import { useMemo, useState } from 'react';
import { useOffersFeed } from '../../hooks/useOffers';
import { PublicationGrid } from '../../features/publications/PublicationGrid';
import { OfferCardItem } from '../../features/publications/PublicationCardItem';
import { Input } from '../../components';
import { useTranslation } from '../../i18n/useTranslation';
import shared from '../shared.module.css';

export function OffersPage() {
  const { data, isLoading } = useOffersFeed();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!data) return data;
    const query = search.trim().toLowerCase();
    if (!query) return data;
    return data.filter((offer) => offer.title.toLowerCase().includes(query) || offer.description.toLowerCase().includes(query));
  }, [data, search]);

  return (
    <div className={shared.page}>
      <header className={shared.pageHeader}>
        <h1>{t('offersPage.title')}</h1>
        <p>{t('offersPage.subtitle')}</p>
      </header>

      <div className={shared.toolbar}>
        <Input label={t('offersPage.searchLabel')} placeholder={t('offersPage.searchPlaceholder')} value={search} onChange={(event) => setSearch(event.target.value)} />
      </div>

      <PublicationGrid
        items={filtered}
        isLoading={isLoading}
        keyExtractor={(offer) => offer.id}
        renderItem={(offer) => <OfferCardItem offer={offer} />}
        emptyTitle={t('offersPage.emptyTitle')}
        emptyMessage={t('offersPage.emptyMessage')}
      />
    </div>
  );
}
