import { useNavigate, useParams } from 'react-router-dom';
import type { PublicationFormValues } from '@prestalink/validation';
import { PublicationForm } from '../../features/publications/PublicationForm';
import { useRequest, useUpdateRequest } from '../../hooks/useRequests';
import { useToast } from '../../components';
import shared from '../shared.module.css';

export function EditRequestPage() {
  const { id } = useParams<{ id: string }>();
  const requestId = Number(id);
  const { data: request, isLoading } = useRequest(requestId);
  const updateRequest = useUpdateRequest();
  const { showToast } = useToast();
  const navigate = useNavigate();

  if (isLoading || !request) return <div className={shared.page}>Chargement...</div>;

  const onSubmit = async (values: PublicationFormValues) => {
    if (values.kind !== 'REQUEST') return;
    try {
      await updateRequest.mutateAsync({ id: requestId, input: values });
      showToast('Demande mise a jour', 'success');
      navigate('/app/publications');
    } catch {
      showToast('Impossible de mettre a jour cette demande', 'error');
    }
  };

  return (
    <div className={shared.narrow} style={{ padding: 0 }}>
      <header className={shared.pageHeader}>
        <h1>Modifier la demande</h1>
      </header>
      <PublicationForm
        kind="REQUEST"
        submitting={updateRequest.isPending}
        submitLabel="Enregistrer"
        onCancel={() => navigate('/app/publications')}
        defaultValues={{
          title: request.title,
          description: request.description,
          categoryId: request.category.id,
          location: request.location,
          locationLabel: request.locationLabel,
          budget: request.budget,
        }}
        onSubmit={onSubmit}
      />
    </div>
  );
}
