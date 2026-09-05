const RELATIVE_UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ['year', 60 * 60 * 24 * 365],
  ['month', 60 * 60 * 24 * 30],
  ['week', 60 * 60 * 24 * 7],
  ['day', 60 * 60 * 24],
  ['hour', 60 * 60],
  ['minute', 60],
];

const relativeFormatter = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' });

export function formatRelativeDate(isoDate: string): string {
  const elapsedSeconds = (Date.parse(isoDate) - Date.now()) / 1000;
  for (const [unit, secondsInUnit] of RELATIVE_UNITS) {
    if (Math.abs(elapsedSeconds) >= secondsInUnit) {
      return relativeFormatter.format(Math.round(elapsedSeconds / secondsInUnit), unit);
    }
  }
  return relativeFormatter.format(Math.round(elapsedSeconds / 60), 'minute');
}

/** XOF (franc CFA) par defaut : marche cible actuelle de PrestaLink. */
export function formatCurrency(amount: number, currency = 'XOF'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
