import { useMemo, useState } from 'react';
import { useOffersFeed } from '../../hooks/useOffers';
import { PublicationGrid } from '../../features/publications/PublicationGrid';
import { OfferCardItem } from '../../features/publications/PublicationCardItem';
import { Input } from '../../components';
import shared from '../shared.module.css';

export function OffersPage() {
  const { data, isLoading } = useOffersFeed();
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
        <h1>Offres disponibles</h1>
        <p>Services proposes par des prestataires actifs sur PrestaLink.</p>
      </header>

      <div className={shared.toolbar}>
        <Input label="Rechercher une offre" placeholder="Ex : reparation, cours..." value={search} onChange={(event) => setSearch(event.target.value)} />
      </div>

      <PublicationGrid
        items={filtered}
        isLoading={isLoading}
        keyExtractor={(offer) => offer.id}
        renderItem={(offer) => <OfferCardItem offer={offer} />}
        emptyTitle="Aucune offre disponible"
        emptyMessage="Revenez bientot, de nouvelles offres sont publiees regulierement."
      />
    </div>
  );
}
