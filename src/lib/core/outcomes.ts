import type { OutcomeKind } from './types';
import type { Rng } from './rng';

export const RED_GONE_LEVEL = 10;
export const ORANGE_GONE_LEVEL = 25;

/**
 * Outcome weights in percent as a function of skill level L (0-100).
 * Red (bad) ramps to 0 at L=10; orange (poor) ramps to 0 between L=10 and 25.
 * Excellent and good grow linearly; standard absorbs the residual.
 * Sums to exactly 100 at every level.
 */
export function outcomeWeights(level: number): Record<OutcomeKind, number> {
  const L = Math.max(0, Math.min(100, level));
  const bad = L >= RED_GONE_LEVEL ? 0 : 15 * (1 - L / RED_GONE_LEVEL);
  const poor =
    L >= ORANGE_GONE_LEVEL
      ? 0
      : L < RED_GONE_LEVEL
        ? 25
        : 25 * (1 - (L - RED_GONE_LEVEL) / (ORANGE_GONE_LEVEL - RED_GONE_LEVEL));
  const excellent = 5 + 20 * (L / 100);
  const good = 15 + 25 * (L / 100);
  const standard = 100 - bad - poor - excellent - good;
  return { excellent, good, standard, poor, bad };
}

/** Display order of segments on the RNG bar, left to right. */
export const BAR_ORDER: OutcomeKind[] = ['excellent', 'good', 'standard', 'poor', 'bad'];

export interface OutcomeRoll {
  outcome: OutcomeKind;
  /** Position 0..1 along the bar, inside the winning segment. */
  landingFraction: number;
  weights: Record<OutcomeKind, number>;
}

/** Rolls an outcome and an honest landing position within its rendered segment. */
export function rollOutcome(level: number, rng: Rng): OutcomeRoll {
  const weights = outcomeWeights(level);
  const roll = rng.next() * 100;
  let cursor = 0;
  let outcome: OutcomeKind = BAR_ORDER[BAR_ORDER.length - 1];
  let segStart = 0;
  for (const kind of BAR_ORDER) {
    if (roll < cursor + weights[kind]) {
      outcome = kind;
      segStart = cursor;
      break;
    }
    cursor += weights[kind];
  }
  // Land at a uniform random point inside the winning segment, padded 10% from edges.
  const w = weights[outcome];
  const landingFraction = (segStart + w * (0.1 + 0.8 * rng.next())) / 100;
  return { outcome, landingFraction, weights };
}
