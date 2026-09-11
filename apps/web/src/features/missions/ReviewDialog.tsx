import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button, StarRating, Textarea } from '../../components';
import { useTranslation } from '../../i18n/useTranslation';
import styles from './ReviewDialog.module.css';

export interface ReviewDialogProps {
  open: boolean;
  providerName: string;
  pending?: boolean;
  onCancel: () => void;
  onSubmit: (rating: number, comment: string) => void;
}

export function ReviewDialog({ open, providerName, pending, onCancel, onSubmit }: ReviewDialogProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const { t } = useTranslation();

  if (!open) return null;

  return createPortal(
    <div className={styles.overlay} onMouseDown={(event) => event.target === event.currentTarget && onCancel()}>
      <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="review-dialog-title">
        <span id="review-dialog-title" className={styles.title}>
          {t('reviewDialog.title', { name: providerName })}
        </span>
        <StarRating value={rating} onChange={setRating} />
        <Textarea label={t('reviewDialog.commentLabel')} value={comment} onChange={(event) => setComment(event.target.value)} rows={3} />
        <div className={styles.actions}>
          <Button variant="secondary" onClick={onCancel}>
            {t('reviewDialog.cancel')}
          </Button>
          <Button variant="primary" disabled={rating === 0} loading={pending} onClick={() => onSubmit(rating, comment)}>
            {t('reviewDialog.send')}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
