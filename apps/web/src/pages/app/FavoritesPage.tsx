import { Link } from 'react-router-dom';
import { useFavorites } from '../../hooks/useFavorites';
import { OfferCardItem, RequestCardItem } from '../../features/publications/PublicationCardItem';
import { PublicationGrid } from '../../features/publications/PublicationGrid';
import { EmptyState } from '../../components';
import shared from '../shared.module.css';

export function FavoritesPage() {
  const { data, isLoading } = useFavorites();

  const available = data?.filter((favorite) => favorite.available);
  const unavailable = data?.filter((favorite) => !favorite.available);

  return (
    <div className={shared.page} style={{ padding: 0 }}>
      <header className={shared.pageHeader}>
        <h1>Favoris</h1>
        <p>Les offres et demandes que vous avez mises de cote.</p>
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
        emptyTitle="Aucun favori"
        emptyMessage="Ajoutez des offres ou des demandes a vos favoris pour les retrouver ici."
        emptyAction={<Link to="/app/explorer">Explorer les publications</Link>}
      />

      {unavailable && unavailable.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <EmptyState
            glyph="🗑️"
            title="Publications supprimees"
            message={`${unavailable.length} publication(s) mise(s) en favori ont ete supprimees depuis.`}
          />
        </div>
      )}
    </div>
  );
}
