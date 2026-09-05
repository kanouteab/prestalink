import type { CSSProperties } from 'react';
import styles from './Skeleton.module.css';

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  radius?: number;
}

export function Skeleton({ width = '100%', height = 16, radius }: SkeletonProps) {
  const style: CSSProperties = { width, height, borderRadius: radius };
  return <div className={styles.skeleton} style={style} aria-hidden="true" />;
}

/** Meme anatomie que PublicationCard, pour que le chargement ne "saute" pas visuellement. */
export function PublicationCardSkeleton() {
  return (
    <div className={styles.card} aria-hidden="true">
      <div className={styles.cardMedia} />
      <div className={styles.cardBody}>
        <Skeleton width={64} height={18} radius={999} />
        <Skeleton width="92%" height={16} />
        <Skeleton width="60%" height={12} />
        <Skeleton width="40%" height={18} />
      </div>
    </div>
  );
}
