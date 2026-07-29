export const LEVEL_CAP = 100;
export const XP_CAP = 1_000_000; // level 100 on the cubic curve

/** XP required to reach a given level: (level/100)^3 * 1e6 = level^3. */
export function xpForLevel(level: number): number {
  return Math.pow(Math.min(level, LEVEL_CAP), 3);
}

/** Level derived from XP; epsilon guards cbrt(1000) landing at 9.999... */
export function levelFromXp(xp: number): number {
  if (xp <= 0) return 0;
  return Math.min(LEVEL_CAP, Math.floor(Math.cbrt(xp) + 1e-9));
}

/** Adds XP, clamped to the cap. */
export function addXp(currentXp: number, gain: number): number {
  return Math.min(XP_CAP, currentXp + gain);
}

/** Fraction of progress from the current level to the next, for XP bars. */
export function levelProgress(xp: number): number {
  const level = levelFromXp(xp);
  if (level >= LEVEL_CAP) return 1;
  const floor = xpForLevel(level);
  const ceil = xpForLevel(level + 1);
  return (xp - floor) / (ceil - floor);
}
