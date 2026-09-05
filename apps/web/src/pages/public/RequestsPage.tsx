import { useMemo, useState } from 'react';
import { useRequestsList } from '../../hooks/useRequests';
import { PublicationGrid } from '../../features/publications/PublicationGrid';
import { RequestCardItem } from '../../features/publications/PublicationCardItem';
import { Input } from '../../components';
import shared from '../shared.module.css';

export function RequestsPage() {
  const { data, isLoading } = useRequestsList();
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
        <h1>Demandes disponibles</h1>
        <p>Besoins publies par des clients a la recherche d'un prestataire.</p>
      </header>

      <div className={shared.toolbar}>
        <Input label="Rechercher une demande" placeholder="Ex : plomberie, menage..." value={search} onChange={(event) => setSearch(event.target.value)} />
      </div>

      <PublicationGrid
        items={filtered}
        isLoading={isLoading}
        keyExtractor={(request) => request.id}
        renderItem={(request) => <RequestCardItem request={request} />}
        emptyTitle="Aucune demande disponible"
        emptyMessage="Revenez bientot, de nouvelles demandes sont publiees regulierement."
      />
    </div>
  );
}
