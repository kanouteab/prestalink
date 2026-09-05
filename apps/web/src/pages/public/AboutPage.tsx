import shared from '../shared.module.css';

export function AboutPage() {
  return (
    <div className={shared.narrow}>
      <header className={shared.pageHeader}>
        <h1>A propos de PrestaLink</h1>
        <p>Une marketplace locale qui met en relation clients et prestataires de services.</p>
      </header>
      <p>
        PrestaLink permet de publier des offres de service ou des demandes, de parcourir celles de la communaute, de les
        mettre en favori et d'echanger avec l'autre partie pour convenir d'une mission.
      </p>
    </div>
  );
}
