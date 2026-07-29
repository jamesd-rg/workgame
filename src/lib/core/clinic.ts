import type { GameState } from './types';
import { CLINIC_MAX_LEVEL, clinicLevelDef } from '../data/clinicLevels';
import { canAfford } from './economy';

export function canUpgradeClinic(state: GameState): string | null {
  if (state.clinicLevel >= CLINIC_MAX_LEVEL) return 'Clinic is at maximum level';
  const next = clinicLevelDef(state.clinicLevel + 1);
  if (!canAfford(state.money, next.upgradeCost)) return 'Not enough money';
  return null;
}

/** The extra hour takes effect from the next day, not retroactively today. */
export function upgradeClinic(state: GameState): void {
  const blocked = canUpgradeClinic(state);
  if (blocked) throw new Error(blocked);
  const next = clinicLevelDef(state.clinicLevel + 1);
  state.money -= next.upgradeCost;
  state.clinicLevel = next.level;
}

export function hasWon(state: GameState): boolean {
  return state.clinicLevel >= CLINIC_MAX_LEVEL;
}
