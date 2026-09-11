import { useState } from 'react';
import { PlayIcon } from '../../components';
import styles from './AdBanner.module.css';

export interface AdSlot {
  id: string;
  title: string;
  subtitle?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
}

const DEFAULT_SLOTS: AdSlot[] = [
  {
    id: 'placeholder',
    title: 'Trouvez le bon prestataire, en vidéo',
    subtitle: 'Présentations vidéo de nos meilleurs prestataires près de chez vous',
  },
];

export interface AdBannerProps {
  slots?: AdSlot[];
}

/**
 * Espace publicitaire du tableau de bord : un ou plusieurs spots video en
 * carrousel (points de pagination si `slots` en contient plusieurs). Sans
 * `videoUrl`, le spot reste un simple visuel cliquable (aucune video a lire).
 */
export function AdBanner({ slots = DEFAULT_SLOTS }: AdBannerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const active = slots[activeIndex];

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
      <span className={styles.tag}>Publicité</span>

      {playing && active.videoUrl ? (
        <video className={styles.video} src={active.videoUrl} controls autoPlay onEnded={() => setPlaying(false)} />
      ) : (
        <>
          <button
            type="button"
            className={styles.playButton}
            onClick={() => active.videoUrl && setPlaying(true)}
            aria-label={`Lire la vidéo : ${active.title}`}
          >
            <PlayIcon size={22} />
          </button>
          <div className={styles.copy}>
            <div className={styles.title}>{active.title}</div>
            {active.subtitle && <div className={styles.subtitle}>{active.subtitle}</div>}
          </div>
        </>
      )}

      {slots.length > 1 && (
        <div className={styles.dots}>
          {slots.map((slot, index) => (
            <button
              key={slot.id}
              type="button"
              className={[styles.dot, index === activeIndex && styles.dotActive].filter(Boolean).join(' ')}
              aria-label={`Annonce ${index + 1}`}
              onClick={() => selectSlot(index)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
