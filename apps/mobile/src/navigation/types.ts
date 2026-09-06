import type { PublicationType } from '@prestalink/shared-types';

export type RootStackParamList = {
  Tabs: undefined;
  Login: undefined;
  Register: undefined;
  PublicationDetail: { type: PublicationType; id: number };
};

export type TabParamList = {
  Home: undefined;
  Explore: undefined;
  Publish: undefined;
  Messages: undefined;
  Profile: undefined;
};
