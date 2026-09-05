import { Link, type LinkProps } from 'react-router-dom';
import styles from './Button.module.css';
import type { ButtonSize, ButtonVariant } from './Button.js';

export interface LinkButtonProps extends LinkProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const sizeClass: Record<ButtonSize, string> = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
};

/** Meme habillage visuel que Button, pour un lien de navigation qui doit ressembler a un CTA. */
export function LinkButton({ variant = 'primary', size = 'md', className, ...rest }: LinkButtonProps) {
  return <Link className={[styles.btn, styles[variant], sizeClass[size], className].filter(Boolean).join(' ')} {...rest} />;
}
