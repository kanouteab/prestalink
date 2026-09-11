import { Navigate, useNavigate, useParams } from 'react-router-dom';
import type { PublicationType } from '@prestalink/shared-types';
import { useOffer } from '../../hooks/useOffers';
import { useRequest } from '../../hooks/useRequests';
import { useFavoriteToggle } from '../../hooks/useFavoriteToggle';
import { useAcceptRequest } from '../../hooks/useMissions';
import { useAuthStore, useIsAuthenticated } from '../../store/authStore';
import { buildDirectConversationKey } from '../../utils/chatKey';
import { Badge, Button, Chip, FavoriteButton, PublicationStatusBadge, PublicationTypeBadge, useToast } from '../../components';
import { formatCurrency, formatRelativeDate, initials } from '../../utils/format';
import { useTranslation } from '../../i18n/useTranslation';
import shared from '../shared.module.css';
import styles from './PublicationDetailPage.module.css';

export function PublicationDetailPage() {
  const params = useParams<{ type: string; id: string }>();
  const type = params.type?.toUpperCase() as PublicationType | undefined;
  const id = params.id ? Number(params.id) : undefined;

  if (type !== 'OFFER' && type !== 'REQUEST') {
    return <Navigate to="/explorer" replace />;
  }

  return type === 'OFFER' ? <OfferDetail id={id} /> : <RequestDetail id={id} />;
}

function useContactAction(
  otherUserId: number,
  otherUserName: string,
  publicationType: PublicationType,
  publicationId: number,
  publicationTitle: string,
) {
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const isOwnPublication = currentUserId === otherUserId;

  const onContact = () => {
    if (!isAuthenticated) {
      navigate('/connexion');
      return;
    }
    const context = {
      conversationKey: buildDirectConversationKey(currentUserId!, otherUserId, publicationType, publicationId),
      otherUserId,
      otherUserName,
      publicationType,
      publicationId,
      publicationTitle,
    };
    navigate('/app/messages/chat', { state: context });
  };

  return { onContact, isOwnPublication };
}

function OfferDetail({ id }: { id: number | undefined }) {
  const { data: offer, isLoading } = useOffer(id);
  const favoriteState = useFavoriteToggle('OFFER', id ?? 0);
  const { t } = useTranslation();

  if (isLoading || !offer) return <div className={shared.page}>{t('common.loading')}</div>;

  return <OfferDetailView offer={offer} favoriteState={favoriteState} />;
}

function OfferDetailView({ offer, favoriteState }: { offer: NonNullable<ReturnType<typeof useOffer>['data']>; favoriteState: ReturnType<typeof useFavoriteToggle> }) {
  const { onContact, isOwnPublication } = useContactAction(offer.provider.id, offer.provider.fullName, 'OFFER', offer.id, offer.title);
  const { t } = useTranslation();

  return (
    <div className={shared.page}>
      <div className={styles.hero}>
        <PublicationTypeBadge type="OFFER" />
        <FavoriteButton
          active={favoriteState.favorite}
          pending={favoriteState.pending}
          onToggle={favoriteState.onToggle}
          label={t('common.favoriteLabel', { title: offer.title })}
        />
      </div>
      <div className={styles.layout}>
        <div>
          <Chip>{offer.category?.icon} {offer.category?.name}</Chip>
          <h1>{offer.title}</h1>
          <div className={styles.meta}>
            <span>📍 {offer.locationLabel || offer.location}</span>
            <span>{formatRelativeDate(offer.createdAt)}</span>
            <PublicationStatusBadge status={offer.status} />
          </div>
          <p className={styles.description}>{offer.description}</p>
        </div>
        <aside className={styles.sidebar}>
          <div className={styles.amount}>{formatCurrency(offer.price)}</div>
          <div className={styles.author}>
            <span className={styles.authorAvatar}>{initials(offer.provider.fullName)}</span>
            <div>
              <div style={{ fontWeight: 700 }}>{offer.provider.fullName}</div>
              {offer.provider.trustBadge && <Badge tone="success">{offer.provider.trustBadge}</Badge>}
            </div>
          </div>
          {!isOwnPublication && (
            <Button variant="primary" onClick={onContact}>
              {t('publicationDetail.contact')}
            </Button>
          )}
        </aside>
      </div>
    </div>
  );
}

function RequestDetail({ id }: { id: number | undefined }) {
  const { data: request, isLoading } = useRequest(id);
  const favoriteState = useFavoriteToggle('REQUEST', id ?? 0);
  const { t } = useTranslation();

  if (isLoading || !request) return <div className={shared.page}>{t('common.loading')}</div>;

  return <RequestDetailView request={request} favoriteState={favoriteState} />;
}

function RequestDetailView({ request, favoriteState }: { request: NonNullable<ReturnType<typeof useRequest>['data']>; favoriteState: ReturnType<typeof useFavoriteToggle> }) {
  const { onContact, isOwnPublication } = useContactAction(request.client.id, request.client.fullName, 'REQUEST', request.id, request.title);
  const currentUser = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const acceptRequest = useAcceptRequest();
  const { t } = useTranslation();

  const canAccept = currentUser?.role === 'PRESTATAIRE' && !isOwnPublication && request.status === 'AVAILABLE';

  const onAccept = () => {
    if (!currentUser) return;
    acceptRequest.mutate(
      { clientId: request.client.id, providerId: currentUser.id, requestId: request.id },
      {
        onSuccess: () => {
          showToast(t('publicationDetail.acceptSuccess'), 'success');
          navigate('/app/missions');
        },
        onError: () => showToast(t('publicationDetail.acceptError'), 'error'),
      },
    );
  };

  return (
    <div className={shared.page}>
      <div className={[styles.hero, styles.heroRequest].join(' ')}>
        <PublicationTypeBadge type="REQUEST" />
        <FavoriteButton
          active={favoriteState.favorite}
          pending={favoriteState.pending}
          onToggle={favoriteState.onToggle}
          label={t('common.favoriteLabel', { title: request.title })}
        />
      </div>
      <div className={styles.layout}>
        <div>
          <Chip>{request.category?.icon} {request.category?.name}</Chip>
          <h1>{request.title}</h1>
          <div className={styles.meta}>
            <span>📍 {request.locationLabel || request.location}</span>
            <span>{formatRelativeDate(request.createdAt)}</span>
            <PublicationStatusBadge status={request.status} />
          </div>
          <p className={styles.description}>{request.description}</p>
        </div>
        <aside className={styles.sidebar}>
          <div className={styles.amount}>{t('publicationDetail.budgetPrefix')} : {formatCurrency(request.budget)}</div>
          <div className={styles.author}>
            <span className={styles.authorAvatar}>{initials(request.client.fullName)}</span>
            <div style={{ fontWeight: 700 }}>{request.client.fullName}</div>
          </div>
          {canAccept && (
            <Button variant="primary" onClick={onAccept} loading={acceptRequest.isPending}>
              {t('publicationDetail.accept')}
            </Button>
          )}
          {!isOwnPublication && (
            <Button variant={canAccept ? 'secondary' : 'primary'} onClick={onContact}>
              {t('publicationDetail.contact')}
            </Button>
          )}
        </aside>
      </div>
    </div>
  );
}
