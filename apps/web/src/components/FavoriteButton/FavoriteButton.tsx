import styles from './FavoriteButton.module.css';

export interface FavoriteButtonProps {
  active: boolean;
  pending?: boolean;
  onToggle: () => void;
  /** Libelle accessible ; a fournir avec le titre de la publication concernee. */
  label: string;
}

/** Equivalent Web du composant natif FavoriteButton (livrable 10) — meme contrat, rendu propre a la plateforme. */
export function FavoriteButton({ active, pending, onToggle, label }: FavoriteButtonProps) {
  return (
    <button
      type="button"
      className={[styles.button, active && styles.active].filter(Boolean).join(' ')}
      onClick={onToggle}
      disabled={pending}
      aria-pressed={active}
      aria-label={label}
    >
      {active ? '♥' : '♡'}
    </button>
  );
}
