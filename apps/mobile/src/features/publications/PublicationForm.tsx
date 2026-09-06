import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ScrollView, Text, View } from 'react-native';
import { publicationSchema, type PublicationFormValues, type PublicationKind } from '@prestalink/validation';
import { FormField } from '../../components/Input/FormField';
import { Input } from '../../components/Input/Input';
import { Chip } from '../../components/Chip/Chip';
import { Button } from '../../components/Button/Button';
import { useCategories } from '../../hooks/useCategories';
import { useTheme } from '../../theme/ThemeProvider';

export interface PublicationFormProps {
  kind: PublicationKind;
  defaultValues?: Partial<PublicationFormValues>;
  submitLabel?: string;
  submitting?: boolean;
  onSubmit: (values: PublicationFormValues) => void | Promise<void>;
}

/** Meme moteur que le Web (apps/web/.../PublicationForm.tsx) : seul le champ Prix/Budget change selon `kind` (livrable 8). */
export function PublicationForm({ kind, defaultValues, submitLabel = 'Publier', submitting, onSubmit }: PublicationFormProps) {
  const theme = useTheme();
  const { data: categories } = useCategories();
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PublicationFormValues>({
    resolver: zodResolver(publicationSchema(kind)),
    defaultValues: { kind, ...defaultValues } as PublicationFormValues,
  });

  const categoryId = watch('categoryId');
  const amountField = kind === 'OFFER' ? 'price' : 'budget';
  const amountLabel = kind === 'OFFER' ? 'Prix (FCFA)' : 'Budget (FCFA)';
  const amountError = (errors as Record<string, { message?: string }>)[amountField]?.message;

  return (
    <ScrollView contentContainerStyle={{ gap: theme.spacing.lg, paddingBottom: theme.spacing.xxl }}>
      <FormField control={control} name="title" label="Titre de l'annonce" errorText={errors.title?.message} />
      <FormField control={control} name="description" label="Description" errorText={errors.description?.message} multiline numberOfLines={4} />

      <View style={{ gap: 8 }}>
        <Text style={{ fontSize: 12, fontWeight: '700', color: theme.colors.ink700 }}>Categorie</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {categories?.map((category) => (
            <Chip key={category.id} selected={categoryId === category.id} onPress={() => setValue('categoryId', category.id)}>
              {`${category.icon} ${category.name}`}
            </Chip>
          ))}
        </View>
        {errors.categoryId?.message && <Text style={{ color: theme.colors.danger, fontSize: 11.5 }}>{errors.categoryId.message}</Text>}
      </View>

      <FormField control={control} name="location" label="Localisation" errorText={errors.location?.message} placeholder="Ville, quartier" />

      <Controller
        control={control}
        name={amountField}
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label={amountLabel}
            errorText={amountError}
            keyboardType="numeric"
            value={value !== undefined ? String(value) : ''}
            onChangeText={(text) => onChange(text ? Number(text) : undefined)}
            onBlur={onBlur}
          />
        )}
      />

      <Button label={submitLabel} onPress={handleSubmit(onSubmit)} loading={submitting} />
    </ScrollView>
  );
}
