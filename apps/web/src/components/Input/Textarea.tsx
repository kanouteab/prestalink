import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';
import styles from './Input.module.css';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  helpText?: string;
  errorText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, helpText, errorText, id, className, rows = 4, ...rest }, ref) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    const hasError = Boolean(errorText);

    return (
      <div className={[styles.field, hasError && styles.error, className].filter(Boolean).join(' ')}>
        <label className={styles.label} htmlFor={textareaId}>
          {label}
        </label>
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={styles.control}
          aria-invalid={hasError || undefined}
          aria-describedby={helpText || errorText ? `${textareaId}-help` : undefined}
          {...rest}
        />
        {(helpText || errorText) && (
          <span id={`${textareaId}-help`} className={styles.help}>
            {errorText ?? helpText}
          </span>
        )}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';
