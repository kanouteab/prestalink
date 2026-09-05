import type { ReactNode } from 'react';
import styles from './EmptyState.module.css';

export interface EmptyStateProps {
  glyph?: string;
  title: string;
  message: string;
  action?: ReactNode;
}

export function EmptyState({ glyph = '🔎', title, message, action }: EmptyStateProps) {
  return (
    <div className={styles.empty}>
      <span className={styles.glyph} aria-hidden="true">
        {glyph}
      </span>
      <strong className={styles.title}>{title}</strong>
      <span>{message}</span>
      {action}
    </div>
  );
}
