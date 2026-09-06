import { Text, View } from 'react-native';
import { publicationStatusColor, type StatusColorRole } from '@prestalink/design-tokens';
import { useTheme } from '../../theme/ThemeProvider';

export type BadgeTone = StatusColorRole | 'offre' | 'demande';

export interface BadgeProps {
  tone: BadgeTone;
  children: string;
}

export function Badge({ tone, children }: BadgeProps) {
  const theme = useTheme();

  const palette: Record<BadgeTone, { bg: string; fg: string }> = {
    success: { bg: theme.colors.successTint, fg: theme.colors.success },
    brand: { bg: theme.colors.brandTint, fg: theme.colors.brand },
    neutral: { bg: theme.colors.surface2, fg: theme.colors.ink500 },
    danger: { bg: theme.colors.dangerTint, fg: theme.colors.danger },
    offre: { bg: theme.colors.offreTint, fg: theme.colors.offre },
    demande: { bg: theme.colors.demandeTint, fg: theme.colors.demande },
  };
  const colors = palette[tone];

  return (
    <View style={{ backgroundColor: colors.bg, paddingVertical: 4, paddingHorizontal: 10, borderRadius: theme.radius.pill, alignSelf: 'flex-start' }}>
      <Text style={{ color: colors.fg, fontSize: 11, fontWeight: '800' }}>{children}</Text>
    </View>
  );
}

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: 'Disponible',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminee',
  SUSPENDED: 'Suspendue',
  EXPIRED: 'Expiree',
};

export function PublicationStatusBadge({ status }: { status: string }) {
  const tone = (publicationStatusColor[status] ?? 'neutral') as BadgeTone;
  return <Badge tone={tone}>{STATUS_LABELS[status] ?? status}</Badge>;
}

export function PublicationTypeBadge({ type }: { type: 'OFFER' | 'REQUEST' }) {
  return <Badge tone={type === 'OFFER' ? 'offre' : 'demande'}>{type === 'OFFER' ? 'Offre' : 'Demande'}</Badge>;
}
