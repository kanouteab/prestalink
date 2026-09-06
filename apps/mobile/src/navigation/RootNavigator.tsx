import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { TabNavigator } from './TabNavigator';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { PublicationDetailScreen } from '../screens/publication/PublicationDetailScreen';
import { FavoritesScreen } from '../screens/favorites/FavoritesScreen';
import { MissionsScreen } from '../screens/missions/MissionsScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { ChatScreen } from '../screens/chat/ChatScreen';
import { useAuthStore } from '../store/authStore';
import { useRealtimeConnection } from '../hooks/useRealtimeConnection';
import { useNotificationsRealtime } from '../hooks/useNotifications';
import { useTheme } from '../theme/ThemeProvider';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const theme = useTheme();
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const hydrate = useAuthStore((state) => state.hydrate);
  useRealtimeConnection();
  useNotificationsRealtime();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surface0 }}>
        <ActivityIndicator color={theme.colors.brand} />
      </View>
    );
  }

  const navigationTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: theme.colors.surface0,
      card: theme.colors.surface1,
      text: theme.colors.ink900,
      border: theme.colors.border,
      primary: theme.colors.brand,
    },
  };

  const headerOptions = { headerShown: true, headerStyle: { backgroundColor: theme.colors.surface1 }, headerTintColor: theme.colors.ink900 };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs" component={TabNavigator} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="PublicationDetail" component={PublicationDetailScreen} options={{ ...headerOptions, title: '' }} />
        <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ ...headerOptions, title: 'Favoris' }} />
        <Stack.Screen name="Missions" component={MissionsScreen} options={{ ...headerOptions, title: 'Missions' }} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ ...headerOptions, title: 'Notifications' }} />
        <Stack.Screen name="Chat" component={ChatScreen} options={{ ...headerOptions, title: '' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
