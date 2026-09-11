import type { HTMLAttributes } from 'react';
import { publicationStatusColor, missionStatusColor, type StatusColorRole } from '@prestalink/design-tokens';
import { useTranslation } from '../../i18n/useTranslation.js';
import styles from './Badge.module.css';

export type BadgeTone = StatusColorRole | 'offre' | 'demande';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone: BadgeTone;
}

export function Badge({ tone, className, ...rest }: BadgeProps) {
  return <span className={[styles.badge, styles[tone], className].filter(Boolean).join(' ')} {...rest} />;
}

/** Repli sur le statut brut si le backend renvoie une valeur hors de la liste connue. */
function statusLabel(t: (key: string) => string, status: string): string {
  const key = `status.${status}`;
  const label = t(key);
  return label === key ? status : label;
}

export function PublicationStatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  const tone = publicationStatusColor[status] ?? 'neutral';
  return <Badge tone={tone}>{statusLabel(t, status)}</Badge>;
}

export function MissionStatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  const tone = missionStatusColor[status] ?? 'neutral';
  return <Badge tone={tone}>{statusLabel(t, status)}</Badge>;
}

export function PublicationTypeBadge({ type }: { type: 'OFFER' | 'REQUEST' }) {
  const { t } = useTranslation();
  return <Badge tone={type === 'OFFER' ? 'offre' : 'demande'}>{t(`publicationType.${type}`)}</Badge>;
}
