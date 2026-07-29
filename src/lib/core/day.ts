import type { GameState } from './types';
import type { Rng } from './rng';
import { clinicLevelDef } from '../data/clinicLevels';
import { FELLOWSHIPS_BY_ID } from '../data/fellowships';
import { advanceFellowship } from './fellowship';
import { generateDailyPatients } from './patients';

/**
 * End-day pipeline: summary -> day+1 -> daily fee (only transaction allowed to
 * go negative) -> fellowship day tick -> new hour budget (negative hours carry
 * over; fellowship hours auto-committed) -> fresh patient list.
 */
export function endDay(state: GameState, rng: Rng): void {
  const fee = clinicLevelDef(state.clinicLevel).dailyFee;
  const fellowshipBefore = state.activeFellowship;

  state.lastDaySummary = {
    day: state.day,
    income: state.todayIncome,
    fee,
    treatments: state.todayTreatments,
    xpGained: state.todayXp,
    fellowshipDay: fellowshipBefore
      ? `${FELLOWSHIPS_BY_ID[fellowshipBefore.defId].name}: day ${fellowshipBefore.daysDone + 1}/${
          FELLOWSHIPS_BY_ID[fellowshipBefore.defId].days
        }`
      : null
  };

  state.day += 1;
  state.money -= fee;
  advanceFellowship(state);

  const carryOver = Math.min(0, state.hoursRemaining);
  const fellowshipHours = state.activeFellowship
    ? FELLOWSHIPS_BY_ID[state.activeFellowship.defId].hoursPerDay
    : 0;
  state.hoursRemaining =
    clinicLevelDef(state.clinicLevel).hoursPerDay + carryOver - fellowshipHours;

  state.todayIncome = 0;
  state.todayTreatments = 0;
  state.todayXp = 0;

  generateDailyPatients(state, rng);
}
