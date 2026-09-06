import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Button } from '../../components/Button/Button';
import { Badge } from '../../components/Badge/Badge';
import { useAuthStore, useIsAuthenticated } from '../../store/authStore';
import { useLogout } from '../../hooks/useAuth';
import { useTheme } from '../../theme/ThemeProvider';
import { initials } from '../../utils/format';

export function ProfileScreen() {
  const theme = useTheme();
  const isAuthenticated = useIsAuthenticated();
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.surface0, padding: theme.spacing.xl, gap: theme.spacing.lg, justifyContent: 'center' }}>
        <Text style={{ fontSize: 18, fontWeight: '700', textAlign: 'center', color: theme.colors.ink900 }}>Connectez-vous a votre compte</Text>
        <Button label="Se connecter" onPress={() => navigation.navigate('Login')} />
        <Button label="Creer un compte" variant="secondary" onPress={() => navigation.navigate('Register')} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.surface0 }} edges={['top']}>
      <View style={{ padding: theme.spacing.xl, gap: theme.spacing.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.lg }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: theme.colors.surface2, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: theme.colors.ink500 }}>{initials(user.fullName)}</Text>
          </View>
          <View style={{ gap: 4 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.ink900 }}>{user.fullName}</Text>
            <Text style={{ color: theme.colors.ink500 }}>{user.role === 'PRESTATAIRE' ? 'Prestataire' : 'Client'}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          {user.verifiedProfile && <Badge tone="success">Profil verifie</Badge>}
          {user.trustBadge && <Badge tone="brand">{user.trustBadge}</Badge>}
        </View>

        <Text style={{ color: theme.colors.ink500 }}>{user.email}</Text>
        <Text style={{ color: theme.colors.ink500 }}>{user.phone}</Text>

        <Button label="Se deconnecter" variant="secondary" onPress={() => logout.mutate()} loading={logout.isPending} />
      </View>
    </SafeAreaView>
  );
}
