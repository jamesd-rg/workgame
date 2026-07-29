import type { CertificationDef, Tier } from '../core/types';

/** Tier 5 has no direct certification — fellowship only. */
export const CERTIFICATIONS: Partial<Record<Tier, CertificationDef>> = {
  1: { tier: 1, totalHours: 4, fee: 150 },
  2: { tier: 2, totalHours: 8, fee: 600 },
  3: { tier: 3, totalHours: 16, fee: 2500 },
  4: { tier: 4, totalHours: 32, fee: 9000 }
};
