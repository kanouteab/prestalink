import { Link } from 'react-router-dom';
import { usePublicFeed } from '../../hooks/usePublicFeed';
import { useCategories } from '../../hooks/useCategories';
import { PublicationGrid } from '../../features/publications/PublicationGrid';
import { OfferCardItem, RequestCardItem } from '../../features/publications/PublicationCardItem';
import { HeroBanner } from '../../features/home/HeroBanner';
import { Chip, LinkButton } from '../../components';
import { useTranslation } from '../../i18n/useTranslation';
import shared from '../shared.module.css';

export function HomePage() {
  const { items, isLoading } = usePublicFeed();
  const { data: categories } = useCategories();
  const { t } = useTranslation();

  return (
    <div className={shared.page}>
      <HeroBanner />

      <header className={shared.pageHeader}>
        <h2>{t('home.sectionTitle')}</h2>
        <p>{t('home.sectionSubtitle')}</p>
      </header>

      {categories && categories.length > 0 && (
        <div className={shared.chipsRow}>
          {categories.map((category) => (
            <Chip as="span" key={category.id}>
              {category.icon} {category.name}
            </Chip>
          ))}
        </div>
      )}

      <div className={shared.toolbar}>
        <LinkButton to="/explorer" variant="outline" size="sm">
          {t('home.exploreCta')}
        </LinkButton>
      </div>

      <PublicationGrid
        items={items}
        isLoading={isLoading}
        keyExtractor={(item) => `${item.type}-${item.data.id}`}
        renderItem={(item) => (item.type === 'OFFER' ? <OfferCardItem offer={item.data} /> : <RequestCardItem request={item.data} />)}
        emptyTitle={t('home.emptyTitle')}
        emptyMessage={t('home.emptyMessage')}
        emptyAction={
          <Link to="/inscription" style={{ fontWeight: 700 }}>
            {t('home.emptyAction')}
          </Link>
        }
      />
    </div>
  );
}
