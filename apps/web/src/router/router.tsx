import { lazy, Suspense, type ComponentType } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { AppLayout } from '../layouts/AppLayout';
import { RequireAuth } from '../routes/RequireAuth';
import { PageFallback } from './PageFallback';

// Chaque page est chargee dans son propre chunk (livrable 25) : le bundle
// initial ne charge plus l'intégralité de l'app (offres, chat, missions...)
// avant meme d'afficher l'accueil.
const HomePage = lazy(() => import('../pages/public/HomePage').then((m) => ({ default: m.HomePage })));
const ExplorePage = lazy(() => import('../pages/public/ExplorePage').then((m) => ({ default: m.ExplorePage })));
const OffersPage = lazy(() => import('../pages/public/OffersPage').then((m) => ({ default: m.OffersPage })));
const RequestsPage = lazy(() => import('../pages/public/RequestsPage').then((m) => ({ default: m.RequestsPage })));
const PublicationDetailPage = lazy(() =>
  import('../pages/public/PublicationDetailPage').then((m) => ({ default: m.PublicationDetailPage })),
);
const ContactPage = lazy(() => import('../pages/public/ContactPage').then((m) => ({ default: m.ContactPage })));
const AboutPage = lazy(() => import('../pages/public/AboutPage').then((m) => ({ default: m.AboutPage })));
const LoginPage = lazy(() => import('../pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })));

const AppHomePage = lazy(() => import('../pages/app/AppHomePage').then((m) => ({ default: m.AppHomePage })));
const PublishPage = lazy(() => import('../pages/app/PublishPage').then((m) => ({ default: m.PublishPage })));
const MyPublicationsPage = lazy(() => import('../pages/app/MyPublicationsPage').then((m) => ({ default: m.MyPublicationsPage })));
const EditOfferPage = lazy(() => import('../pages/app/EditOfferPage').then((m) => ({ default: m.EditOfferPage })));
const EditRequestPage = lazy(() => import('../pages/app/EditRequestPage').then((m) => ({ default: m.EditRequestPage })));
const FavoritesPage = lazy(() => import('../pages/app/FavoritesPage').then((m) => ({ default: m.FavoritesPage })));
const MessagesPage = lazy(() => import('../pages/app/MessagesPage').then((m) => ({ default: m.MessagesPage })));
const ChatPage = lazy(() => import('../pages/app/ChatPage').then((m) => ({ default: m.ChatPage })));
const NotificationsPage = lazy(() => import('../pages/app/NotificationsPage').then((m) => ({ default: m.NotificationsPage })));
const MissionsPage = lazy(() => import('../pages/app/MissionsPage').then((m) => ({ default: m.MissionsPage })));
const ProfilePage = lazy(() => import('../pages/app/ProfilePage').then((m) => ({ default: m.ProfilePage })));

const DesignSystemShowcasePage = lazy(() =>
  import('../pages/DesignSystemShowcasePage').then((m) => ({ default: m.DesignSystemShowcasePage })),
);
const NotFoundPage = lazy(() => import('../pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

function page(Component: ComponentType) {
  return (
    <Suspense fallback={<PageFallback />}>
      <Component />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: page(HomePage) },
      { path: '/explorer', element: page(ExplorePage) },
      { path: '/offres', element: page(OffersPage) },
      { path: '/demandes', element: page(RequestsPage) },
      { path: '/publication/:type/:id', element: page(PublicationDetailPage) },
      { path: '/contact', element: page(ContactPage) },
      { path: '/a-propos', element: page(AboutPage) },
      { path: '/connexion', element: page(LoginPage) },
      { path: '/inscription', element: page(RegisterPage) },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/app', element: page(AppHomePage) },
          { path: '/app/explorer', element: page(ExplorePage) },
          { path: '/app/publier', element: page(PublishPage) },
          { path: '/app/publications', element: page(MyPublicationsPage) },
          { path: '/app/publications/offres/:id/modifier', element: page(EditOfferPage) },
          { path: '/app/publications/demandes/:id/modifier', element: page(EditRequestPage) },
          { path: '/app/favoris', element: page(FavoritesPage) },
          { path: '/app/messages', element: page(MessagesPage) },
          { path: '/app/messages/chat', element: page(ChatPage) },
          { path: '/app/notifications', element: page(NotificationsPage) },
          { path: '/app/missions', element: page(MissionsPage) },
          { path: '/app/profil', element: page(ProfilePage) },
        ],
      },
    ],
  },
  { path: '/design-system', element: page(DesignSystemShowcasePage) },
  { path: '*', element: page(NotFoundPage) },
]);
