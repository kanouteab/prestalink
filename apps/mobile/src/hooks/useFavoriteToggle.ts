import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { PublicationType } from '@prestalink/shared-types';
import type { RootStackParamList } from '../navigation/types';
import { useIsFavorite, useToggleFavorite } from './useFavorites';
import { useIsAuthenticated } from '../store/authStore';

export function useFavoriteToggle(type: PublicationType, id: number) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isAuthenticated = useIsAuthenticated();
  const favorite = useIsFavorite(type, id);
  const toggle = useToggleFavorite();

  const onToggle = () => {
    if (!isAuthenticated) {
      navigation.navigate('Login');
      return;
    }
    toggle.mutate({ type, id, currentlyFavorite: favorite });
  };

  return { favorite, pending: toggle.isPending, onToggle };
}
