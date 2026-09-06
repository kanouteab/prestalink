import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import type { ComponentProps } from 'react';
import { Input } from './Input';

export interface FormFieldProps<T extends FieldValues> extends Omit<ComponentProps<typeof Input>, 'label' | 'value' | 'onChangeText'> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  errorText?: string;
}

/** Relie react-hook-form a notre <Input> RN, evite de repeter un <Controller> dans chaque ecran de formulaire. */
export function FormField<T extends FieldValues>({ control, name, label, errorText, ...rest }: FormFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <Input label={label} value={value as string} onChangeText={onChange} onBlur={onBlur} errorText={errorText} {...rest} />
      )}
    />
  );
}
