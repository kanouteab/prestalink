/** Affiche pendant le chargement du chunk d'une page (livrable 25 : le bundle est decoupe par route). */
export function PageFallback() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', color: 'var(--color-ink500)', fontSize: 14 }}>
      Chargement...
    </div>
  );
}
