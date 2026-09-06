import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { registerSchema, type RegisterFormValues } from '@prestalink/validation';
import type { RootStackParamList } from '../../navigation/types';
import { FormField } from '../../components/Input/FormField';
import { Button } from '../../components/Button/Button';
import { useRegister } from '../../hooks/useAuth';
import { useTheme } from '../../theme/ThemeProvider';

/** Meme correction que le Web : un vrai choix de role a l'inscription, absent de l'ancien frontend (livrable A). */
export function RegisterScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const register = useRegister();
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema), defaultValues: { role: 'CLIENT' } });

  const role = watch('role');

  const onSubmit = handleSubmit(async (values) => {
    await register.mutateAsync(values);
    navigation.navigate('Tabs');
  });

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.colors.surface0 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.xl, gap: theme.spacing.lg }}>
        <Text style={{ fontSize: 26, fontWeight: '600', color: theme.colors.ink900 }}>Creer un compte</Text>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <RoleOption label="🙋 Client" selected={role === 'CLIENT'} onPress={() => setValue('role', 'CLIENT')} />
          <RoleOption label="🛠️ Prestataire" selected={role === 'PRESTATAIRE'} onPress={() => setValue('role', 'PRESTATAIRE')} />
        </View>

        <FormField control={control} name="fullName" label="Nom complet" errorText={errors.fullName?.message} />
        <FormField control={control} name="email" label="Adresse e-mail" errorText={errors.email?.message} keyboardType="email-address" autoCapitalize="none" />
        <FormField control={control} name="phone" label="Telephone" errorText={errors.phone?.message} keyboardType="phone-pad" />
        <FormField control={control} name="password" label="Mot de passe" errorText={errors.password?.message} secureTextEntry />
        <FormField control={control} name="confirmPassword" label="Confirmer" errorText={errors.confirmPassword?.message} secureTextEntry />
        <FormField control={control} name="country" label="Pays" errorText={errors.country?.message} />
        <FormField control={control} name="streetAddress" label="Adresse" errorText={errors.streetAddress?.message} />
        <FormField control={control} name="postalCode" label="Code postal" errorText={errors.postalCode?.message} />

        {register.isError && <Text style={{ color: theme.colors.danger, fontSize: 13 }}>L'inscription a echoue. Verifiez vos informations.</Text>}

        <Button label="Creer mon compte" onPress={onSubmit} loading={register.isPending} />
        <Button label="Deja inscrit ? Se connecter" variant="ghost" onPress={() => navigation.navigate('Login')} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function RoleOption({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        padding: theme.spacing.md,
        borderRadius: theme.radius.md,
        borderWidth: 1.5,
        borderColor: selected ? theme.colors.brand : theme.colors.borderStrong,
        backgroundColor: selected ? theme.colors.brandTint : theme.colors.surface1,
        alignItems: 'center',
      }}
    >
      <Text style={{ fontWeight: '700', fontSize: 13, color: selected ? theme.colors.brand : theme.colors.ink900 }}>{label}</Text>
    </Pressable>
  );
}
