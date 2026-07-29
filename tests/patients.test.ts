import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../src/lib/core/rng';
import { newGame } from '../src/lib/core/newGame';
import { generateDailyPatients, patientTreatment, treatableTreatments } from '../src/lib/core/patients';

describe('patient generation', () => {
  it('generates 4 + clinicLevel treatable patients plus 2-3 locked referrals', () => {
    const rng = mulberry32(11);
    const state = newGame(rng);
    const open = state.patients.filter((p) => !p.locked);
    const locked = state.patients.filter((p) => p.locked);
    expect(open.length).toBe(5);
    expect(locked.length).toBeGreaterThanOrEqual(2);
    expect(locked.length).toBeLessThanOrEqual(3);
    // Majority must remain treatable.
    expect(open.length).toBeGreaterThan(locked.length);
  });

  it('only offers treatable patients for certified treatments', () => {
    const rng = mulberry32(12);
    const state = newGame(rng);
    const treatableIds = new Set(treatableTreatments(state).map((t) => t.id));
    for (const patient of state.patients.filter((p) => !p.locked)) {
      expect(treatableIds.has(patientTreatment(patient).id)).toBe(true);
    }
  });

  it('locked referrals come from the two lowest uncertified tiers with a reason', () => {
    const rng = mulberry32(13);
    const state = newGame(rng);
    const locked = state.patients.filter((p) => p.locked);
    expect(locked.length).toBeGreaterThan(0);
    for (const patient of locked) {
      const treatment = patientTreatment(patient);
      // Starting certs are scalePolish + filling; teasers are uncertified tier 1-2.
      expect(state.skills[treatment.id]).toBeUndefined();
      expect(treatment.tier).toBeLessThanOrEqual(2);
      expect(patient.lockReason).toBeTruthy();
    }
  });

  it('gives every patient generated flavour details and physical stats', () => {
    const state = newGame(mulberry32(16));
    for (const patient of state.patients) {
      expect(patient.age).toBeGreaterThanOrEqual(18);
      expect(patient.age).toBeLessThanOrEqual(90);
      expect(patient.occupation).toBeTruthy();
      expect(patient.quirk).toBeTruthy();
      expect(patient.heightCm).toBeGreaterThanOrEqual(145);
      expect(patient.heightCm).toBeLessThanOrEqual(200);
      expect(patient.weightKg).toBeGreaterThanOrEqual(45);
      expect(patient.weightKg).toBeLessThanOrEqual(130);
      expect(patient.bloodPressure).toMatch(/^\d+\/\d+$/);
      expect(patient.restingPulse).toBeGreaterThanOrEqual(55);
      expect(patient.restingPulse).toBeLessThanOrEqual(95);
    }
  });

  it('is deterministic under a fixed seed', () => {
    const a = newGame(mulberry32(99));
    const b = newGame(mulberry32(99));
    expect(a.patients).toEqual(b.patients);
  });

  it('precomputes severity-adjusted price and hours', () => {
    const rng = mulberry32(14);
    const state = newGame(rng);
    for (const patient of state.patients) {
      const treatment = patientTreatment(patient);
      expect(patient.price).toBeGreaterThanOrEqual(treatment.basePrice);
      expect(patient.hours).toBeGreaterThanOrEqual(treatment.baseHours);
    }
  });

  it('regenerating replaces the list', () => {
    const rng = mulberry32(15);
    const state = newGame(rng);
    const firstIds = state.patients.map((p) => p.id);
    generateDailyPatients(state, rng);
    for (const p of state.patients) expect(firstIds).not.toContain(p.id);
  });
});
