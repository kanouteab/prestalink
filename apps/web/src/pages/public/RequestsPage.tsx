import { useMemo, useState } from 'react';
import { useRequestsList } from '../../hooks/useRequests';
import { PublicationGrid } from '../../features/publications/PublicationGrid';
import { RequestCardItem } from '../../features/publications/PublicationCardItem';
import { Input } from '../../components';
import { useTranslation } from '../../i18n/useTranslation';
import shared from '../shared.module.css';

export function RequestsPage() {
  const { data, isLoading } = useRequestsList();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!data) return data;
    const query = search.trim().toLowerCase();
    if (!query) return data;
    return data.filter((request) => request.title.toLowerCase().includes(query) || request.description.toLowerCase().includes(query));
  }, [data, search]);

  return (
    <div className={shared.page}>
      <header className={shared.pageHeader}>
        <h1>{t('requestsPage.title')}</h1>
        <p>{t('requestsPage.subtitle')}</p>
      </header>

      <div className={shared.toolbar}>
        <Input label={t('requestsPage.searchLabel')} placeholder={t('requestsPage.searchPlaceholder')} value={search} onChange={(event) => setSearch(event.target.value)} />
      </div>

      <PublicationGrid
        items={filtered}
        isLoading={isLoading}
        keyExtractor={(request) => request.id}
        renderItem={(request) => <RequestCardItem request={request} />}
        emptyTitle={t('requestsPage.emptyTitle')}
        emptyMessage={t('requestsPage.emptyMessage')}
      />
    </div>
  );
}
