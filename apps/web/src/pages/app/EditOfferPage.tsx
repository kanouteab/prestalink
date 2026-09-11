import { useNavigate, useParams } from 'react-router-dom';
import type { PublicationFormValues } from '@prestalink/validation';
import { PublicationForm } from '../../features/publications/PublicationForm';
import { useOffer, useUpdateOffer } from '../../hooks/useOffers';
import { useToast } from '../../components';
import { useTranslation } from '../../i18n/useTranslation';
import shared from '../shared.module.css';

export function EditOfferPage() {
  const { id } = useParams<{ id: string }>();
  const offerId = Number(id);
  const { data: offer, isLoading } = useOffer(offerId);
  const updateOffer = useUpdateOffer();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (isLoading || !offer) return <div className={shared.page}>{t('common.loading')}</div>;

  const onSubmit = async (values: PublicationFormValues) => {
    if (values.kind !== 'OFFER') return;
    try {
      await updateOffer.mutateAsync({ id: offerId, input: values });
      showToast(t('editOffer.successToast'), 'success');
      navigate('/app/publications');
    } catch {
      showToast(t('editOffer.errorToast'), 'error');
    }
  };

  return (
    <div className={shared.narrow} style={{ padding: 0 }}>
      <header className={shared.pageHeader}>
        <h1>{t('editOffer.title')}</h1>
      </header>
      <PublicationForm
        kind="OFFER"
        submitting={updateOffer.isPending}
        submitLabel={t('publicationForm.save')}
        onCancel={() => navigate('/app/publications')}
        defaultValues={{
          title: offer.title,
          description: offer.description,
          categoryId: offer.category.id,
          location: offer.location,
          locationLabel: offer.locationLabel,
          price: offer.price,
        }}
        onSubmit={onSubmit}
      />
    </div>
  );
}
