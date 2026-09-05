import { createBrowserRouter } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { AppLayout } from '../layouts/AppLayout';
import { RequireAuth } from '../routes/RequireAuth';

import { HomePage } from '../pages/public/HomePage';
import { ExplorePage } from '../pages/public/ExplorePage';
import { OffersPage } from '../pages/public/OffersPage';
import { RequestsPage } from '../pages/public/RequestsPage';
import { PublicationDetailPage } from '../pages/public/PublicationDetailPage';
import { ContactPage } from '../pages/public/ContactPage';
import { AboutPage } from '../pages/public/AboutPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';

import { AppHomePage } from '../pages/app/AppHomePage';
import { PublishPage } from '../pages/app/PublishPage';
import { MyPublicationsPage } from '../pages/app/MyPublicationsPage';
import { EditOfferPage } from '../pages/app/EditOfferPage';
import { EditRequestPage } from '../pages/app/EditRequestPage';
import { FavoritesPage } from '../pages/app/FavoritesPage';
import { MessagesPage } from '../pages/app/MessagesPage';
import { ChatPage } from '../pages/app/ChatPage';
import { NotificationsPage } from '../pages/app/NotificationsPage';
import { MissionsPage } from '../pages/app/MissionsPage';

import { DesignSystemShowcasePage } from '../pages/DesignSystemShowcasePage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/explorer', element: <ExplorePage /> },
      { path: '/offres', element: <OffersPage /> },
      { path: '/demandes', element: <RequestsPage /> },
      { path: '/publication/:type/:id', element: <PublicationDetailPage /> },
      { path: '/contact', element: <ContactPage /> },
      { path: '/a-propos', element: <AboutPage /> },
      { path: '/connexion', element: <LoginPage /> },
      { path: '/inscription', element: <RegisterPage /> },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/app', element: <AppHomePage /> },
          { path: '/app/explorer', element: <ExplorePage /> },
          { path: '/app/publier', element: <PublishPage /> },
          { path: '/app/publications', element: <MyPublicationsPage /> },
          { path: '/app/publications/offres/:id/modifier', element: <EditOfferPage /> },
          { path: '/app/publications/demandes/:id/modifier', element: <EditRequestPage /> },
          { path: '/app/favoris', element: <FavoritesPage /> },
          { path: '/app/messages', element: <MessagesPage /> },
          { path: '/app/messages/chat', element: <ChatPage /> },
          { path: '/app/notifications', element: <NotificationsPage /> },
          { path: '/app/missions', element: <MissionsPage /> },
        ],
      },
    ],
  },
  { path: '/design-system', element: <DesignSystemShowcasePage /> },
  { path: '*', element: <NotFoundPage /> },
]);
