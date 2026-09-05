import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loginSchema, type LoginFormValues } from '@prestalink/validation';
import { Button, Input } from '../../components';
import { useLogin } from '../../hooks/useAuth';
import styles from './AuthPages.module.css';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const redirectTo = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/app';

  const onSubmit = handleSubmit(async (values) => {
    await login.mutateAsync(values);
    navigate(redirectTo, { replace: true });
  });

  return (
    <div className={styles.wrap}>
      <form className={styles.card} onSubmit={onSubmit} noValidate>
        <h1>Connexion</h1>
        <Input label="Adresse e-mail" type="email" autoComplete="email" errorText={errors.email?.message} {...register('email')} />
        <Input label="Mot de passe" type="password" autoComplete="current-password" errorText={errors.password?.message} {...register('password')} />
        {login.isError && <span className={styles.error}>Identifiants incorrects. Verifiez votre e-mail et votre mot de passe.</span>}
        <Button type="submit" loading={login.isPending}>
          Se connecter
        </Button>
        <span className={styles.footNote}>
          Pas encore de compte ? <Link to="/inscription">Creer un compte</Link>
        </span>
      </form>
    </div>
  );
}
