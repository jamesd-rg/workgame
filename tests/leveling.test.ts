import { describe, expect, it } from 'vitest';
import { addXp, levelFromXp, xpForLevel, LEVEL_CAP, XP_CAP } from '../src/lib/core/leveling';

describe('leveling curve', () => {
  it('is a clean cubic: xp(L) = L^3', () => {
    expect(xpForLevel(0)).toBe(0);
    expect(xpForLevel(10)).toBe(1000);
    expect(xpForLevel(25)).toBe(15625);
    expect(xpForLevel(50)).toBe(125000);
    expect(xpForLevel(100)).toBe(1_000_000);
  });

  it('roundtrips level -> xp -> level for every level', () => {
    for (let level = 0; level <= LEVEL_CAP; level++) {
      expect(levelFromXp(xpForLevel(level))).toBe(level);
    }
  });

  it('handles boundary XP values', () => {
    expect(levelFromXp(0)).toBe(0);
    expect(levelFromXp(999)).toBe(9);
    expect(levelFromXp(1000)).toBe(10);
    expect(levelFromXp(15624)).toBe(24);
    expect(levelFromXp(15625)).toBe(25);
    expect(levelFromXp(XP_CAP)).toBe(100);
    expect(levelFromXp(XP_CAP * 10)).toBe(100);
  });

  it('caps XP accrual at 1,000,000', () => {
    expect(addXp(XP_CAP - 5, 100)).toBe(XP_CAP);
    expect(addXp(0, 50)).toBe(50);
  });
});
