import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyboardAvoidingView, Platform, ScrollView, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { loginSchema, type LoginFormValues } from '@prestalink/validation';
import type { RootStackParamList } from '../../navigation/types';
import { FormField } from '../../components/Input/FormField';
import { Button } from '../../components/Button/Button';
import { useLogin } from '../../hooks/useAuth';
import { useTheme } from '../../theme/ThemeProvider';

export function LoginScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const login = useLogin();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit(async (values) => {
    await login.mutateAsync(values);
    navigation.navigate('Tabs');
  });

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.colors.surface0 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.xl, gap: theme.spacing.lg, flexGrow: 1, justifyContent: 'center' }}>
        <Text style={{ fontSize: 26, fontWeight: '600', color: theme.colors.ink900 }}>Connexion</Text>

        <FormField control={control} name="email" label="Adresse e-mail" errorText={errors.email?.message} keyboardType="email-address" autoCapitalize="none" />
        <FormField control={control} name="password" label="Mot de passe" errorText={errors.password?.message} secureTextEntry />

        {login.isError && <Text style={{ color: theme.colors.danger, fontSize: 13 }}>Identifiants incorrects.</Text>}

        <Button label="Se connecter" onPress={onSubmit} loading={login.isPending} />
        <Button label="Creer un compte" variant="ghost" onPress={() => navigation.navigate('Register')} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
