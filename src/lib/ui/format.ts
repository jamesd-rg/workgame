const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});

export function fmtMoney(amount: number): string {
  return currency.format(amount);
}

export function fmtHours(hours: number): string {
  return `${hours}h`;
}

export function fmtSigned(amount: number): string {
  return amount >= 0 ? `+${fmtMoney(amount)}` : `−${fmtMoney(-amount)}`;
}

/** Clinic day starts at 8 AM; each spent hour advances the clock. Flavour only. */
export function timeOfDay(hoursIntoDay: number): string {
  const hour24 = (8 + Math.max(0, hoursIntoDay)) % 24;
  const suffix = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:00 ${suffix}`;
}

export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
