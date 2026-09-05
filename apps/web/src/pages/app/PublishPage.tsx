import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PublicationFormValues, PublicationKind } from '@prestalink/validation';
import { PublicationForm } from '../../features/publications/PublicationForm';
import { useCreateOffer } from '../../hooks/useOffers';
import { useCreateRequest } from '../../hooks/useRequests';
import { Chip, useToast } from '../../components';
import shared from '../shared.module.css';

export function PublishPage() {
  const [kind, setKind] = useState<PublicationKind>('OFFER');
  const createOffer = useCreateOffer();
  const createRequest = useCreateRequest();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const submitting = createOffer.isPending || createRequest.isPending;

  const onSubmit = async (values: PublicationFormValues) => {
    try {
      if (values.kind === 'OFFER') {
        await createOffer.mutateAsync(values);
      } else {
        await createRequest.mutateAsync(values);
      }
      showToast(values.kind === 'OFFER' ? 'Offre publiee avec succes' : 'Demande publiee avec succes', 'success');
      navigate('/app/publications');
    } catch {
      showToast('Impossible de publier pour le moment', 'error');
    }
  };

  return (
    <div className={shared.narrow} style={{ padding: 0 }}>
      <header className={shared.pageHeader}>
        <h1>Publier</h1>
        <p>Choisissez le type de publication : une offre si vous proposez un service, une demande si vous en cherchez un.</p>
      </header>

      <div className={shared.chipsRow}>
        <Chip as="button" selected={kind === 'OFFER'} onClick={() => setKind('OFFER')}>
          Je propose un service (Offre)
        </Chip>
        <Chip as="button" selected={kind === 'REQUEST'} onClick={() => setKind('REQUEST')}>
          Je cherche un service (Demande)
        </Chip>
      </div>

      <PublicationForm key={kind} kind={kind} submitting={submitting} submitLabel="Publier" onSubmit={onSubmit} />
    </div>
  );
}
