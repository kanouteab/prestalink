import { useNavigate, useParams } from 'react-router-dom';
import type { PublicationFormValues } from '@prestalink/validation';
import { PublicationForm } from '../../features/publications/PublicationForm';
import { useOffer, useUpdateOffer } from '../../hooks/useOffers';
import { useToast } from '../../components';
import shared from '../shared.module.css';

export function EditOfferPage() {
  const { id } = useParams<{ id: string }>();
  const offerId = Number(id);
  const { data: offer, isLoading } = useOffer(offerId);
  const updateOffer = useUpdateOffer();
  const { showToast } = useToast();
  const navigate = useNavigate();

  if (isLoading || !offer) return <div className={shared.page}>Chargement...</div>;

  const onSubmit = async (values: PublicationFormValues) => {
    if (values.kind !== 'OFFER') return;
    try {
      await updateOffer.mutateAsync({ id: offerId, input: values });
      showToast('Offre mise a jour', 'success');
      navigate('/app/publications');
    } catch {
      showToast('Impossible de mettre a jour cette offre', 'error');
    }
  };

  return (
    <div className={shared.narrow} style={{ padding: 0 }}>
      <header className={shared.pageHeader}>
        <h1>Modifier l'offre</h1>
      </header>
      <PublicationForm
        kind="OFFER"
        submitting={updateOffer.isPending}
        submitLabel="Enregistrer"
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
