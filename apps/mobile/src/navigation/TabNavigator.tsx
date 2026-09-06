import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { TabParamList } from './types';
import { useTheme } from '../theme/ThemeProvider';
import { HomeScreen } from '../screens/home/HomeScreen';
import { ExploreScreen } from '../screens/explore/ExploreScreen';
import { PublishScreen } from '../screens/publish/PublishScreen';
import { MessagesScreen } from '../screens/home/MessagesScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator<TabParamList>();

const TAB_ICONS: Record<keyof TabParamList, string> = {
  Home: '🏠',
  Explore: '🔍',
  Publish: '➕',
  Messages: '💬',
  Profile: '👤',
};

const TAB_LABELS: Record<keyof TabParamList, string> = {
  Home: 'Accueil',
  Explore: 'Explorer',
  Publish: 'Publier',
  Messages: 'Messages',
  Profile: 'Profil',
};

/** Bottom Tab Navigation du livrable D : Accueil, Explorer, Publier, Messages, Profil. */
export function TabNavigator() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.brand,
        tabBarInactiveTintColor: theme.colors.ink300,
        tabBarStyle: { backgroundColor: theme.colors.surface1, borderTopColor: theme.colors.border },
        tabBarLabel: TAB_LABELS[route.name],
        tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>{TAB_ICONS[route.name]}</Text>,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Publish" component={PublishScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
