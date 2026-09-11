import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { OfferResponse, RequestResponse } from '@prestalink/shared-types';
import { useDeleteOffer, useMyOffers, useUpdateOfferStatus } from '../../hooks/useOffers';
import { useDeleteRequest, useMyRequests, useUpdateRequestStatus } from '../../hooks/useRequests';
import { Button, Chip, ConfirmDialog, EmptyState, PublicationStatusBadge, useToast } from '../../components';
import { formatCurrency, formatRelativeDate } from '../../utils/format';
import { useTranslation } from '../../i18n/useTranslation';
import shared from '../shared.module.css';
import styles from './MyPublicationsPage.module.css';

type Tab = 'OFFER' | 'REQUEST';

export function MyPublicationsPage() {
  const [tab, setTab] = useState<Tab>('OFFER');
  const { t } = useTranslation();

  return (
    <div className={shared.page} style={{ padding: 0 }}>
      <header className={shared.pageHeader}>
        <h1>{t('myPublications.title')}</h1>
        <p>{t('myPublications.subtitle')}</p>
      </header>

      <div className={styles.tabs}>
        <Chip as="button" selected={tab === 'OFFER'} onClick={() => setTab('OFFER')}>
          {t('myPublications.tabOffers')}
        </Chip>
        <Chip as="button" selected={tab === 'REQUEST'} onClick={() => setTab('REQUEST')}>
          {t('myPublications.tabRequests')}
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
  const { t } = useTranslation();
  const [pendingDelete, setPendingDelete] = useState<OfferResponse | null>(null);

  if (isLoading) return <p>{t('common.loading')}</p>;
  if (!data || data.length === 0) {
    return (
      <EmptyState
        title={t('myPublications.emptyOfferTitle')}
        message={t('myPublications.emptyOfferMessage')}
        action={<Link to="/app/publier">{t('myPublications.publishOfferCta')}</Link>}
      />
    );
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
                {t('common.edit')}
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                updateStatus.mutate(
                  { id: offer.id, status: offer.status === 'SUSPENDED' ? 'AVAILABLE' : 'SUSPENDED' },
                  { onError: () => showToast(t('myPublications.statusError'), 'error') },
                )
              }
            >
              {offer.status === 'SUSPENDED' ? t('common.activate') : t('common.deactivate')}
            </Button>
            <Button variant="danger" size="sm" onClick={() => setPendingDelete(offer)}>
              {t('common.delete')}
            </Button>
          </div>
        </div>
      ))}

      <ConfirmDialog
        open={pendingDelete !== null}
        title={t('myPublications.deleteOfferTitle')}
        message={t('myPublications.deleteOfferMessage', { title: pendingDelete?.title ?? '' })}
        pending={deleteOffer.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteOffer.mutate(pendingDelete.id, {
            onSuccess: () => showToast(t('myPublications.deleteOfferSuccess'), 'success'),
            onError: () => showToast(t('myPublications.deleteOfferError'), 'error'),
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
  const { t } = useTranslation();
  const [pendingDelete, setPendingDelete] = useState<RequestResponse | null>(null);

  if (isLoading) return <p>{t('common.loading')}</p>;
  if (!data || data.length === 0) {
    return (
      <EmptyState
        title={t('myPublications.emptyRequestTitle')}
        message={t('myPublications.emptyRequestMessage')}
        action={<Link to="/app/publier">{t('myPublications.publishRequestCta')}</Link>}
      />
    );
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
                {t('common.edit')}
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                updateStatus.mutate(
                  { id: request.id, status: request.status === 'SUSPENDED' ? 'AVAILABLE' : 'SUSPENDED' },
                  { onError: () => showToast(t('myPublications.statusError'), 'error') },
                )
              }
            >
              {request.status === 'SUSPENDED' ? t('common.activate') : t('common.deactivate')}
            </Button>
            <Button variant="danger" size="sm" onClick={() => setPendingDelete(request)}>
              {t('common.delete')}
            </Button>
          </div>
        </div>
      ))}

      <ConfirmDialog
        open={pendingDelete !== null}
        title={t('myPublications.deleteRequestTitle')}
        message={t('myPublications.deleteRequestMessage', { title: pendingDelete?.title ?? '' })}
        pending={deleteRequest.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteRequest.mutate(pendingDelete.id, {
            onSuccess: () => showToast(t('myPublications.deleteRequestSuccess'), 'success'),
            onError: () => showToast(t('myPublications.deleteRequestError'), 'error'),
            onSettled: () => setPendingDelete(null),
          });
        }}
      />
    </div>
  );
}
