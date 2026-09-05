import shared from '../shared.module.css';

export function ContactPage() {
  return (
    <div className={shared.narrow}>
      <header className={shared.pageHeader}>
        <h1>Contact</h1>
        <p>Une question, un signalement, un partenariat ? Ecrivez-nous.</p>
      </header>
      <p>
        Support : <a href="mailto:contact@prestalink.example">contact@prestalink.example</a>
      </p>
      <p>Nous repondons generalement sous 48h ouvrees.</p>
    </div>
  );
}
