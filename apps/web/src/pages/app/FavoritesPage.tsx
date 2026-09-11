import { Link } from 'react-router-dom';
import { useFavorites } from '../../hooks/useFavorites';
import { OfferCardItem, RequestCardItem } from '../../features/publications/PublicationCardItem';
import { PublicationGrid } from '../../features/publications/PublicationGrid';
import { EmptyState } from '../../components';
import { useTranslation } from '../../i18n/useTranslation';
import shared from '../shared.module.css';

export function FavoritesPage() {
  const { data, isLoading } = useFavorites();
  const { t } = useTranslation();

  const available = data?.filter((favorite) => favorite.available);
  const unavailable = data?.filter((favorite) => !favorite.available);

  return (
    <div className={shared.page} style={{ padding: 0 }}>
      <header className={shared.pageHeader}>
        <h1>{t('favorites.title')}</h1>
        <p>{t('favorites.subtitle')}</p>
      </header>

      <PublicationGrid
        items={available}
        isLoading={isLoading}
        keyExtractor={(favorite) => `${favorite.publicationType}-${favorite.publicationId}`}
        renderItem={(favorite) =>
          favorite.publicationType === 'OFFER' && favorite.offer ? (
            <OfferCardItem offer={favorite.offer} />
          ) : favorite.request ? (
            <RequestCardItem request={favorite.request} />
          ) : null
        }
        emptyTitle={t('favorites.emptyTitle')}
        emptyMessage={t('favorites.emptyMessage')}
        emptyAction={<Link to="/app/explorer">{t('favorites.exploreCta')}</Link>}
      />

      {unavailable && unavailable.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <EmptyState
            glyph="🗑️"
            title={t('favorites.deletedTitle')}
            message={t('favorites.deletedMessage', { count: unavailable.length })}
          />
        </div>
      )}
    </div>
  );
}
