import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { MissionResponse, MissionStatus } from '@prestalink/shared-types';
import { useCancelMission, useFinishMission, useMissionsRealtime, useMyMissions, useSubmitReview } from '../../hooks/useMissions';
import { useAuthStore } from '../../store/authStore';
import { buildDirectConversationKey } from '../../utils/chatKey';
import { Button, Chip, ConfirmDialog, EmptyState, MissionStatusBadge, useToast } from '../../components';
import { ReviewDialog } from '../../features/missions/ReviewDialog';
import { formatRelativeDate } from '../../utils/format';
import { useTranslation } from '../../i18n/useTranslation';
import shared from '../shared.module.css';
import styles from './MissionsPage.module.css';

type Filter = 'ALL' | MissionStatus;

export function MissionsPage() {
  useMissionsRealtime();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const { data, isLoading } = useMyMissions();
  const cancelMission = useCancelMission();
  const finishMission = useFinishMission();
  const submitReview = useSubmitReview();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const FILTERS: { value: Filter; label: string }[] = [
    { value: 'ALL', label: t('missions.filterAll') },
    { value: 'EN_ATTENTE', label: t('missions.filterPending') },
    { value: 'EN_COURS', label: t('missions.filterInProgress') },
    { value: 'TERMINEE', label: t('missions.filterCompleted') },
    { value: 'ANNULEE', label: t('missions.filterCancelled') },
  ];

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
        <h1>{t('missions.title')}</h1>
        <p>{t('missions.subtitle')}</p>
      </header>

      <div className={styles.tabs}>
        {FILTERS.map((item) => (
          <Chip as="button" key={item.value} selected={filter === item.value} onClick={() => setFilter(item.value)}>
            {item.label}
          </Chip>
        ))}
      </div>

      {isLoading ? (
        <p>{t('common.loading')}</p>
      ) : !filtered || filtered.length === 0 ? (
        <EmptyState title={t('missions.emptyTitle')} message={t('missions.emptyMessage')} />
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
                    <span>{isClient ? t('missions.roleProvider') : t('missions.roleClient')} : {otherParty.fullName}</span>
                    {mission.startedAt && <span>{t('missions.startedAt', { date: formatRelativeDate(mission.startedAt) })}</span>}
                    <MissionStatusBadge status={mission.status} />
                  </div>
                </div>
                <div className={styles.actions}>
                  <Link to={`/publication/REQUEST/${mission.request.id}`}>
                    <Button variant="ghost" size="sm">
                      {t('missions.requestLink')}
                    </Button>
                  </Link>
                  <Button variant="secondary" size="sm" onClick={() => onDiscuss(mission)}>
                    {t('missions.discuss')}
                  </Button>
                  {canAct && (
                    <Button variant="outline" size="sm" onClick={() => finishMission.mutate(mission.id, { onError: () => showToast(t('missions.finishError'), 'error') })}>
                      {t('missions.finish')}
                    </Button>
                  )}
                  {canAct && (
                    <Button variant="danger" size="sm" onClick={() => setPendingCancel(mission)}>
                      {t('missions.cancel')}
                    </Button>
                  )}
                  {canReview && (
                    <Button variant="primary" size="sm" onClick={() => setPendingReview(mission)}>
                      {t('missions.rate')}
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
        title={t('missions.cancelDialogTitle')}
        message={t('missions.cancelDialogMessage', { title: pendingCancel?.request.title ?? '' })}
        pending={cancelMission.isPending}
        onCancel={() => setPendingCancel(null)}
        onConfirm={() => {
          if (!pendingCancel) return;
          cancelMission.mutate(pendingCancel.id, {
            onSuccess: () => showToast(t('missions.cancelSuccess'), 'success'),
            onError: () => showToast(t('missions.cancelError'), 'error'),
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
                showToast(t('missions.reviewThanks'), 'success');
                setPendingReview(null);
              },
              onError: () => showToast(t('missions.reviewError'), 'error'),
            },
          );
        }}
      />
    </div>
  );
}
