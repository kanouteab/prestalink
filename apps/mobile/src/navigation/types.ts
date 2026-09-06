import type { PublicationType } from '@prestalink/shared-types';

export type RootStackParamList = {
  Tabs: undefined;
  Login: undefined;
  Register: undefined;
  PublicationDetail: { type: PublicationType; id: number };
  Favorites: undefined;
  Missions: undefined;
  Notifications: undefined;
  Chat: {
    conversationKey: string;
    otherUserId: number;
    otherUserName: string;
    publicationType: PublicationType;
    publicationId: number;
    publicationTitle: string;
  };
};

export type TabParamList = {
  Home: undefined;
  Explore: undefined;
  Publish: undefined;
  Messages: undefined;
  Profile: undefined;
};
