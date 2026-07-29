import { describe, expect, it } from 'vitest';
import { canAfford, skillIncomeMult, treatmentIncome } from '../src/lib/core/economy';

describe('economy', () => {
  it('skill income multiplier scales +75% at level 100', () => {
    expect(skillIncomeMult(0)).toBe(1);
    expect(skillIncomeMult(30)).toBeCloseTo(1.225);
    expect(skillIncomeMult(100)).toBeCloseTo(1.75);
  });

  it('computes treatment income with skill and outcome multipliers', () => {
    expect(treatmentIncome(100, 0, 1)).toBe(100);
    expect(treatmentIncome(100, 100, 1)).toBe(175);
    expect(treatmentIncome(100, 0, 1.25)).toBe(125);
    expect(treatmentIncome(100, 0, 0.75)).toBe(75);
  });

  it('affordability guard blocks negative-balance purchases but allows free actions', () => {
    expect(canAfford(100, 100)).toBe(true);
    expect(canAfford(99, 100)).toBe(false);
    expect(canAfford(-1, 0)).toBe(true);
  });
});
