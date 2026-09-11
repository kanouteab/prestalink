import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { registerSchema, type RegisterFormValues } from '@prestalink/validation';
import { Button, Input, Logo } from '../../components';
import { useRegister } from '../../hooks/useAuth';
import { useTranslation } from '../../i18n/useTranslation';
import styles from './AuthPages.module.css';

/**
 * L'ancien frontend n'a aucun selecteur de role a l'inscription (livrable A) —
 * c'est le premier ecran ou ce choix redevient une etape explicite plutot
 * qu'un reglage cache dans le profil apres coup.
 */
export function RegisterPage() {
  const navigate = useNavigate();
  const register_ = useRegister();
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema), defaultValues: { role: 'CLIENT' } });

  const role = watch('role');

  const onSubmit = handleSubmit(async (values) => {
    await register_.mutateAsync(values);
    navigate('/app', { replace: true });
  });

  return (
    <div className={styles.wrap}>
      <form className={styles.card} onSubmit={onSubmit} noValidate>
        <Logo markSize={36} showWordmark={false} className={styles.logo} />
        <h1>{t('auth.register.title')}</h1>

        <div className={styles.roleRow}>
          <button
            type="button"
            className={[styles.roleOption, role === 'CLIENT' && styles.selected].filter(Boolean).join(' ')}
            onClick={() => setValue('role', 'CLIENT')}
          >
            🙋 {t('auth.register.client')}
            <span style={{ fontWeight: 400 }}>{t('auth.register.clientHint')}</span>
          </button>
          <button
            type="button"
            className={[styles.roleOption, role === 'PRESTATAIRE' && styles.selected].filter(Boolean).join(' ')}
            onClick={() => setValue('role', 'PRESTATAIRE')}
          >
            🛠️ {t('auth.register.provider')}
            <span style={{ fontWeight: 400 }}>{t('auth.register.providerHint')}</span>
          </button>
        </div>

        <Input label={t('auth.register.fullName')} errorText={errors.fullName?.message} {...register('fullName')} />
        <Input label={t('auth.register.email')} type="email" autoComplete="email" errorText={errors.email?.message} {...register('email')} />
        <Input label={t('auth.register.phone')} errorText={errors.phone?.message} {...register('phone')} />

        <div className={styles.row}>
          <Input label={t('auth.register.password')} type="password" autoComplete="new-password" errorText={errors.password?.message} {...register('password')} />
          <Input
            label={t('auth.register.confirmPassword')}
            type="password"
            autoComplete="new-password"
            errorText={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
        </div>

        <Input label={t('auth.register.country')} errorText={errors.country?.message} {...register('country')} />
        <div className={styles.row}>
          <Input label={t('auth.register.address')} errorText={errors.streetAddress?.message} {...register('streetAddress')} />
          <Input label={t('auth.register.postalCode')} errorText={errors.postalCode?.message} {...register('postalCode')} />
        </div>

        {register_.isError && <span className={styles.error}>{t('auth.register.error')}</span>}

        <Button type="submit" loading={register_.isPending}>
          {t('auth.register.submit')}
        </Button>
        <span className={styles.footNote}>
          {t('auth.register.alreadyRegistered')} <Link to="/connexion">{t('auth.register.login')}</Link>
        </span>
      </form>
    </div>
  );
}
