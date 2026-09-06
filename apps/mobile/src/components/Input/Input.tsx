import { forwardRef } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

export interface InputProps extends TextInputProps {
  label: string;
  errorText?: string;
  helpText?: string;
}

export const Input = forwardRef<TextInput, InputProps>(({ label, errorText, helpText, style, ...rest }, ref) => {
  const theme = useTheme();
  const hasError = Boolean(errorText);

  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 12, fontWeight: '700', color: theme.colors.ink700 }}>{label}</Text>
      <TextInput
        ref={ref}
        placeholderTextColor={theme.colors.ink300}
        style={[
          {
            fontSize: 14,
            paddingVertical: 10,
            paddingHorizontal: 12,
            borderRadius: theme.radius.sm,
            borderWidth: 1.5,
            borderColor: hasError ? theme.colors.danger : theme.colors.borderStrong,
            backgroundColor: theme.colors.surface1,
            color: theme.colors.ink900,
          },
          style,
        ]}
        {...rest}
      />
      {(errorText || helpText) && (
        <Text style={{ fontSize: 11.5, color: hasError ? theme.colors.danger : theme.colors.ink300 }}>{errorText ?? helpText}</Text>
      )}
    </View>
  );
});
Input.displayName = 'Input';
