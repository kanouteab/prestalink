import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { OfferResponse, RequestResponse } from '@prestalink/shared-types';
import { useDeleteOffer, useMyOffers, useUpdateOfferStatus } from '../../hooks/useOffers';
import { useDeleteRequest, useMyRequests, useUpdateRequestStatus } from '../../hooks/useRequests';
import { Button, Chip, ConfirmDialog, EmptyState, PublicationStatusBadge, useToast } from '../../components';
import { formatCurrency, formatRelativeDate } from '../../utils/format';
import shared from '../shared.module.css';
import styles from './MyPublicationsPage.module.css';

type Tab = 'OFFER' | 'REQUEST';

export function MyPublicationsPage() {
  const [tab, setTab] = useState<Tab>('OFFER');

  return (
    <div className={shared.page} style={{ padding: 0 }}>
      <header className={shared.pageHeader}>
        <h1>Mes publications</h1>
        <p>Gerez vos offres et vos demandes : modifier, activer/desactiver ou supprimer.</p>
      </header>

      <div className={styles.tabs}>
        <Chip as="button" selected={tab === 'OFFER'} onClick={() => setTab('OFFER')}>
          Mes offres
        </Chip>
        <Chip as="button" selected={tab === 'REQUEST'} onClick={() => setTab('REQUEST')}>
          Mes demandes
        </Chip>
      </div>

      {tab === 'OFFER' ? <MyOffersTab /> : <MyRequestsTab />}
    </div>
  );
}

function MyOffersTab() {
  const { data, isLoading } = useMyOffers();
  const updateStatus = useUpdateOfferStatus();
  const deleteOffer = useDeleteOffer();
  const { showToast } = useToast();
  const [pendingDelete, setPendingDelete] = useState<OfferResponse | null>(null);

  if (isLoading) return <p>Chargement...</p>;
  if (!data || data.length === 0) {
    return <EmptyState title="Aucune offre publiee" message="Publiez votre premiere offre pour commencer." action={<Link to="/app/publier">Publier une offre</Link>} />;
  }

  return (
    <div className={styles.list}>
      {data.map((offer) => (
        <div className={styles.row} key={offer.id}>
          <div className={styles.info}>
            <div className={styles.title}>{offer.title}</div>
            <div className={styles.meta}>
              <span>{formatRelativeDate(offer.createdAt)}</span>
              <PublicationStatusBadge status={offer.status} />
            </div>
          </div>
          <div className={styles.amount}>{formatCurrency(offer.price)}</div>
          <div className={styles.actions}>
            <Link to={`/app/publications/offres/${offer.id}/modifier`}>
              <Button variant="secondary" size="sm">
                Modifier
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                updateStatus.mutate(
                  { id: offer.id, status: offer.status === 'SUSPENDED' ? 'AVAILABLE' : 'SUSPENDED' },
                  { onError: () => showToast('Impossible de changer le statut', 'error') },
                )
              }
            >
              {offer.status === 'SUSPENDED' ? 'Activer' : 'Desactiver'}
            </Button>
            <Button variant="danger" size="sm" onClick={() => setPendingDelete(offer)}>
              Supprimer
            </Button>
          </div>
        </div>
      ))}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Supprimer cette offre ?"
        message={`"${pendingDelete?.title}" sera definitivement supprimee.`}
        pending={deleteOffer.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteOffer.mutate(pendingDelete.id, {
            onSuccess: () => showToast('Offre supprimee', 'success'),
            onError: () => showToast('Impossible de supprimer cette offre', 'error'),
            onSettled: () => setPendingDelete(null),
          });
        }}
      />
    </div>
  );
}

function MyRequestsTab() {
  const { data, isLoading } = useMyRequests();
  const updateStatus = useUpdateRequestStatus();
  const deleteRequest = useDeleteRequest();
  const { showToast } = useToast();
  const [pendingDelete, setPendingDelete] = useState<RequestResponse | null>(null);

  if (isLoading) return <p>Chargement...</p>;
  if (!data || data.length === 0) {
    return <EmptyState title="Aucune demande publiee" message="Publiez votre premiere demande pour commencer." action={<Link to="/app/publier">Publier une demande</Link>} />;
  }

  return (
    <div className={styles.list}>
      {data.map((request) => (
        <div className={styles.row} key={request.id}>
          <div className={styles.info}>
            <div className={styles.title}>{request.title}</div>
            <div className={styles.meta}>
              <span>{formatRelativeDate(request.createdAt)}</span>
              <PublicationStatusBadge status={request.status} />
            </div>
          </div>
          <div className={styles.amount}>{formatCurrency(request.budget)}</div>
          <div className={styles.actions}>
            <Link to={`/app/publications/demandes/${request.id}/modifier`}>
              <Button variant="secondary" size="sm">
                Modifier
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                updateStatus.mutate(
                  { id: request.id, status: request.status === 'SUSPENDED' ? 'AVAILABLE' : 'SUSPENDED' },
                  { onError: () => showToast('Impossible de changer le statut', 'error') },
                )
              }
            >
              {request.status === 'SUSPENDED' ? 'Activer' : 'Desactiver'}
            </Button>
            <Button variant="danger" size="sm" onClick={() => setPendingDelete(request)}>
              Supprimer
            </Button>
          </div>
        </div>
      ))}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Supprimer cette demande ?"
        message={`"${pendingDelete?.title}" sera definitivement supprimee.`}
        pending={deleteRequest.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteRequest.mutate(pendingDelete.id, {
            onSuccess: () => showToast('Demande supprimee', 'success'),
            onError: () => showToast('Impossible de supprimer cette demande', 'error'),
            onSettled: () => setPendingDelete(null),
          });
        }}
      />
    </div>
  );
}
