import type { Tier, TrainingDef, TrainingKind } from '../core/types';

export const TRAINING: TrainingDef[] = [
  { kind: 'research', name: 'Research', hours: 1, baseCost: 0, xp: 25 },
  { kind: 'video', name: 'Video Lesson', hours: 1, baseCost: 30, xp: 60 },
  { kind: 'halfDay', name: 'Half-Day Course', hours: 4, baseCost: 150, xp: 340 },
  { kind: 'fullDay', name: 'Full-Day Course', hours: 8, baseCost: 400, xp: 800 }
];

export const TRAINING_BY_KIND: Record<TrainingKind, TrainingDef> = Object.fromEntries(
  TRAINING.map((t) => [t.kind, t])
) as Record<TrainingKind, TrainingDef>;

/** Training money cost scales with the treatment's tier. */
export const TRAINING_TIER_COST_MULT: Record<Tier, number> = {
  1: 1,
  2: 2.5,
  3: 6,
  4: 14,
  5: 30
};

export function trainingCost(kind: TrainingKind, tier: Tier): number {
  return Math.round(TRAINING_BY_KIND[kind].baseCost * TRAINING_TIER_COST_MULT[tier]);
}
