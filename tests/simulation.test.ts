import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../src/lib/core/rng';
import { newGame } from '../src/lib/core/newGame';
import { resolveTreatment, commitTreatment } from '../src/lib/core/treatment';
import { train, canTrain } from '../src/lib/core/training';
import { startCertification, studyCertificationHour, canStartCertification } from '../src/lib/core/certification';
import { upgradeClinic, canUpgradeClinic, hasWon } from '../src/lib/core/clinic';
import { startFellowship, canStartFellowship } from '../src/lib/core/fellowship';
import { endDay } from '../src/lib/core/day';
import { TREATMENTS } from '../src/lib/data/treatments';
import type { GameState } from '../src/lib/core/types';
import type { Rng } from '../src/lib/core/rng';

/**
 * A simple greedy bot: upgrade when affordable, certify the cheapest missing
 * treatment, study cert hours, treat the best patients, spend leftover hours
 * on free research. Not optimal play — a stability and progression floor.
 */
function playDay(state: GameState, rng: Rng): void {
  if (canUpgradeClinic(state) === null) upgradeClinic(state);

  for (const t of TREATMENTS) {
    if (canStartCertification(state, t.id) === null) {
      startCertification(state, t.id);
      break;
    }
  }

  if (!state.activeFellowship) {
    const tier5 = TREATMENTS.filter((t) => t.tier === 5);
    for (const t of tier5) {
      if (canStartFellowship(state, t.id) === null) {
        startFellowship(state, t.id);
        break;
      }
    }
  }

  // Study one in-progress cert with up to half of today's hours.
  const cert = state.certsInProgress[0];
  if (cert) {
    let budget = Math.floor(state.hoursRemaining / 2);
    while (budget > 0 && state.hoursRemaining >= 1 && state.certsInProgress.includes(cert)) {
      studyCertificationHour(state, cert.treatmentId);
      budget -= 1;
    }
  }

  // Treat the highest-price patients that fit the remaining hours.
  let progress = true;
  while (progress) {
    progress = false;
    const candidates = state.patients
      .filter((p) => !p.locked && p.hours <= state.hoursRemaining)
      .sort((a, b) => b.price - a.price);
    if (candidates.length > 0) {
      const res = resolveTreatment(state, candidates[0].id, rng);
      commitTreatment(state, res);
      progress = true;
    }
  }

  // Burn leftover whole hours on free research for the first certified skill.
  const skillId = Object.keys(state.skills)[0];
  while (state.hoursRemaining >= 1 && canTrain(state, skillId, 'research') === null) {
    train(state, skillId, 'research');
  }

  endDay(state, rng);
}

describe('greedy bot simulation', () => {
  it('survives 200 days without errors and grows the practice', () => {
    const rng = mulberry32(2026);
    const state = newGame(rng);
    for (let day = 0; day < 200; day++) playDay(state, rng);
    expect(state.day).toBe(201);
    expect(state.money).toBeGreaterThan(500);
    expect(state.clinicLevel).toBeGreaterThanOrEqual(3);
    expect(Object.keys(state.skills).length).toBeGreaterThan(2);
  });

  it('a longer run can reach the win condition', () => {
    const rng = mulberry32(7);
    const state = newGame(rng);
    let days = 0;
    while (!hasWon(state) && days < 600) {
      playDay(state, rng);
      days += 1;
    }
    expect(hasWon(state)).toBe(true);
  });
});
