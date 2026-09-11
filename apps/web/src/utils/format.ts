import { getLocale } from '../i18n/localeStore.js';

const RELATIVE_UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ['year', 60 * 60 * 24 * 365],
  ['month', 60 * 60 * 24 * 30],
  ['week', 60 * 60 * 24 * 7],
  ['day', 60 * 60 * 24],
  ['hour', 60 * 60],
  ['minute', 60],
];

/** Intl accepte le meme code que nos cles de locale ('fr'/'en') : pas de table de correspondance a maintenir. */
export function formatRelativeDate(isoDate: string): string {
  const relativeFormatter = new Intl.RelativeTimeFormat(getLocale(), { numeric: 'auto' });
  const elapsedSeconds = (Date.parse(isoDate) - Date.now()) / 1000;
  for (const [unit, secondsInUnit] of RELATIVE_UNITS) {
    if (Math.abs(elapsedSeconds) >= secondsInUnit) {
      return relativeFormatter.format(Math.round(elapsedSeconds / secondsInUnit), unit);
    }
  }
  return relativeFormatter.format(Math.round(elapsedSeconds / 60), 'minute');
}

/** XOF (franc CFA) par defaut : marche cible actuelle de PrestaLink, quelle que soit la langue d'interface. */
export function formatCurrency(amount: number, currency = 'XOF'): string {
  const locale = getLocale() === 'en' ? 'en-US' : 'fr-FR';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function initials(fullName: string): string {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}
