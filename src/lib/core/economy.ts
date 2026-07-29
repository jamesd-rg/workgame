/** Income multiplier from skill: a level-100 master earns +75% on base price. */
export function skillIncomeMult(level: number): number {
  return 1 + 0.75 * (level / 100);
}

export function treatmentIncome(patientPrice: number, level: number, outcomeMult: number): number {
  return Math.round(patientPrice * skillIncomeMult(level) * outcomeMult);
}

/**
 * Purchases (training, cert fees, tuition, upgrades) may never take money negative;
 * only the daily fee is allowed to cross zero. Free actions are always allowed,
 * even in debt — they are the recovery path.
 */
export function canAfford(money: number, cost: number): boolean {
  return cost === 0 || money >= cost;
}
