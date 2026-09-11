import { useTranslation } from '../../i18n/useTranslation.js';
import styles from './StarRating.module.css';

export interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  max?: number;
  disabled?: boolean;
}

/** Remplace le prompt() natif utilise par l'ancien frontend pour noter une mission (livrable A, point 8). */
export function StarRating({ value, onChange, max = 5, disabled }: StarRatingProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.stars} role="radiogroup" aria-label={t('starRating.ariaLabel')}>
      {Array.from({ length: max }, (_, index) => index + 1).map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={t('starRating.starAriaLabel', { count: star, plural: star > 1 ? 's' : '' })}
          className={[styles.star, star <= value && styles.filled].filter(Boolean).join(' ')}
          disabled={disabled || !onChange}
          onClick={() => onChange?.(star)}
        >
          {star <= value ? '★' : '☆'}
        </button>
      ))}
    </div>
  );
}
