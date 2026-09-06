import { Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

interface BaseProps {
  children: string;
}

interface StaticChipProps extends BaseProps {
  onPress?: undefined;
  style?: StyleProp<ViewStyle>;
}

interface SelectableChipProps extends BaseProps {
  onPress: () => void;
  selected?: boolean;
}

export type ChipProps = StaticChipProps | SelectableChipProps;

export function Chip(props: ChipProps) {
  const theme = useTheme();

  if (props.onPress) {
    const { children, onPress, selected } = props;
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityState={{ selected: Boolean(selected) }}
        style={({ pressed }) => ({
          paddingVertical: 6,
          paddingHorizontal: 12,
          borderRadius: theme.radius.pill,
          backgroundColor: selected ? theme.colors.brand : theme.colors.surface2,
          borderWidth: 1,
          borderColor: selected ? theme.colors.brand : theme.colors.border,
          opacity: pressed ? 0.8 : 1,
        })}
      >
        <Text style={{ fontSize: 12.5, fontWeight: '700', color: selected ? '#fff' : theme.colors.ink700 }}>{children}</Text>
      </Pressable>
    );
  }

  const { children, style } = props;
  return (
    <View
      style={[
        {
          paddingVertical: 6,
          paddingHorizontal: 12,
          borderRadius: theme.radius.pill,
          backgroundColor: theme.colors.surface2,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        style,
      ]}
    >
      <Text style={{ fontSize: 12.5, fontWeight: '700', color: theme.colors.ink700 }}>{children}</Text>
    </View>
  );
}
