import type { GameState, Patient, SeverityDef, TreatmentDef } from './types';
import { pickWeighted, randInt, type Rng } from './rng';
import { TREATMENTS, TREATMENTS_BY_ID } from '../data/treatments';
import {
  CONDITIONS_BY_ID,
  CONDITIONS_BY_TREATMENT,
  PATIENT_FIRST_NAMES,
  PATIENT_LAST_NAMES,
  SEVERITIES
} from '../data/conditions';
import { minClinicLevelForTier } from '../data/clinicLevels';
import { OCCUPATIONS, QUIRKS } from '../data/flavour';

/** Treatments the player can actually perform right now. */
export function treatableTreatments(state: GameState): TreatmentDef[] {
  return TREATMENTS.filter(
    (t) => state.skills[t.id] !== undefined && state.clinicLevel >= minClinicLevelForTier(t.tier)
  );
}

function rollSeverity(rng: Rng): SeverityDef {
  return pickWeighted(rng, SEVERITIES.map((s) => [s, s.weight]));
}

function makePatient(
  state: GameState,
  rng: Rng,
  treatment: TreatmentDef,
  locked: boolean,
  lockReason?: string
): Patient {
  const severity = rollSeverity(rng);
  const condition = CONDITIONS_BY_TREATMENT[treatment.id];
  state.patientCounter += 1;
  return {
    id: `p${state.day}-${state.patientCounter}`,
    name: `${PATIENT_FIRST_NAMES[randInt(rng, 0, PATIENT_FIRST_NAMES.length - 1)]} ${
      PATIENT_LAST_NAMES[randInt(rng, 0, PATIENT_LAST_NAMES.length - 1)]
    }`,
    conditionId: condition.id,
    severity: severity.severity,
    price: Math.round(treatment.basePrice * severity.priceMult),
    hours: treatment.baseHours + severity.extraHours,
    locked,
    lockReason,
    age: randInt(rng, 18, 90),
    occupation: OCCUPATIONS[randInt(rng, 0, OCCUPATIONS.length - 1)],
    quirk: QUIRKS[randInt(rng, 0, QUIRKS.length - 1)],
    heightCm: randInt(rng, 145, 200),
    weightKg: randInt(rng, 45, 130),
    bloodPressure: `${randInt(rng, 95, 160)}/${randInt(rng, 60, 100)}`,
    restingPulse: randInt(rng, 55, 95)
  };
}

/**
 * Replaces the day's patient list: 4 + clinicLevel treatable patients weighted
 * toward the highest certified tier, plus up to 2 locked "referral" teasers
 * from the next tier the player is not yet certified in.
 */
export function generateDailyPatients(state: GameState, rng: Rng): void {
  const treatable = treatableTreatments(state);
  const patients: Patient[] = [];

  if (treatable.length > 0) {
    const tiers = [...new Set(treatable.map((t) => t.tier))].sort((a, b) => b - a);
    const tierWeights: Array<[number, number]> = tiers.map((tier, i) => {
      if (i === 0) return [tier, 50];
      if (i === 1) return [tier, 30];
      return [tier, 20 / (tiers.length - 2)];
    });
    const count = 4 + state.clinicLevel;
    for (let i = 0; i < count; i++) {
      const tier = pickWeighted(rng, tierWeights);
      const options = treatable.filter((t) => t.tier === tier);
      const treatment = options[randInt(rng, 0, options.length - 1)];
      patients.push(makePatient(state, rng, treatment, false));
    }
  }

  // Locked referrals from the two lowest tiers with uncertified treatments —
  // the educational carrot showing what the next certifications are worth.
  const uncertified = TREATMENTS.filter((t) => state.skills[t.id] === undefined);
  if (uncertified.length > 0) {
    const teaseTiers = [...new Set(uncertified.map((t) => t.tier))].sort((a, b) => a - b).slice(0, 2);
    const options = uncertified.filter((t) => teaseTiers.includes(t.tier));
    const referralCount = options.length === 1 ? randInt(rng, 1, 2) : randInt(rng, 2, 3);
    for (let i = 0; i < referralCount; i++) {
      const treatment = options[randInt(rng, 0, options.length - 1)];
      const clinicGate = minClinicLevelForTier(treatment.tier);
      const lockReason =
        state.clinicLevel < clinicGate
          ? `Requires Clinic Level ${clinicGate}`
          : `Requires ${treatment.name} certification`;
      patients.push(makePatient(state, rng, treatment, true, lockReason));
    }
  }

  state.patients = patients;
}

export function patientTreatment(patient: Patient): TreatmentDef {
  return TREATMENTS_BY_ID[CONDITIONS_BY_ID[patient.conditionId].treatmentId];
}
