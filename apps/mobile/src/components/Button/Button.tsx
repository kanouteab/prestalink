import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  label: string;
}

const SIZE_PADDING: Record<ButtonSize, { v: number; h: number; font: number }> = {
  sm: { v: 7, h: 14, font: 13 },
  md: { v: 11, h: 18, font: 14 },
  lg: { v: 14, h: 22, font: 15.5 },
};

/** Equivalent Web : apps/web/src/components/Button/Button.tsx — memes variantes, memes tokens, etat "pressed" au lieu de "hover". */
export function Button({ variant = 'primary', size = 'md', loading, label, disabled, ...rest }: ButtonProps) {
  const theme = useTheme();
  const sizing = SIZE_PADDING[size];
  const isDisabled = disabled || loading;

  const palette: Record<ButtonVariant, { bg: string; fg: string; border?: string }> = {
    primary: { bg: theme.colors.brand, fg: '#fff' },
    secondary: { bg: theme.colors.surface2, fg: theme.colors.ink900, border: theme.colors.borderStrong },
    outline: { bg: 'transparent', fg: theme.colors.brand, border: theme.colors.brand },
    danger: { bg: theme.colors.danger, fg: '#fff' },
    ghost: { bg: 'transparent', fg: theme.colors.ink500 },
  };
  const colors = palette[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      style={({ pressed }) => ({
        backgroundColor: colors.bg,
        borderWidth: colors.border ? 1.5 : 0,
        borderColor: colors.border,
        borderRadius: theme.radius.md,
        paddingVertical: sizing.v,
        paddingHorizontal: sizing.h,
        opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
        transform: [{ scale: pressed && !isDisabled ? 0.97 : 1 }],
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      })}
      {...rest}
    >
      {loading && <ActivityIndicator size="small" color={colors.fg} />}
      <Text style={{ color: colors.fg, fontWeight: '700', fontSize: sizing.font }}>{label}</Text>
    </Pressable>
  );
}
