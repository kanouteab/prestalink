import { Link } from 'react-router-dom';
import shared from './shared.module.css';

export function NotFoundPage() {
  return (
    <div className={shared.narrow}>
      <header className={shared.pageHeader}>
        <h1>Page introuvable</h1>
        <p>Cette page n'existe pas ou a ete deplacee.</p>
      </header>
      <Link to="/">Retour a l'accueil</Link>
    </div>
  );
}
