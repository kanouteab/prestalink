export interface ServiceCategory {
  id: number;
  name: string;
  /** Chaine libre cote backend (pas de convention imposee aujourd'hui). */
  icon: string;
  description?: string;
}
