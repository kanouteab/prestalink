import { useMemo, useState } from 'react';
import {
  Button,
  Input,
  Chip,
  Badge,
  PublicationCard,
  PublicationCardSkeleton,
  EmptyState,
  useToast,
} from './components';
import { useThemePreference } from './theme/useThemePreference';
import styles from './App.module.css';

/**
 * Vitrine du design system (livrable E) — les memes composants sont documentes
 * dans Storybook (`npm run storybook`) ; cette page sert de verification rapide
 * en developpement (`npm run dev`).
 */
export default function App() {
  const { preference, cyclePreference } = useThemePreference();
  const { showToast } = useToast();
  const [favorite, setFavorite] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('menage');
  const sampleCreatedAt = useMemo(
    () => ({
      offer: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      request: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    }),
    [],
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Design system PrestaLink</h1>
          <p>Composants Web construits sur les tokens partages (@prestalink/design-tokens), memes valeurs que la version React Native.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={cyclePreference}>
          Theme : {preference}
        </Button>
      </header>

      <section className={styles.section}>
        <h2>Boutons</h2>
        <div className={styles.row}>
          <Button variant="primary">Publier une offre</Button>
          <Button variant="secondary">Annuler</Button>
          <Button variant="outline">Voir le profil</Button>
          <Button variant="danger">Supprimer</Button>
          <Button variant="ghost">Ignorer</Button>
          <Button variant="primary" loading>
            Envoi...
          </Button>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Champs &amp; chips</h2>
        <div className={styles.row}>
          <Input label="Titre de l'annonce" placeholder="Ex : Cours de soutien scolaire" />
          <Input label="Telephone" defaultValue="0102" errorText="Numero invalide" />
          <Chip as="button" selected={selectedFilter === 'menage'} onClick={() => setSelectedFilter('menage')}>
            🧹 Menage
          </Chip>
          <Chip as="button" selected={selectedFilter === 'plomberie'} onClick={() => setSelectedFilter('plomberie')}>
            🔧 Plomberie
          </Chip>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Badges</h2>
        <div className={styles.row}>
          <Badge tone="offre">Offre</Badge>
          <Badge tone="demande">Demande</Badge>
          <Badge tone="success">Disponible</Badge>
          <Badge tone="brand">En cours</Badge>
          <Badge tone="neutral">Terminee</Badge>
          <Badge tone="danger">Expiree</Badge>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Cartes de publication</h2>
        <div className={styles.cards}>
          <PublicationCard
            type="OFFER"
            title="Reparation fuite d'eau a domicile"
            categoryName="Plomberie"
            locationLabel="Abidjan, Cocody"
            createdAt={sampleCreatedAt.offer}
            amount={15000}
            authorInitials="KB"
            authorName="Kouassi B."
            status="AVAILABLE"
            favorite={favorite}
            onToggleFavorite={() => setFavorite((value) => !value)}
          />
          <PublicationCard
            type="REQUEST"
            title="Recherche aide menagere deux fois par semaine"
            categoryName="Menage"
            locationLabel="Abidjan, Marcory"
            createdAt={sampleCreatedAt.request}
            amount={40000}
            authorInitials="AT"
            authorName="Aya T."
            status="IN_PROGRESS"
          />
          <PublicationCardSkeleton />
        </div>
      </section>

      <section className={styles.section}>
        <h2>Etats vides &amp; toasts</h2>
        <div className={styles.row}>
          <EmptyState title="Aucun resultat" message="Essayez d'elargir votre recherche ou vos filtres." />
          <Button variant="secondary" onClick={() => showToast('Offre publiee avec succes', 'success')}>
            Declencher un toast succes
          </Button>
          <Button variant="secondary" onClick={() => showToast("Echec de l'envoi du message", 'error')}>
            Declencher un toast erreur
          </Button>
        </div>
      </section>
    </div>
  );
}
