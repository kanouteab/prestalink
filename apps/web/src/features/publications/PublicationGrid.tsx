import type { ReactNode } from 'react';
import { EmptyState, PublicationCardSkeleton } from '../../components';
import styles from './PublicationGrid.module.css';

export interface PublicationGridProps<T> {
  items: T[] | undefined;
  isLoading: boolean;
  renderItem: (item: T) => ReactNode;
  keyExtractor: (item: T) => string | number;
  emptyTitle: string;
  emptyMessage: string;
  emptyAction?: ReactNode;
  skeletonCount?: number;
}

/** Grille de cartes generique (skeletons pendant le chargement, etat vide sinon) reutilisee par toutes les listes de publications. */
export function PublicationGrid<T>({
  items,
  isLoading,
  renderItem,
  keyExtractor,
  emptyTitle,
  emptyMessage,
  emptyAction,
  skeletonCount = 6,
}: PublicationGridProps<T>) {
  if (isLoading) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <PublicationCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return <EmptyState title={emptyTitle} message={emptyMessage} action={emptyAction} />;
  }

  return <div className={styles.grid}>{items.map((item) => <div key={keyExtractor(item)}>{renderItem(item)}</div>)}</div>;
}
