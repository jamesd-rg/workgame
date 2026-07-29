import type { CertificationDef, Tier } from '../core/types';

/** Tier 5 has no direct certification — fellowship only. */
export const CERTIFICATIONS: Partial<Record<Tier, CertificationDef>> = {
  1: { tier: 1, totalHours: 5, fee: 250 },
  2: { tier: 2, totalHours: 10, fee: 1000 },
  3: { tier: 3, totalHours: 20, fee: 4200 },
  4: { tier: 4, totalHours: 36, fee: 15000 }
};
