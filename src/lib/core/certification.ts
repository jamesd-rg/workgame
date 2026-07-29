import type { GameState } from './types';
import { CERTIFICATIONS } from '../data/certification';
import { TREATMENTS_BY_ID } from '../data/treatments';
import { minClinicLevelForTier } from '../data/clinicLevels';
import { canAfford } from './economy';

export function certDefFor(treatmentId: string) {
  return CERTIFICATIONS[TREATMENTS_BY_ID[treatmentId].tier];
}

export function canStartCertification(state: GameState, treatmentId: string): string | null {
  const treatment = TREATMENTS_BY_ID[treatmentId];
  const cert = CERTIFICATIONS[treatment.tier];
  if (!cert) return 'Certification by fellowship only';
  if (state.skills[treatmentId] !== undefined) return 'Already certified';
  if (state.certsInProgress.some((c) => c.treatmentId === treatmentId)) return 'Already in progress';
  if (state.clinicLevel < minClinicLevelForTier(treatment.tier)) {
    return `Requires Clinic Level ${minClinicLevelForTier(treatment.tier)}`;
  }
  if (!canAfford(state.money, cert.fee)) return 'Not enough money';
  return null;
}

/** Pays the fee up front and opens an hour-by-hour progress track. */
export function startCertification(state: GameState, treatmentId: string): void {
  const blocked = canStartCertification(state, treatmentId);
  if (blocked) throw new Error(blocked);
  const cert = CERTIFICATIONS[TREATMENTS_BY_ID[treatmentId].tier]!;
  state.money -= cert.fee;
  state.certsInProgress.push({ treatmentId, hoursDone: 0, totalHours: cert.totalHours });
}

/** Commits one game hour of study; grants certification when hours complete. */
export function studyCertificationHour(state: GameState, treatmentId: string): void {
  const progress = state.certsInProgress.find((c) => c.treatmentId === treatmentId);
  if (!progress) throw new Error('No certification in progress');
  if (state.hoursRemaining < 1) throw new Error('Not enough hours today');
  state.hoursRemaining -= 1;
  progress.hoursDone += 1;
  if (progress.hoursDone >= progress.totalHours) {
    state.certsInProgress = state.certsInProgress.filter((c) => c.treatmentId !== treatmentId);
    state.skills[treatmentId] = { xp: 0 };
  }
}
