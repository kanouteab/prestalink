import { Link } from 'react-router-dom';
import { usePublicFeed } from '../../hooks/usePublicFeed';
import { useCategories } from '../../hooks/useCategories';
import { PublicationGrid } from '../../features/publications/PublicationGrid';
import { OfferCardItem, RequestCardItem } from '../../features/publications/PublicationCardItem';
import { Chip, LinkButton } from '../../components';
import shared from '../shared.module.css';

export function HomePage() {
  const { items, isLoading } = usePublicFeed();
  const { data: categories } = useCategories();

  return (
    <div className={shared.page}>
      <header className={shared.pageHeader}>
        <h1>Trouvez le bon prestataire, pres de chez vous</h1>
        <p>Offres de service et demandes de la communaute, melangees par ordre chronologique.</p>
      </header>

      {categories && categories.length > 0 && (
        <div className={shared.chipsRow}>
          {categories.map((category) => (
            <Chip as="span" key={category.id}>
              {category.icon} {category.name}
            </Chip>
          ))}
        </div>
      )}

      <div className={shared.toolbar}>
        <LinkButton to="/explorer" variant="outline" size="sm">
          Voir tout dans Explorer
        </LinkButton>
      </div>

      <PublicationGrid
        items={items}
        isLoading={isLoading}
        keyExtractor={(item) => `${item.type}-${item.data.id}`}
        renderItem={(item) => (item.type === 'OFFER' ? <OfferCardItem offer={item.data} /> : <RequestCardItem request={item.data} />)}
        emptyTitle="Aucune publication pour le moment"
        emptyMessage="Revenez bientot, ou soyez le premier a publier une offre ou une demande."
        emptyAction={
          <Link to="/inscription" style={{ fontWeight: 700 }}>
            Creer un compte pour publier
          </Link>
        }
      />
    </div>
  );
}
