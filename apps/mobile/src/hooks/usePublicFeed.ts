import type { OfferResponse, RequestResponse } from '@prestalink/shared-types';
import { useOffersFeed } from './useOffers';
import { useRequestsList } from './useRequests';

export type FeedItem = { type: 'OFFER'; data: OfferResponse } | { type: 'REQUEST'; data: RequestResponse };

export function usePublicFeed() {
  const offers = useOffersFeed();
  const requests = useRequestsList();
  const isLoading = offers.isLoading || requests.isLoading;

  const items: FeedItem[] | undefined = isLoading
    ? undefined
    : [
        ...(offers.data ?? []).map((data): FeedItem => ({ type: 'OFFER', data })),
        ...(requests.data ?? []).map((data): FeedItem => ({ type: 'REQUEST', data })),
      ].sort((a, b) => Date.parse(b.data.createdAt) - Date.parse(a.data.createdAt));

  return { items, isLoading, refetch: () => { offers.refetch(); requests.refetch(); } };
}
