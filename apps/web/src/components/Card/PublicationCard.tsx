import type { PublicationType } from '@prestalink/shared-types';
import { Chip } from '../Chip/Chip.js';
import { PublicationTypeBadge, PublicationStatusBadge } from '../Badge/Badge.js';
import { FavoriteButton } from '../FavoriteButton/FavoriteButton.js';
import { formatCurrency, formatRelativeDate } from '../../utils/format.js';
import styles from './PublicationCard.module.css';

export interface PublicationCardProps {
  type: PublicationType;
  title: string;
  categoryName: string;
  locationLabel: string;
  createdAt: string;
  /** Prix pour une offre, budget pour une demande — un seul champ affiche, le libelle change selon `type`. */
  amount: number;
  currency?: string;
  authorInitials: string;
  authorName: string;
  status: string;
  favorite?: boolean;
  favoritePending?: boolean;
  onToggleFavorite?: () => void;
  onClick?: () => void;
}

/**
 * Carte de publication unique (livrable E/7) — remplace les 6 gabarits quasi
 * identiques trouves dans l'ancien frontend (Home, Mes offres, Offres
 * disponibles, Favoris...).
 */
export function PublicationCard({
  type,
  title,
  categoryName,
  locationLabel,
  createdAt,
  amount,
  currency,
  authorInitials,
  authorName,
  status,
  favorite,
  favoritePending,
  onToggleFavorite,
  onClick,
}: PublicationCardProps) {
  const amountLabel = type === 'OFFER' ? formatCurrency(amount, currency) : `Budget : ${formatCurrency(amount, currency)}`;

  return (
    <article className={styles.card} onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}>
      <div className={[styles.media, type === 'REQUEST' && styles.mediaRequest].filter(Boolean).join(' ')}>
        <PublicationTypeBadge type={type} />
        {onToggleFavorite && (
          <FavoriteButton active={Boolean(favorite)} pending={favoritePending} onToggle={onToggleFavorite} label={`Favori : ${title}`} />
        )}
      </div>
      <div className={styles.body}>
        <Chip>{categoryName}</Chip>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.meta}>
          <span>📍 {locationLabel}</span>
          <span>·</span>
          <span>{formatRelativeDate(createdAt)}</span>
        </div>
        <div className={styles.price}>{amountLabel}</div>
        <div className={styles.foot}>
          <span className={styles.authorRow}>
            <span className={styles.avatar}>{authorInitials}</span>
            <span className={styles.authorName}>{authorName}</span>
          </span>
          <PublicationStatusBadge status={status} />
        </div>
      </div>
    </article>
  );
}
