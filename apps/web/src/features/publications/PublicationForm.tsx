import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { publicationSchema, type PublicationFormValues, type PublicationKind } from '@prestalink/validation';
import { Input, Textarea, Select, Button } from '../../components';
import { useCategories } from '../../hooks/useCategories';
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
export function PublicationForm({ kind, defaultValues, submitLabel = 'Publier', submitting, onSubmit, onCancel }: PublicationFormProps) {
  const { data: categories } = useCategories();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PublicationFormValues>({
    resolver: zodResolver(publicationSchema(kind)),
    defaultValues: { kind, ...defaultValues } as PublicationFormValues,
  });

  const amountField = kind === 'OFFER' ? 'price' : 'budget';
  const amountLabel = kind === 'OFFER' ? 'Prix (FCFA)' : 'Budget (FCFA)';
  const amountError = (errors as Record<string, { message?: string }>)[amountField]?.message;

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <input type="hidden" value={kind} {...register('kind')} />

      <Input
        label="Titre de l'annonce"
        placeholder={kind === 'OFFER' ? 'Ex : Cours de soutien scolaire' : "Ex : Recherche plombier disponible ce week-end"}
        errorText={errors.title?.message}
        {...register('title')}
      />

      <Textarea label="Description" errorText={errors.description?.message} {...register('description')} />

      <div className={styles.row}>
        <Select label="Categorie" errorText={errors.categoryId?.message} {...register('categoryId', { valueAsNumber: true })}>
          <option value="">Choisir...</option>
          {categories?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.icon} {category.name}
            </option>
          ))}
        </Select>

        <Input label={amountLabel} type="number" min={0} step={1} errorText={amountError} {...register(amountField, { valueAsNumber: true })} />
      </div>

      <Input label="Localisation" placeholder="Ville, quartier" errorText={errors.location?.message} {...register('location')} />

      <div className={styles.actions}>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Annuler
          </Button>
        )}
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
