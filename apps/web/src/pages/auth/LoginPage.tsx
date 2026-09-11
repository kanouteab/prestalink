import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loginSchema, type LoginFormValues } from '@prestalink/validation';
import { Button, Input, Logo } from '../../components';
import { useLogin } from '../../hooks/useAuth';
import { useTranslation } from '../../i18n/useTranslation';
import styles from './AuthPages.module.css';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();
  const { t } = useTranslation();
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
        <Logo markSize={36} showWordmark={false} className={styles.logo} />
        <h1>{t('auth.login.title')}</h1>
        <Input label={t('auth.login.email')} type="email" autoComplete="email" errorText={errors.email?.message} {...register('email')} />
        <Input label={t('auth.login.password')} type="password" autoComplete="current-password" errorText={errors.password?.message} {...register('password')} />
        {login.isError && <span className={styles.error}>{t('auth.login.error')}</span>}
        <Button type="submit" loading={login.isPending}>
          {t('auth.login.submit')}
        </Button>
        <span className={styles.footNote}>
          {t('auth.login.noAccount')} <Link to="/inscription">{t('auth.login.createAccount')}</Link>
        </span>
      </form>
    </div>
  );
}
