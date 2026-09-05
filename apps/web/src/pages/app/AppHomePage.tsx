import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { usePublicFeed } from '../../hooks/usePublicFeed';
import { useMyOffers } from '../../hooks/useOffers';
import { useMyRequests } from '../../hooks/useRequests';
import { useFavorites } from '../../hooks/useFavorites';
import { PublicationGrid } from '../../features/publications/PublicationGrid';
import { OfferCardItem, RequestCardItem } from '../../features/publications/PublicationCardItem';
import { LinkButton } from '../../components';
import shared from '../shared.module.css';

export function AppHomePage() {
  const user = useAuthStore((state) => state.user);
  const { items, isLoading } = usePublicFeed();
  const { data: myOffers } = useMyOffers();
  const { data: myRequests } = useMyRequests();
  const { data: favorites } = useFavorites();

  const recentItems = items?.slice(0, 6);

  return (
    <div>
      <header className={shared.pageHeader}>
        <h1>Bonjour {user?.fullName?.split(' ')[0] ?? ''} 👋</h1>
        <p>
          {myOffers?.length ?? 0} offre(s) publiee(s), {myRequests?.length ?? 0} demande(s) publiee(s), {favorites?.length ?? 0} favori(s).
        </p>
      </header>

      <div className={shared.toolbar}>
        <LinkButton to="/app/publier" variant="primary" size="sm">
          Publier
        </LinkButton>
        <LinkButton to="/app/publications" variant="secondary" size="sm">
          Mes publications
        </LinkButton>
        <LinkButton to="/app/favoris" variant="secondary" size="sm">
          Favoris
        </LinkButton>
      </div>

      <div className={shared.section}>
        <div className={shared.sectionHead}>
          <h2>Activite recente sur la marketplace</h2>
          <Link to="/app/explorer">Voir tout</Link>
        </div>
        <PublicationGrid
          items={recentItems}
          isLoading={isLoading}
          keyExtractor={(item) => `${item.type}-${item.data.id}`}
          renderItem={(item) => (item.type === 'OFFER' ? <OfferCardItem offer={item.data} /> : <RequestCardItem request={item.data} />)}
          emptyTitle="Rien pour le moment"
          emptyMessage="Soyez le premier a publier une offre ou une demande."
          skeletonCount={3}
        />
      </div>
    </div>
  );
}
