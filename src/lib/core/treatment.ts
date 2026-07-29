import type { GameState, TreatmentResolution } from './types';
import type { Rng } from './rng';
import { levelFromXp, addXp } from './leveling';
import { rollOutcome } from './outcomes';
import { treatmentIncome } from './economy';
import { patientTreatment } from './patients';
import { minClinicLevelForTier } from '../data/clinicLevels';
import { OUTCOME_CONFIGS } from '../data/outcomes';

/**
 * Phase 1: rolls the outcome and computes every effect up front, without
 * touching state. The UI animates the result, then calls commitTreatment.
 */
export function resolveTreatment(state: GameState, patientId: string, rng: Rng): TreatmentResolution {
  const patient = state.patients.find((p) => p.id === patientId);
  if (!patient) throw new Error(`No such patient: ${patientId}`);
  if (patient.locked) throw new Error('Patient requires certification or clinic upgrade');
  if (patient.referred) throw new Error('Patient was referred elsewhere');
  const treatment = patientTreatment(patient);
  const skill = state.skills[treatment.id];
  if (!skill) throw new Error(`Not certified for ${treatment.name}`);
  if (state.clinicLevel < minClinicLevelForTier(treatment.tier)) {
    throw new Error(`Clinic level too low for tier ${treatment.tier}`);
  }
  if (state.hoursRemaining < patient.hours) throw new Error('Not enough hours left today');

  const level = levelFromXp(skill.xp);
  const roll = rollOutcome(level, rng);
  const config = OUTCOME_CONFIGS[roll.outcome];

  let incomeMult = config.incomeMult;
  let hoursDelta = config.hoursDelta;
  let goodEffect: 'income' | 'time' | undefined;
  if (roll.outcome === 'good' || roll.outcome === 'poor') {
    goodEffect = rng.next() < 0.5 ? 'income' : 'time';
    if (goodEffect === 'income') hoursDelta = 0;
    else incomeMult = 1;
  }

  const baseIncome = treatmentIncome(patient.price, level, 1);
  const income = treatmentIncome(patient.price, level, incomeMult);
  const hoursSpent = Math.max(1, patient.hours + hoursDelta);
  const xp = treatment.xpReward * (roll.outcome === 'bad' ? 2 : 1);

  return {
    patientId,
    treatmentId: treatment.id,
    outcome: roll.outcome,
    goodEffect,
    income,
    baseIncome,
    skillLevel: level,
    hoursSpent,
    baseHours: patient.hours,
    xp,
    landingFraction: roll.landingFraction,
    weights: roll.weights
  };
}

/** Phase 2: applies a resolution to state. Hours may go negative (carry-over). */
export function commitTreatment(state: GameState, res: TreatmentResolution): void {
  const idx = state.patients.findIndex((p) => p.id === res.patientId);
  if (idx === -1) throw new Error(`Patient already treated: ${res.patientId}`);
  state.patients.splice(idx, 1);
  state.money += res.income;
  state.hoursRemaining -= res.hoursSpent;
  state.skills[res.treatmentId].xp = addXp(state.skills[res.treatmentId].xp, res.xp);
  state.todayIncome += res.income;
  state.todayTreatments += 1;
  state.todayXp += res.xp;
  state.stats.totalEarned += res.income;
  state.stats.totalTreated += 1;
  state.stats.outcomeCounts[res.outcome] += 1;
}
