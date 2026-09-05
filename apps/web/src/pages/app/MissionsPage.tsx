import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { MissionResponse, MissionStatus } from '@prestalink/shared-types';
import { useCancelMission, useFinishMission, useMissionsRealtime, useMyMissions, useSubmitReview } from '../../hooks/useMissions';
import { useAuthStore } from '../../store/authStore';
import { buildDirectConversationKey } from '../../utils/chatKey';
import { Button, Chip, ConfirmDialog, EmptyState, MissionStatusBadge, useToast } from '../../components';
import { ReviewDialog } from '../../features/missions/ReviewDialog';
import { formatRelativeDate } from '../../utils/format';
import shared from '../shared.module.css';
import styles from './MissionsPage.module.css';

type Filter = 'ALL' | MissionStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'ALL', label: 'Toutes' },
  { value: 'EN_ATTENTE', label: 'En attente' },
  { value: 'EN_COURS', label: 'En cours' },
  { value: 'TERMINEE', label: 'Terminees' },
  { value: 'ANNULEE', label: 'Annulees' },
];

export function MissionsPage() {
  useMissionsRealtime();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const { data, isLoading } = useMyMissions();
  const cancelMission = useCancelMission();
  const finishMission = useFinishMission();
  const submitReview = useSubmitReview();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [filter, setFilter] = useState<Filter>('ALL');
  const [pendingCancel, setPendingCancel] = useState<MissionResponse | null>(null);
  const [pendingReview, setPendingReview] = useState<MissionResponse | null>(null);

  const filtered = data?.filter((mission) => filter === 'ALL' || mission.status === filter);

  const onDiscuss = (mission: MissionResponse) => {
    if (!currentUserId) return;
    const otherParty = mission.client.id === currentUserId ? mission.provider : mission.client;
    navigate('/app/messages/chat', {
      state: {
        conversationKey: buildDirectConversationKey(currentUserId, otherParty.id, 'REQUEST', mission.request.id),
        otherUserId: otherParty.id,
        otherUserName: otherParty.fullName,
        publicationType: 'REQUEST',
        publicationId: mission.request.id,
        publicationTitle: mission.request.title,
      },
    });
  };

  return (
    <div className={shared.page} style={{ padding: 0 }}>
      <header className={shared.pageHeader}>
        <h1>Missions</h1>
        <p>Suivi des missions en tant que client ou prestataire.</p>
      </header>

      <div className={styles.tabs}>
        {FILTERS.map((item) => (
          <Chip as="button" key={item.value} selected={filter === item.value} onClick={() => setFilter(item.value)}>
            {item.label}
          </Chip>
        ))}
      </div>

      {isLoading ? (
        <p>Chargement...</p>
      ) : !filtered || filtered.length === 0 ? (
        <EmptyState title="Aucune mission" message="Les missions apparaissent ici des qu'un prestataire accepte une demande." />
      ) : (
        <div className={styles.list}>
          {filtered.map((mission) => {
            const isClient = mission.client.id === currentUserId;
            const otherParty = isClient ? mission.provider : mission.client;
            const canAct = mission.status === 'EN_ATTENTE' || mission.status === 'EN_COURS';
            const canReview = isClient && mission.status === 'TERMINEE';

            return (
              <div className={styles.row} key={mission.id}>
                <div className={styles.info}>
                  <div className={styles.title}>{mission.request.title}</div>
                  <div className={styles.meta}>
                    <span>{isClient ? 'Prestataire' : 'Client'} : {otherParty.fullName}</span>
                    {mission.startedAt && <span>Debut {formatRelativeDate(mission.startedAt)}</span>}
                    <MissionStatusBadge status={mission.status} />
                  </div>
                </div>
                <div className={styles.actions}>
                  <Link to={`/publication/REQUEST/${mission.request.id}`}>
                    <Button variant="ghost" size="sm">
                      Demande
                    </Button>
                  </Link>
                  <Button variant="secondary" size="sm" onClick={() => onDiscuss(mission)}>
                    Discuter
                  </Button>
                  {canAct && (
                    <Button variant="outline" size="sm" onClick={() => finishMission.mutate(mission.id, { onError: () => showToast('Impossible de terminer la mission', 'error') })}>
                      Terminer
                    </Button>
                  )}
                  {canAct && (
                    <Button variant="danger" size="sm" onClick={() => setPendingCancel(mission)}>
                      Annuler
                    </Button>
                  )}
                  {canReview && (
                    <Button variant="primary" size="sm" onClick={() => setPendingReview(mission)}>
                      Noter
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={pendingCancel !== null}
        title="Annuler cette mission ?"
        message={`La mission "${pendingCancel?.request.title}" sera annulee pour les deux parties.`}
        pending={cancelMission.isPending}
        onCancel={() => setPendingCancel(null)}
        onConfirm={() => {
          if (!pendingCancel) return;
          cancelMission.mutate(pendingCancel.id, {
            onSuccess: () => showToast('Mission annulee', 'success'),
            onError: () => showToast("Impossible d'annuler cette mission", 'error'),
            onSettled: () => setPendingCancel(null),
          });
        }}
      />

      <ReviewDialog
        open={pendingReview !== null}
        providerName={pendingReview?.provider.fullName ?? ''}
        pending={submitReview.isPending}
        onCancel={() => setPendingReview(null)}
        onSubmit={(rating, comment) => {
          if (!pendingReview) return;
          submitReview.mutate(
            { providerId: pendingReview.provider.id, missionId: pendingReview.id, rating, comment },
            {
              onSuccess: () => {
                showToast('Merci pour votre avis', 'success');
                setPendingReview(null);
              },
              onError: () => showToast("Impossible d'enregistrer l'avis (peut-etre deja note)", 'error'),
            },
          );
        }}
      />
    </div>
  );
}
