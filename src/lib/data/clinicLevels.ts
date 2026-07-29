import type { ClinicLevelDef } from '../core/types';

export const CLINIC_MAX_LEVEL = 7;

export const CLINIC_LEVELS: ClinicLevelDef[] = [
  { level: 1, name: 'Single Chair Surgery', hoursPerDay: 6, dailyFee: 50, upgradeCost: 0 },
  { level: 2, name: 'Neighbourhood Practice', hoursPerDay: 7, dailyFee: 120, upgradeCost: 2500 },
  { level: 3, name: 'Modern Dental Clinic', hoursPerDay: 8, dailyFee: 250, upgradeCost: 8000 },
  { level: 4, name: 'Multi-Specialty Practice', hoursPerDay: 9, dailyFee: 500, upgradeCost: 25000 },
  { level: 5, name: 'Advanced Surgical Centre', hoursPerDay: 10, dailyFee: 900, upgradeCost: 70000 },
  { level: 6, name: 'Regional Dental Institute', hoursPerDay: 11, dailyFee: 1500, upgradeCost: 180000 },
  { level: 7, name: 'World-Class Dental Hospital', hoursPerDay: 12, dailyFee: 2500, upgradeCost: 450000 }
];

export function clinicLevelDef(level: number): ClinicLevelDef {
  return CLINIC_LEVELS[Math.max(1, Math.min(CLINIC_MAX_LEVEL, level)) - 1];
}

/** Minimum clinic level required to treat/certify/train a given tier. */
export function minClinicLevelForTier(tier: number): number {
  if (tier >= 5) return 5;
  if (tier === 4) return 3;
  return 1;
}
