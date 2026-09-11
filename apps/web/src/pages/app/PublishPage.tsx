import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PublicationFormValues, PublicationKind } from '@prestalink/validation';
import { PublicationForm } from '../../features/publications/PublicationForm';
import { useCreateOffer } from '../../hooks/useOffers';
import { useCreateRequest } from '../../hooks/useRequests';
import { Chip, useToast } from '../../components';
import { useTranslation } from '../../i18n/useTranslation';
import shared from '../shared.module.css';

export function PublishPage() {
  const [kind, setKind] = useState<PublicationKind>('OFFER');
  const createOffer = useCreateOffer();
  const createRequest = useCreateRequest();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const submitting = createOffer.isPending || createRequest.isPending;

  const onSubmit = async (values: PublicationFormValues) => {
    try {
      if (values.kind === 'OFFER') {
        await createOffer.mutateAsync(values);
      } else {
        await createRequest.mutateAsync(values);
      }
      showToast(values.kind === 'OFFER' ? t('publish.successOffer') : t('publish.successRequest'), 'success');
      navigate('/app/publications');
    } catch {
      showToast(t('publish.errorToast'), 'error');
    }
  };

  return (
    <div className={shared.narrow} style={{ padding: 0 }}>
      <header className={shared.pageHeader}>
        <h1>{t('publish.title')}</h1>
        <p>{t('publish.subtitle')}</p>
      </header>

      <div className={shared.chipsRow}>
        <Chip as="button" selected={kind === 'OFFER'} onClick={() => setKind('OFFER')}>
          {t('publish.offerChip')}
        </Chip>
        <Chip as="button" selected={kind === 'REQUEST'} onClick={() => setKind('REQUEST')}>
          {t('publish.requestChip')}
        </Chip>
      </div>

      <PublicationForm key={kind} kind={kind} submitting={submitting} submitLabel={t('publish.submitLabel')} onSubmit={onSubmit} />
    </div>
  );
}
