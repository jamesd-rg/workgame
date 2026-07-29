import type { GameState } from './types';
import { FELLOWSHIPS_BY_ID, FELLOWSHIPS_BY_TIER } from '../data/fellowships';
import { TREATMENTS_BY_ID } from '../data/treatments';
import { clinicLevelDef, minClinicLevelForTier } from '../data/clinicLevels';
import { xpForLevel } from './leveling';
import { canAfford } from './economy';

export function fellowshipDefForTreatment(treatmentId: string) {
  return FELLOWSHIPS_BY_TIER[TREATMENTS_BY_ID[treatmentId].tier];
}

export function canStartFellowship(state: GameState, treatmentId: string): string | null {
  const treatment = TREATMENTS_BY_ID[treatmentId];
  const def = FELLOWSHIPS_BY_TIER[treatment.tier];
  if (!def) return 'No fellowship for this tier';
  if (state.activeFellowship) return 'A fellowship is already in progress';
  if (state.skills[treatmentId] !== undefined) return 'Already certified';
  if (state.clinicLevel < minClinicLevelForTier(treatment.tier)) {
    return `Requires Clinic Level ${minClinicLevelForTier(treatment.tier)}`;
  }
  // The daily commitment must always leave at least 2 working hours free.
  if (def.hoursPerDay + 2 > clinicLevelDef(state.clinicLevel).hoursPerDay) {
    return 'Clinic hours too short for the daily commitment';
  }
  if (!canAfford(state.money, def.tuition)) return 'Not enough money';
  return null;
}

/** Tuition up front; daily hours are auto-committed by the end-day pipeline. */
export function startFellowship(state: GameState, treatmentId: string): void {
  const blocked = canStartFellowship(state, treatmentId);
  if (blocked) throw new Error(blocked);
  const def = fellowshipDefForTreatment(treatmentId)!;
  state.money -= def.tuition;
  state.activeFellowship = { defId: def.id, treatmentId, daysDone: 0 };
}

/**
 * Called from the end-day pipeline. Returns true if the fellowship completed,
 * granting certification at the tier's starting level.
 */
export function advanceFellowship(state: GameState): boolean {
  const active = state.activeFellowship;
  if (!active) return false;
  const def = FELLOWSHIPS_BY_ID[active.defId];
  active.daysDone += 1;
  if (active.daysDone >= def.days) {
    state.skills[active.treatmentId] = { xp: xpForLevel(def.grantsSkillLevel) };
    state.completedFellowships.push(def.id);
    state.activeFellowship = null;
    return true;
  }
  return false;
}
