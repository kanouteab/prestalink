import { Pressable, Text, View } from 'react-native';
import type { PublicationType } from '@prestalink/shared-types';
import { useTheme } from '../../theme/ThemeProvider';
import { Chip } from '../Chip/Chip';
import { PublicationStatusBadge, PublicationTypeBadge } from '../Badge/Badge';
import { formatCurrency, formatRelativeDate } from '../../utils/format';

export interface PublicationCardProps {
  type: PublicationType;
  title: string;
  categoryName: string;
  locationLabel: string;
  createdAt: string;
  amount: number;
  authorInitials: string;
  authorName: string;
  status: string;
  favorite?: boolean;
  favoritePending?: boolean;
  onToggleFavorite?: () => void;
  onPress?: () => void;
}

/** Meme anatomie de carte que le Web (apps/web/.../PublicationCard.tsx) : carte verticale compacte, adaptee au mobile (livrable 5/E). */
export function PublicationCard({
  type,
  title,
  categoryName,
  locationLabel,
  createdAt,
  amount,
  authorInitials,
  authorName,
  status,
  favorite,
  favoritePending,
  onToggleFavorite,
  onPress,
}: PublicationCardProps) {
  const theme = useTheme();
  const amountLabel = type === 'OFFER' ? formatCurrency(amount) : `Budget : ${formatCurrency(amount)}`;
  const mediaTint = type === 'OFFER' ? theme.colors.offreTint : theme.colors.demandeTint;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: theme.colors.surface1,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden',
        opacity: pressed ? 0.9 : 1,
      })}
    >
      <View style={{ backgroundColor: mediaTint, padding: theme.spacing.sm, flexDirection: 'row', justifyContent: 'space-between' }}>
        <PublicationTypeBadge type={type} />
        {onToggleFavorite && (
          <Pressable onPress={onToggleFavorite} disabled={favoritePending} hitSlop={8}>
            <Text style={{ fontSize: 16, color: favorite ? theme.colors.demande : theme.colors.ink500 }}>{favorite ? '♥' : '♡'}</Text>
          </Pressable>
        )}
      </View>
      <View style={{ padding: theme.spacing.lg, gap: 6 }}>
        <Chip>{categoryName}</Chip>
        <Text style={{ fontWeight: '700', fontSize: 14.5, color: theme.colors.ink900 }} numberOfLines={2}>
          {title}
        </Text>
        <Text style={{ fontSize: 12, color: theme.colors.ink500 }}>
          📍 {locationLabel} · {formatRelativeDate(createdAt)}
        </Text>
        <Text style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: 15, color: theme.colors.ink900 }}>{amountLabel}</Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 4,
            paddingTop: theme.spacing.sm,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 }}>
            <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: theme.colors.surface2, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: theme.colors.ink500 }}>{authorInitials}</Text>
            </View>
            <Text style={{ fontSize: 12, color: theme.colors.ink700 }} numberOfLines={1}>
              {authorName}
            </Text>
          </View>
          <PublicationStatusBadge status={status} />
        </View>
      </View>
    </Pressable>
  );
}
