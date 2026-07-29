import type { FellowshipDef } from '../core/types';

/**
 * One fellowship definition per eligible tier; the player picks which treatment
 * in that tier it targets when starting.
 */
export const FELLOWSHIPS: FellowshipDef[] = [
  { id: 'fellowT3', tier: 3, name: 'Oral Surgery Fellowship', hoursPerDay: 4, days: 5, tuition: 4000, grantsSkillLevel: 25 },
  { id: 'fellowT4', tier: 4, name: 'Restorative Fellowship', hoursPerDay: 5, days: 8, tuition: 15000, grantsSkillLevel: 10 },
  { id: 'fellowT5', tier: 5, name: 'Maxillofacial Fellowship', hoursPerDay: 6, days: 12, tuition: 50000, grantsSkillLevel: 0 }
];

export const FELLOWSHIPS_BY_ID: Record<string, FellowshipDef> = Object.fromEntries(
  FELLOWSHIPS.map((f) => [f.id, f])
);

export const FELLOWSHIPS_BY_TIER: Record<number, FellowshipDef> = Object.fromEntries(
  FELLOWSHIPS.map((f) => [f.tier, f])
);
