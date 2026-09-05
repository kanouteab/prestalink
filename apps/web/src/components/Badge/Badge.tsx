import type { HTMLAttributes } from 'react';
import { publicationStatusColor, missionStatusColor, type StatusColorRole } from '@prestalink/design-tokens';
import styles from './Badge.module.css';

export type BadgeTone = StatusColorRole | 'offre' | 'demande';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone: BadgeTone;
}

export function Badge({ tone, className, ...rest }: BadgeProps) {
  return <span className={[styles.badge, styles[tone], className].filter(Boolean).join(' ')} {...rest} />;
}

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: 'Disponible',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminee',
  SUSPENDED: 'Suspendue',
  EXPIRED: 'Expiree',
  EN_ATTENTE: 'En attente',
  EN_COURS: 'En cours',
  TERMINEE: 'Terminee',
  ANNULEE: 'Annulee',
};

export function PublicationStatusBadge({ status }: { status: string }) {
  const tone = publicationStatusColor[status] ?? 'neutral';
  return <Badge tone={tone}>{STATUS_LABELS[status] ?? status}</Badge>;
}

export function MissionStatusBadge({ status }: { status: string }) {
  const tone = missionStatusColor[status] ?? 'neutral';
  return <Badge tone={tone}>{STATUS_LABELS[status] ?? status}</Badge>;
}

export function PublicationTypeBadge({ type }: { type: 'OFFER' | 'REQUEST' }) {
  return <Badge tone={type === 'OFFER' ? 'offre' : 'demande'}>{type === 'OFFER' ? 'Offre' : 'Demande'}</Badge>;
}
