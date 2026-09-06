import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

export interface EmptyStateProps {
  glyph?: string;
  title: string;
  message: string;
  action?: ReactNode;
}

export function EmptyState({ glyph = '🔎', title, message, action }: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View
      style={{
        alignItems: 'center',
        gap: 8,
        padding: theme.spacing.xxl,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: theme.colors.borderStrong,
        borderRadius: theme.radius.lg,
      }}
    >
      <Text style={{ fontSize: 26 }}>{glyph}</Text>
      <Text style={{ fontWeight: '700', color: theme.colors.ink900 }}>{title}</Text>
      <Text style={{ color: theme.colors.ink500, textAlign: 'center' }}>{message}</Text>
      {action}
    </View>
  );
}
