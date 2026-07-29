import { describe, expect, it } from 'vitest';
import { outcomeWeights, rollOutcome, BAR_ORDER, RED_GONE_LEVEL, ORANGE_GONE_LEVEL } from '../src/lib/core/outcomes';
import { mulberry32 } from '../src/lib/core/rng';
import type { OutcomeKind } from '../src/lib/core/types';

describe('outcome weights', () => {
  it('sums to 100 at every level', () => {
    for (let L = 0; L <= 100; L++) {
      const w = outcomeWeights(L);
      const total = Object.values(w).reduce((a, b) => a + b, 0);
      expect(total).toBeCloseTo(100, 9);
    }
  });

  it('removes red at level 10 and orange at level 25', () => {
    for (let L = 0; L <= 100; L++) {
      const w = outcomeWeights(L);
      if (L >= RED_GONE_LEVEL) expect(w.bad).toBe(0);
      else expect(w.bad).toBeGreaterThan(0);
      if (L >= ORANGE_GONE_LEVEL) expect(w.poor).toBe(0);
      else expect(w.poor).toBeGreaterThan(0);
    }
  });

  it('excellent and good grow monotonically, standard stays positive', () => {
    let prev = outcomeWeights(0);
    for (let L = 1; L <= 100; L++) {
      const w = outcomeWeights(L);
      expect(w.excellent).toBeGreaterThanOrEqual(prev.excellent);
      expect(w.good).toBeGreaterThanOrEqual(prev.good);
      expect(w.standard).toBeGreaterThan(0);
      prev = w;
    }
  });
});

describe('rollOutcome', () => {
  it('lands the needle inside the winning segment', () => {
    const rng = mulberry32(42);
    for (let i = 0; i < 1000; i++) {
      const level = Math.floor(rng.next() * 101);
      const { outcome, landingFraction, weights } = rollOutcome(level, rng);
      let start = 0;
      for (const kind of BAR_ORDER) {
        if (kind === outcome) break;
        start += weights[kind];
      }
      const end = start + weights[outcome];
      expect(landingFraction * 100).toBeGreaterThanOrEqual(start);
      expect(landingFraction * 100).toBeLessThanOrEqual(end);
    }
  });

  it('roll distribution roughly matches the weights (seeded, 20k rolls)', () => {
    const rng = mulberry32(1234);
    const level = 5;
    const weights = outcomeWeights(level);
    const counts: Record<OutcomeKind, number> = { excellent: 0, good: 0, standard: 0, poor: 0, bad: 0 };
    const N = 20000;
    for (let i = 0; i < N; i++) counts[rollOutcome(level, rng).outcome] += 1;
    for (const kind of BAR_ORDER) {
      const observed = (counts[kind] / N) * 100;
      expect(Math.abs(observed - weights[kind])).toBeLessThan(1.5);
    }
  });

  it('never rolls removed outcomes at high skill', () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 5000; i++) {
      const { outcome } = rollOutcome(30, rng);
      expect(outcome).not.toBe('bad');
      expect(outcome).not.toBe('poor');
    }
  });
});
