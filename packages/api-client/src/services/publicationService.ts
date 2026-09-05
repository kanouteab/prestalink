import type { ApiClient } from '../httpClient.js';
import type { OfferResponse, RequestResponse } from '@prestalink/shared-types';
import type { OfferService } from './offerService.js';
import type { RequestService } from './requestService.js';

/**
 * Facade de conversion Offre <-> Demande (livrable 8 / 12).
 *
 * TODO(backend, livrable H) : remplacer ce flux par un seul appel transactionnel
 * `POST /api/offers/{id}/convert-to-request` (et son miroir) des que ces
 * endpoints existent. En attendant, cette fonction centralise en un seul
 * endroit ce que l'ancien frontend dupliquait sur ~200 lignes (offers.js et
 * requests.js) : creer la nouvelle publication, reporter les photos, puis
 * supprimer l'ancienne. Ce n'est pas atomique : en cas d'echec de suppression,
 * la nouvelle publication reste creee (a l'identique du comportement actuel).
 */
export function createPublicationService(client: ApiClient, offers: OfferService, requests: RequestService) {
  async function copyPhotos(photoUrls: string[]): Promise<File[]> {
    const files = await Promise.all(
      photoUrls.map(async (url, index) => {
        const response = await fetch(client.resolveAssetUrl(url));
        const blob = await response.blob();
        return new File([blob], `photo-${index}.jpg`, { type: blob.type || 'image/jpeg' });
      }),
    );
    return files;
  }

  return {
    async convertOfferToRequest(offer: OfferResponse, budget: number): Promise<RequestResponse> {
      const created = await requests.create({
        title: offer.title,
        description: offer.description,
        budget,
        location: offer.location,
        locationLabel: offer.locationLabel,
        latitude: offer.latitude,
        longitude: offer.longitude,
        categoryId: offer.category.id,
      });

      if (offer.photoUrls.length > 0) {
        try {
          const files = await copyPhotos(offer.photoUrls);
          await requests.uploadPhotos(created.id, files);
        } catch {
          // Best effort : la conversion reussit meme si le report des photos echoue.
        }
      }

      await offers.remove(offer.id);
      return created;
    },

    async convertRequestToOffer(request: RequestResponse, price: number): Promise<OfferResponse> {
      const created = await offers.create({
        title: request.title,
        description: request.description,
        price,
        location: request.location,
        locationLabel: request.locationLabel,
        latitude: request.latitude,
        longitude: request.longitude,
        categoryId: request.category.id,
      });

      if (request.photoUrls.length > 0) {
        try {
          const files = await copyPhotos(request.photoUrls);
          await offers.uploadPhotos(created.id, files);
        } catch {
          // Best effort.
        }
      }

      await requests.remove(request.id);
      return created;
    },
  };
}

export type PublicationService = ReturnType<typeof createPublicationService>;
