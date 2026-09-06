import type { ApiClient } from './httpClient.js';
import { createAuthService } from './services/authService.js';
import { createCategoryService } from './services/categoryService.js';
import { createOfferService } from './services/offerService.js';
import { createRequestService } from './services/requestService.js';
import { createPublicationService } from './services/publicationService.js';
import { createFavoriteService } from './services/favoriteService.js';
import { createMissionService } from './services/missionService.js';
import { createChatService } from './services/chatService.js';
import { createNotificationService } from './services/notificationService.js';
import { createUserService } from './services/userService.js';
import { createProviderService } from './services/providerService.js';
import { createHistoryService } from './services/historyService.js';
import { createDashboardService } from './services/dashboardService.js';
import { createReportService } from './services/reportService.js';
import { createContentService } from './services/contentService.js';

/** Point d'entree unique : `const api = createApiServices(client)` cote Web comme Mobile. */
export function createApiServices(client: ApiClient) {
  const offers = createOfferService(client);
  const requests = createRequestService(client);

  return {
    auth: createAuthService(client),
    categories: createCategoryService(client),
    offers,
    requests,
    publications: createPublicationService(client, offers, requests),
    favorites: createFavoriteService(client),
    missions: createMissionService(client),
    chat: createChatService(client),
    notifications: createNotificationService(client),
    users: createUserService(client),
    providers: createProviderService(client),
    history: createHistoryService(client),
    dashboard: createDashboardService(client),
    reports: createReportService(client),
    content: createContentService(client),
  };
}

export type ApiServices = ReturnType<typeof createApiServices>;
