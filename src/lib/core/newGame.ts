import type { GameState } from './types';
import type { Rng } from './rng';
import { clinicLevelDef } from '../data/clinicLevels';
import { generateDailyPatients } from './patients';

export const STARTING_MONEY = 500;
export const STARTING_TREATMENTS = ['scalePolish', 'filling'];

export function newGame(rng: Rng): GameState {
  const state: GameState = {
    day: 1,
    hoursRemaining: clinicLevelDef(1).hoursPerDay,
    money: STARTING_MONEY,
    clinicLevel: 1,
    skills: Object.fromEntries(STARTING_TREATMENTS.map((id) => [id, { xp: 0 }])),
    certsInProgress: [],
    activeFellowship: null,
    completedFellowships: [],
    patients: [],
    patientCounter: 0,
    lastDaySummary: null,
    todayIncome: 0,
    todayTreatments: 0,
    todayXp: 0,
    winShown: false,
    stats: {
      totalEarned: 0,
      totalTreated: 0,
      outcomeCounts: { excellent: 0, good: 0, standard: 0, poor: 0, bad: 0 }
    }
  };
  generateDailyPatients(state, rng);
  return state;
}
