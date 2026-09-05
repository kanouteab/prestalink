import { Navigate, useParams } from 'react-router-dom';
import type { PublicationType } from '@prestalink/shared-types';
import { useOffer } from '../../hooks/useOffers';
import { useRequest } from '../../hooks/useRequests';
import { useFavoriteToggle } from '../../hooks/useFavoriteToggle';
import { Badge, Button, Chip, FavoriteButton, PublicationStatusBadge, PublicationTypeBadge } from '../../components';
import { useToast } from '../../components';
import { formatCurrency, formatRelativeDate, initials } from '../../utils/format';
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

function OfferDetail({ id }: { id: number | undefined }) {
  const { data: offer, isLoading } = useOffer(id);
  const favoriteState = useFavoriteToggle('OFFER', id ?? 0);
  const { showToast } = useToast();

  if (isLoading || !offer) return <div className={shared.page}>Chargement...</div>;

  return (
    <div className={shared.page}>
      <div className={styles.hero}>
        <PublicationTypeBadge type="OFFER" />
        <FavoriteButton active={favoriteState.favorite} pending={favoriteState.pending} onToggle={favoriteState.onToggle} label={`Favori : ${offer.title}`} />
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
          <Button variant="primary" onClick={() => showToast('Messagerie disponible prochainement', 'info')}>
            Contacter
          </Button>
        </aside>
      </div>
    </div>
  );
}

function RequestDetail({ id }: { id: number | undefined }) {
  const { data: request, isLoading } = useRequest(id);
  const favoriteState = useFavoriteToggle('REQUEST', id ?? 0);
  const { showToast } = useToast();

  if (isLoading || !request) return <div className={shared.page}>Chargement...</div>;

  return (
    <div className={shared.page}>
      <div className={[styles.hero, styles.heroRequest].join(' ')}>
        <PublicationTypeBadge type="REQUEST" />
        <FavoriteButton active={favoriteState.favorite} pending={favoriteState.pending} onToggle={favoriteState.onToggle} label={`Favori : ${request.title}`} />
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
          <div className={styles.amount}>Budget : {formatCurrency(request.budget)}</div>
          <div className={styles.author}>
            <span className={styles.authorAvatar}>{initials(request.client.fullName)}</span>
            <div style={{ fontWeight: 700 }}>{request.client.fullName}</div>
          </div>
          <Button variant="primary" onClick={() => showToast('Messagerie disponible prochainement', 'info')}>
            Contacter
          </Button>
        </aside>
      </div>
    </div>
  );
}
