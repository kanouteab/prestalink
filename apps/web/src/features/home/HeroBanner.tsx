import heroPhoto from '../../assets/hero-provider.jpg';
import { useHomeBanner } from '../../hooks/useHomeBanner';
import { useIsAuthenticated } from '../../store/authStore';
import { LinkButton } from '../../components';
import { useTranslation } from '../../i18n/useTranslation';
import styles from './HeroBanner.module.css';

/**
 * Reprend le contenu reel de home_banners (deja administrable via
 * /api/admin/banners) : seule la photo est une image fixe recadree cote
 * frontend (le fichier source contient une maquette de produit perimee,
 * inadaptee a un fond de bannniere) — le titre, le sous-titre, les 4 atouts
 * et les libelles de bouton restent pilotes par l'admin.
 */
export function HeroBanner() {
  const { data: banner } = useHomeBanner();
  const isAuthenticated = useIsAuthenticated();
  const { t } = useTranslation();

  if (!banner) return null;

  const primaryTo = isAuthenticated ? '/app/publier' : '/inscription';
  const features = [banner.feature1, banner.feature2, banner.feature3, banner.feature4].filter(Boolean) as string[];

  return (
    <section className={styles.hero}>
      <div className={styles.grid}>
        <div>
          <span className={styles.kicker}>{t('hero.kicker')}</span>
          <h1 className={styles.title}>{banner.title}</h1>
          <p className={styles.subtitle}>{banner.subtitle}</p>
          {features.length > 0 && (
            <div className={styles.features}>
              {features.map((feature, index) => (
                <span key={feature} className={styles.feature}>
                  <span className={styles.featureIcon} aria-hidden="true">
                    {index + 1}
                  </span>
                  {feature}
                </span>
              ))}
            </div>
          )}
          <div className={styles.actions}>
            <LinkButton to={primaryTo} variant="primary">
              {banner.primaryButtonText}
            </LinkButton>
            <LinkButton to="/offres" variant="outline">
              {banner.secondaryButtonText}
            </LinkButton>
          </div>
        </div>
        <div className={styles.photoWrap}>
          <div className={styles.photoBlob} aria-hidden="true" />
          <img src={heroPhoto} alt={t('hero.photoAlt')} className={styles.photo} />
        </div>
      </div>
    </section>
  );
}
