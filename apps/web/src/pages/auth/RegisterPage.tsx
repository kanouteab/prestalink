import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { registerSchema, type RegisterFormValues } from '@prestalink/validation';
import { Button, Input, Logo } from '../../components';
import { useRegister } from '../../hooks/useAuth';
import styles from './AuthPages.module.css';

/**
 * L'ancien frontend n'a aucun selecteur de role a l'inscription (livrable A) —
 * c'est le premier ecran ou ce choix redevient une etape explicite plutot
 * qu'un reglage cache dans le profil apres coup.
 */
export function RegisterPage() {
  const navigate = useNavigate();
  const register_ = useRegister();
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
        <h1>Creer un compte</h1>

        <div className={styles.roleRow}>
          <button
            type="button"
            className={[styles.roleOption, role === 'CLIENT' && styles.selected].filter(Boolean).join(' ')}
            onClick={() => setValue('role', 'CLIENT')}
          >
            🙋 Client
            <span style={{ fontWeight: 400 }}>Je cherche un service</span>
          </button>
          <button
            type="button"
            className={[styles.roleOption, role === 'PRESTATAIRE' && styles.selected].filter(Boolean).join(' ')}
            onClick={() => setValue('role', 'PRESTATAIRE')}
          >
            🛠️ Prestataire
            <span style={{ fontWeight: 400 }}>Je propose un service</span>
          </button>
        </div>

        <Input label="Nom complet" errorText={errors.fullName?.message} {...register('fullName')} />
        <Input label="Adresse e-mail" type="email" autoComplete="email" errorText={errors.email?.message} {...register('email')} />
        <Input label="Telephone" errorText={errors.phone?.message} {...register('phone')} />

        <div className={styles.row}>
          <Input label="Mot de passe" type="password" autoComplete="new-password" errorText={errors.password?.message} {...register('password')} />
          <Input
            label="Confirmer"
            type="password"
            autoComplete="new-password"
            errorText={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
        </div>

        <Input label="Pays" errorText={errors.country?.message} {...register('country')} />
        <div className={styles.row}>
          <Input label="Adresse" errorText={errors.streetAddress?.message} {...register('streetAddress')} />
          <Input label="Code postal" errorText={errors.postalCode?.message} {...register('postalCode')} />
        </div>

        {register_.isError && <span className={styles.error}>L'inscription a echoue. Verifiez vos informations.</span>}

        <Button type="submit" loading={register_.isPending}>
          Creer mon compte
        </Button>
        <span className={styles.footNote}>
          Deja inscrit ? <Link to="/connexion">Se connecter</Link>
        </span>
      </form>
    </div>
  );
}
