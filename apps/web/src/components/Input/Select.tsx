import { forwardRef, useId, type ReactNode, type SelectHTMLAttributes } from 'react';
import styles from './Input.module.css';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  helpText?: string;
  errorText?: string;
  children: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, helpText, errorText, id, className, children, ...rest }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const hasError = Boolean(errorText);

    return (
      <div className={[styles.field, hasError && styles.error, className].filter(Boolean).join(' ')}>
        <label className={styles.label} htmlFor={selectId}>
          {label}
        </label>
        <select
          ref={ref}
          id={selectId}
          className={styles.control}
          aria-invalid={hasError || undefined}
          aria-describedby={helpText || errorText ? `${selectId}-help` : undefined}
          {...rest}
        >
          {children}
        </select>
        {(helpText || errorText) && (
          <span id={`${selectId}-help`} className={styles.help}>
            {errorText ?? helpText}
          </span>
        )}
      </div>
    );
  },
);
Select.displayName = 'Select';
