import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../src/lib/core/rng';
import { newGame } from '../src/lib/core/newGame';
import { endDay } from '../src/lib/core/day';
import { clinicLevelDef } from '../src/lib/data/clinicLevels';
import { upgradeClinic } from '../src/lib/core/clinic';

describe('end-day pipeline', () => {
  it('advances the day, charges the fee, and resets the hour budget', () => {
    const rng = mulberry32(1);
    const state = newGame(rng);
    const moneyBefore = state.money;
    state.hoursRemaining = 2;
    endDay(state, rng);
    expect(state.day).toBe(2);
    expect(state.money).toBe(moneyBefore - clinicLevelDef(1).dailyFee);
    expect(state.hoursRemaining).toBe(clinicLevelDef(1).hoursPerDay);
    expect(state.patients.length).toBeGreaterThan(0);
  });

  it('carries negative hours into the next day', () => {
    const rng = mulberry32(2);
    const state = newGame(rng);
    state.hoursRemaining = -2;
    endDay(state, rng);
    expect(state.hoursRemaining).toBe(clinicLevelDef(1).hoursPerDay - 2);
  });

  it('daily fee is the only transaction that may take money negative', () => {
    const rng = mulberry32(3);
    const state = newGame(rng);
    state.money = 10;
    endDay(state, rng);
    expect(state.money).toBe(10 - clinicLevelDef(1).dailyFee);
    expect(state.money).toBeLessThan(0);
  });

  it('clinic upgrade hours apply from the next day, not retroactively', () => {
    const rng = mulberry32(4);
    const state = newGame(rng);
    state.money = 1_000_000;
    const hoursBefore = state.hoursRemaining;
    upgradeClinic(state);
    expect(state.clinicLevel).toBe(2);
    expect(state.hoursRemaining).toBe(hoursBefore);
    endDay(state, rng);
    expect(state.hoursRemaining).toBe(clinicLevelDef(2).hoursPerDay);
  });

  it('resets daily tallies', () => {
    const rng = mulberry32(5);
    const state = newGame(rng);
    state.todayIncome = 500;
    state.todayTreatments = 3;
    state.todayXp = 60;
    endDay(state, rng);
    expect(state.lastDaySummary?.income).toBe(500);
    expect(state.lastDaySummary?.treatments).toBe(3);
    expect(state.todayIncome).toBe(0);
    expect(state.todayTreatments).toBe(0);
    expect(state.todayXp).toBe(0);
  });
});
