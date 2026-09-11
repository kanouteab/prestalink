import { useState } from 'react';
import { PlayIcon } from '../../components';
import { useTranslation } from '../../i18n/useTranslation';
import styles from './AdBanner.module.css';

export interface AdSlot {
  id: string;
  title: string;
  subtitle?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
}

export interface AdBannerProps {
  slots?: AdSlot[];
}

/**
 * Espace publicitaire du tableau de bord : un ou plusieurs spots video en
 * carrousel (points de pagination si `slots` en contient plusieurs). Sans
 * `videoUrl`, le spot reste un simple visuel cliquable (aucune video a lire).
 */
export function AdBanner({ slots }: AdBannerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const { t } = useTranslation();
  const effectiveSlots = slots ?? [
    { id: 'placeholder', title: t('adBanner.fallbackTitle'), subtitle: t('adBanner.fallbackSubtitle') },
  ];
  const active = effectiveSlots[activeIndex];

  if (!active) return null;

  const selectSlot = (index: number) => {
    setActiveIndex(index);
    setPlaying(false);
  };

  return (
    <section
      className={styles.banner}
      style={!playing && active.thumbnailUrl ? { backgroundImage: `url(${active.thumbnailUrl})` } : undefined}
    >
      <span className={styles.tag}>{t('adBanner.tag')}</span>

      {playing && active.videoUrl ? (
        <video className={styles.video} src={active.videoUrl} controls autoPlay onEnded={() => setPlaying(false)} />
      ) : (
        <>
          <button
            type="button"
            className={styles.playButton}
            onClick={() => active.videoUrl && setPlaying(true)}
            aria-label={t('adBanner.playAriaLabel', { title: active.title })}
          >
            <PlayIcon size={22} />
          </button>
          <div className={styles.copy}>
            <div className={styles.title}>{active.title}</div>
            {active.subtitle && <div className={styles.subtitle}>{active.subtitle}</div>}
          </div>
        </>
      )}

      {effectiveSlots.length > 1 && (
        <div className={styles.dots}>
          {effectiveSlots.map((slot, index) => (
            <button
              key={slot.id}
              type="button"
              className={[styles.dot, index === activeIndex && styles.dotActive].filter(Boolean).join(' ')}
              aria-label={t('adBanner.slotAriaLabel', { index: index + 1 })}
              onClick={() => selectSlot(index)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
