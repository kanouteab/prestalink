import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OfferResponse, RequestResponse } from '@prestalink/shared-types';
import type { RootStackParamList } from '../../navigation/types';
import { PublicationCard } from '../../components/PublicationCard/PublicationCard';
import { useFavoriteToggle } from '../../hooks/useFavoriteToggle';
import { mapOfferToCard, mapRequestToCard } from './mapToCard';

export function OfferCardItem({ offer }: { offer: OfferResponse }) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const favoriteState = useFavoriteToggle('OFFER', offer.id);
  return <PublicationCard {...mapOfferToCard(offer, favoriteState)} onPress={() => navigation.navigate('PublicationDetail', { type: 'OFFER', id: offer.id })} />;
}

export function RequestCardItem({ request }: { request: RequestResponse }) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const favoriteState = useFavoriteToggle('REQUEST', request.id);
  return (
    <PublicationCard {...mapRequestToCard(request, favoriteState)} onPress={() => navigation.navigate('PublicationDetail', { type: 'REQUEST', id: request.id })} />
  );
}
