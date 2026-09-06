import logoMark from '../../assets/logo-mark.png';
import styles from './Logo.module.css';

export interface LogoProps {
  markSize?: number;
  showWordmark?: boolean;
  className?: string;
}

/**
 * Marque reelle de PrestaLink (identique a celle configuree dans
 * branding_settings / /api/admin/branding) plutot qu'un simple texte.
 */
export function Logo({ markSize = 28, showWordmark = true, className }: LogoProps) {
  return (
    <span className={[styles.logo, className].filter(Boolean).join(' ')}>
      <img src={logoMark} alt={showWordmark ? '' : 'PrestaLink'} className={styles.mark} style={{ height: markSize }} />
      {showWordmark && <span className={styles.wordmark}>PrestaLink</span>}
    </span>
  );
}
