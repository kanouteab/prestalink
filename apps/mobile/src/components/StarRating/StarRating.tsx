import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

export interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  max?: number;
}

export function StarRating({ value, onChange, max = 5 }: StarRatingProps) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {Array.from({ length: max }, (_, index) => index + 1).map((star) => (
        <Pressable key={star} onPress={() => onChange?.(star)} hitSlop={6} accessibilityRole="radio" accessibilityState={{ selected: value === star }}>
          <Text style={{ fontSize: 30, color: star <= value ? theme.colors.warning : theme.colors.borderStrong }}>{star <= value ? '★' : '☆'}</Text>
        </Pressable>
      ))}
    </View>
  );
}
