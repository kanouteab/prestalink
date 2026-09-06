import { useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MissionResponse, MissionStatus } from '@prestalink/shared-types';
import type { RootStackParamList } from '../../navigation/types';
import { useCancelMission, useFinishMission, useMissionsRealtime, useMyMissions, useSubmitReview } from '../../hooks/useMissions';
import { useAuthStore } from '../../store/authStore';
import { buildDirectConversationKey } from '../../utils/chatKey';
import { Chip } from '../../components/Chip/Chip';
import { Button } from '../../components/Button/Button';
import { MissionStatusBadge } from '../../components/Badge/Badge';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { ConfirmDialog } from '../../components/ConfirmDialog/ConfirmDialog';
import { ReviewDialog } from '../../features/missions/ReviewDialog';
import { formatRelativeDate } from '../../utils/format';
import { useTheme } from '../../theme/ThemeProvider';

type Filter = 'ALL' | MissionStatus;
const FILTERS: { value: Filter; label: string }[] = [
  { value: 'ALL', label: 'Toutes' },
  { value: 'EN_ATTENTE', label: 'En attente' },
  { value: 'EN_COURS', label: 'En cours' },
  { value: 'TERMINEE', label: 'Terminees' },
  { value: 'ANNULEE', label: 'Annulees' },
];

export function MissionsScreen() {
  const theme = useTheme();
  useMissionsRealtime();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const { data, isLoading } = useMyMissions();
  const cancelMission = useCancelMission();
  const finishMission = useFinishMission();
  const submitReview = useSubmitReview();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [filter, setFilter] = useState<Filter>('ALL');
  const [pendingCancel, setPendingCancel] = useState<MissionResponse | null>(null);
  const [pendingReview, setPendingReview] = useState<MissionResponse | null>(null);

  const filtered = data?.filter((mission) => filter === 'ALL' || mission.status === filter);

  const onDiscuss = (mission: MissionResponse) => {
    if (!currentUserId) return;
    const otherParty = mission.client.id === currentUserId ? mission.provider : mission.client;
    navigation.navigate('Chat', {
      conversationKey: buildDirectConversationKey(currentUserId, otherParty.id, 'REQUEST', mission.request.id),
      otherUserId: otherParty.id,
      otherUserName: otherParty.fullName,
      publicationType: 'REQUEST',
      publicationId: mission.request.id,
      publicationTitle: mission.request.title,
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.surface0 }} edges={['bottom']}>
      <FlatList
        data={filtered}
        keyExtractor={(mission) => String(mission.id)}
        contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.md }}
        ListHeaderComponent={
          <View style={{ gap: theme.spacing.md, marginBottom: theme.spacing.sm }}>
            <Text style={{ fontSize: 22, fontWeight: '600', color: theme.colors.ink900 }}>Missions</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {FILTERS.map((item) => (
                  <Chip key={item.value} selected={filter === item.value} onPress={() => setFilter(item.value)}>
                    {item.label}
                  </Chip>
                ))}
              </View>
            </ScrollView>
          </View>
        }
        renderItem={({ item: mission }) => {
          const isClient = mission.client.id === currentUserId;
          const otherParty = isClient ? mission.provider : mission.client;
          const canAct = mission.status === 'EN_ATTENTE' || mission.status === 'EN_COURS';
          const canReview = isClient && mission.status === 'TERMINEE';

          return (
            <View style={{ backgroundColor: theme.colors.surface1, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.lg, gap: 8 }}>
              <Text style={{ fontWeight: '700', color: theme.colors.ink900 }}>{mission.request.title}</Text>
              <Text style={{ fontSize: 12.5, color: theme.colors.ink500 }}>
                {isClient ? 'Prestataire' : 'Client'} : {otherParty.fullName}
                {mission.startedAt ? ` · Debut ${formatRelativeDate(mission.startedAt)}` : ''}
              </Text>
              <MissionStatusBadge status={mission.status} />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                <Button label="Discuter" size="sm" variant="secondary" onPress={() => onDiscuss(mission)} />
                {canAct && <Button label="Terminer" size="sm" variant="outline" onPress={() => finishMission.mutate(mission.id)} />}
                {canAct && <Button label="Annuler" size="sm" variant="danger" onPress={() => setPendingCancel(mission)} />}
                {canReview && <Button label="Noter" size="sm" onPress={() => setPendingReview(mission)} />}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={theme.colors.brand} style={{ marginTop: 40 }} />
          ) : (
            <EmptyState title="Aucune mission" message="Les missions apparaissent des qu'un prestataire accepte une demande." />
          )
        }
      />

      <ConfirmDialog
        visible={pendingCancel !== null}
        title="Annuler cette mission ?"
        message={`La mission "${pendingCancel?.request.title}" sera annulee pour les deux parties.`}
        pending={cancelMission.isPending}
        onCancel={() => setPendingCancel(null)}
        onConfirm={() => {
          if (!pendingCancel) return;
          cancelMission.mutate(pendingCancel.id, { onSettled: () => setPendingCancel(null) });
        }}
      />

      <ReviewDialog
        visible={pendingReview !== null}
        providerName={pendingReview?.provider.fullName ?? ''}
        pending={submitReview.isPending}
        onCancel={() => setPendingReview(null)}
        onSubmit={(rating, comment) => {
          if (!pendingReview) return;
          submitReview.mutate(
            { providerId: pendingReview.provider.id, missionId: pendingReview.id, rating, comment },
            { onSuccess: () => setPendingReview(null) },
          );
        }}
      />
    </SafeAreaView>
  );
}
