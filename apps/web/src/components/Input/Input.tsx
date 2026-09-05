import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import styles from './Input.module.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helpText?: string;
  errorText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helpText, errorText, id, className, ...rest }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const hasError = Boolean(errorText);

    return (
      <div className={[styles.field, hasError && styles.error, className].filter(Boolean).join(' ')}>
        <label className={styles.label} htmlFor={inputId}>
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={styles.control}
          aria-invalid={hasError || undefined}
          aria-describedby={helpText || errorText ? `${inputId}-help` : undefined}
          {...rest}
        />
        {(helpText || errorText) && (
          <span id={`${inputId}-help`} className={styles.help}>
            {errorText ?? helpText}
          </span>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';
