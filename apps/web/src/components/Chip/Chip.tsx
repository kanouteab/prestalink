import type { ButtonHTMLAttributes, HTMLAttributes } from 'react';
import styles from './Chip.module.css';

interface StaticChipProps extends HTMLAttributes<HTMLSpanElement> {
  as?: 'span';
}

interface SelectableChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  as: 'button';
  selected?: boolean;
}

export type ChipProps = StaticChipProps | SelectableChipProps;

/** Chip statique (categorie, localisation) ou selectionnable (filtre). */
export function Chip(props: ChipProps) {
  if (props.as === 'button') {
    const { as: _as, selected, className, ...rest } = props;
    return (
      <button
        type="button"
        aria-pressed={selected}
        className={[styles.chip, styles.selectable, selected && styles.selected, className].filter(Boolean).join(' ')}
        {...rest}
      />
    );
  }

  const { as: _as, className, ...rest } = props;
  return <span className={[styles.chip, className].filter(Boolean).join(' ')} {...rest} />;
}
