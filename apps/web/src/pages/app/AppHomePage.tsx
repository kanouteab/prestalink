import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { usePublicFeed } from '../../hooks/usePublicFeed';
import { useMyOffers } from '../../hooks/useOffers';
import { useMyRequests } from '../../hooks/useRequests';
import { useFavorites } from '../../hooks/useFavorites';
import { PublicationGrid } from '../../features/publications/PublicationGrid';
import { OfferCardItem, RequestCardItem } from '../../features/publications/PublicationCardItem';
import { AdBanner } from '../../features/ads/AdBanner';
import { LinkButton } from '../../components';
import { useTranslation } from '../../i18n/useTranslation';
import shared from '../shared.module.css';

export function AppHomePage() {
  const user = useAuthStore((state) => state.user);
  const { items, isLoading } = usePublicFeed();
  const { data: myOffers } = useMyOffers();
  const { data: myRequests } = useMyRequests();
  const { data: favorites } = useFavorites();
  const { t } = useTranslation();

  const recentItems = items?.slice(0, 6);

  return (
    <div>
      <header className={shared.pageHeader}>
        <h1>{t('appHome.greeting', { name: user?.fullName?.split(' ')[0] ?? '' })}</h1>
        <p>
          {t('appHome.stats', { offers: myOffers?.length ?? 0, requests: myRequests?.length ?? 0, favorites: favorites?.length ?? 0 })}
        </p>
      </header>

      <AdBanner />

      <div className={shared.toolbar}>
        <LinkButton to="/app/publier" variant="primary" size="sm">
          {t('appHome.publish')}
        </LinkButton>
        <LinkButton to="/app/publications" variant="secondary" size="sm">
          {t('appHome.myPublications')}
        </LinkButton>
        <LinkButton to="/app/favoris" variant="secondary" size="sm">
          {t('appHome.favorites')}
        </LinkButton>
      </div>

      <div className={shared.section}>
        <div className={shared.sectionHead}>
          <h2>{t('appHome.recentActivity')}</h2>
          <Link to="/app/explorer">{t('common.seeAll')}</Link>
        </div>
        <PublicationGrid
          items={recentItems}
          isLoading={isLoading}
          keyExtractor={(item) => `${item.type}-${item.data.id}`}
          renderItem={(item) => (item.type === 'OFFER' ? <OfferCardItem offer={item.data} /> : <RequestCardItem request={item.data} />)}
          emptyTitle={t('appHome.emptyTitle')}
          emptyMessage={t('appHome.emptyMessage')}
          skeletonCount={3}
        />
      </div>
    </div>
  );
}
