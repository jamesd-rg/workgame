import type { GameState, TrainingKind } from './types';
import { addXp } from './leveling';
import { TRAINING_BY_KIND, trainingCost } from '../data/training';
import { TREATMENTS_BY_ID } from '../data/treatments';
import { canAfford } from './economy';

export function trainingCostFor(treatmentId: string, kind: TrainingKind): number {
  return trainingCost(kind, TREATMENTS_BY_ID[treatmentId].tier);
}

export function canTrain(state: GameState, treatmentId: string, kind: TrainingKind): string | null {
  const def = TRAINING_BY_KIND[kind];
  if (state.skills[treatmentId] === undefined) return 'Not certified';
  if (state.hoursRemaining < def.hours) return 'Not enough hours today';
  if (!canAfford(state.money, trainingCostFor(treatmentId, kind))) return 'Not enough money';
  return null;
}

export function train(state: GameState, treatmentId: string, kind: TrainingKind): void {
  const blocked = canTrain(state, treatmentId, kind);
  if (blocked) throw new Error(blocked);
  const def = TRAINING_BY_KIND[kind];
  state.hoursRemaining -= def.hours;
  state.money -= trainingCostFor(treatmentId, kind);
  state.skills[treatmentId].xp = addXp(state.skills[treatmentId].xp, def.xp);
  state.todayXp += def.xp;
}
