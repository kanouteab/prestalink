import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { publicationSchema, type PublicationFormValues, type PublicationKind } from '@prestalink/validation';
import { Input, Textarea, Select, Button } from '../../components';
import { useCategories } from '../../hooks/useCategories';
import { useTranslation } from '../../i18n/useTranslation';
import styles from './PublicationForm.module.css';

export interface PublicationFormProps {
  kind: PublicationKind;
  defaultValues?: Partial<PublicationFormValues>;
  submitLabel?: string;
  submitting?: boolean;
  onSubmit: (values: PublicationFormValues) => void | Promise<void>;
  onCancel?: () => void;
}

/**
 * Moteur de formulaire unique pour creation/edition d'Offre et de Demande
 * (livrable 8) : seul le champ Prix/Budget change selon `kind`, le reste du
 * formulaire, sa validation et sa mise en page sont partages.
 */
export function PublicationForm({ kind, defaultValues, submitLabel, submitting, onSubmit, onCancel }: PublicationFormProps) {
  const { data: categories } = useCategories();
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PublicationFormValues>({
    resolver: zodResolver(publicationSchema(kind)),
    defaultValues: { kind, ...defaultValues } as PublicationFormValues,
  });

  const amountField = kind === 'OFFER' ? 'price' : 'budget';
  const amountLabel = kind === 'OFFER' ? t('publicationForm.priceLabel') : t('publicationForm.budgetLabel');
  const amountError = (errors as Record<string, { message?: string }>)[amountField]?.message;

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <input type="hidden" value={kind} {...register('kind')} />

      <Input
        label={t('publicationForm.titleLabel')}
        placeholder={kind === 'OFFER' ? t('publicationForm.titlePlaceholderOffer') : t('publicationForm.titlePlaceholderRequest')}
        errorText={errors.title?.message}
        {...register('title')}
      />

      <Textarea label={t('publicationForm.descriptionLabel')} errorText={errors.description?.message} {...register('description')} />

      <div className={styles.row}>
        <Select label={t('publicationForm.categoryLabel')} errorText={errors.categoryId?.message} {...register('categoryId', { valueAsNumber: true })}>
          <option value="">{t('publicationForm.categoryPlaceholder')}</option>
          {categories?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.icon} {category.name}
            </option>
          ))}
        </Select>

        <Input label={amountLabel} type="number" min={0} step={1} errorText={amountError} {...register(amountField, { valueAsNumber: true })} />
      </div>

      <Input label={t('publicationForm.locationLabel')} placeholder={t('publicationForm.locationPlaceholder')} errorText={errors.location?.message} {...register('location')} />

      <div className={styles.actions}>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            {t('publicationForm.cancel')}
          </Button>
        )}
        <Button type="submit" loading={submitting}>
          {submitLabel ?? t('publicationForm.publish')}
        </Button>
      </div>
    </form>
  );
}
