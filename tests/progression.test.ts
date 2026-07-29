import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../src/lib/core/rng';
import { newGame } from '../src/lib/core/newGame';
import { startCertification, studyCertificationHour, canStartCertification } from '../src/lib/core/certification';
import { startFellowship, advanceFellowship, canStartFellowship } from '../src/lib/core/fellowship';
import { train } from '../src/lib/core/training';
import { resolveTreatment, commitTreatment } from '../src/lib/core/treatment';
import { upgradeClinic, hasWon } from '../src/lib/core/clinic';
import { levelFromXp } from '../src/lib/core/leveling';
import { endDay } from '../src/lib/core/day';
import { FELLOWSHIPS_BY_TIER } from '../src/lib/data/fellowships';
import { CERTIFICATIONS } from '../src/lib/data/certification';
import { TREATMENTS_BY_ID } from '../src/lib/data/treatments';

describe('certification', () => {
  it('completes hour by hour and starts the skill at 0 XP', () => {
    const rng = mulberry32(21);
    const state = newGame(rng);
    state.money = 10000;
    state.hoursRemaining = 100;
    startCertification(state, 'bonding');
    const cert = CERTIFICATIONS[1]!;
    expect(state.money).toBe(10000 - cert.fee);
    for (let i = 0; i < cert.totalHours; i++) {
      expect(state.skills['bonding']).toBeUndefined();
      studyCertificationHour(state, 'bonding');
    }
    expect(state.skills['bonding']).toEqual({ xp: 0 });
    expect(state.certsInProgress).toHaveLength(0);
  });

  it('tier 5 cannot be certified directly', () => {
    const state = newGame(mulberry32(22));
    state.money = 1_000_000;
    state.clinicLevel = 7;
    expect(canStartCertification(state, 'allOn4')).toBe('Certification by fellowship only');
  });

  it('tier 4 requires clinic level 3', () => {
    const state = newGame(mulberry32(23));
    state.money = 1_000_000;
    expect(canStartCertification(state, 'implant')).toContain('Clinic Level 3');
    state.clinicLevel = 3;
    expect(canStartCertification(state, 'implant')).toBeNull();
  });
});

describe('fellowships', () => {
  it('grants certification at the tier starting level on completion', () => {
    const rng = mulberry32(31);
    const state = newGame(rng);
    state.money = 1_000_000;
    state.clinicLevel = 5;
    startFellowship(state, 'rootCanal');
    const def = FELLOWSHIPS_BY_TIER[3];
    for (let day = 0; day < def.days - 1; day++) {
      expect(advanceFellowship(state)).toBe(false);
    }
    expect(advanceFellowship(state)).toBe(true);
    expect(levelFromXp(state.skills['rootCanal'].xp)).toBe(25);
    expect(state.activeFellowship).toBeNull();
    expect(state.completedFellowships).toContain(def.id);
  });

  it('auto-commits daily hours through the end-day pipeline', () => {
    const rng = mulberry32(32);
    const state = newGame(rng);
    state.money = 1_000_000;
    state.clinicLevel = 5;
    startFellowship(state, 'tmjSurgery');
    const def = FELLOWSHIPS_BY_TIER[5];
    endDay(state, rng);
    expect(state.hoursRemaining).toBe(10 - def.hoursPerDay); // clinic 5 = 10h
    expect(state.activeFellowship?.daysDone).toBe(1);
  });

  it('only one fellowship at a time; tier 5 gated behind clinic 5', () => {
    const state = newGame(mulberry32(33));
    state.money = 1_000_000;
    expect(canStartFellowship(state, 'allOn4')).toContain('Clinic Level 5');
    state.clinicLevel = 5;
    startFellowship(state, 'allOn4');
    expect(canStartFellowship(state, 'tmjSurgery')).toBe('A fellowship is already in progress');
  });
});

describe('treatment flow', () => {
  it('resolve + commit pays income, spends hours, grants XP, removes patient', () => {
    const rng = mulberry32(41);
    const state = newGame(rng);
    const patient = state.patients.find((p) => !p.locked)!;
    const before = { money: state.money, hours: state.hoursRemaining };
    const res = resolveTreatment(state, patient.id, rng);
    // Nothing changed until commit.
    expect(state.money).toBe(before.money);
    commitTreatment(state, res);
    expect(state.money).toBe(before.money + res.income);
    expect(state.hoursRemaining).toBe(before.hours - res.hoursSpent);
    expect(state.patients.find((p) => p.id === patient.id)).toBeUndefined();
    expect(state.stats.totalTreated).toBe(1);
  });

  it('rejects locked, referred, and insufficient-hours patients', () => {
    const rng = mulberry32(42);
    const state = newGame(rng);
    const locked = state.patients.find((p) => p.locked);
    if (locked) expect(() => resolveTreatment(state, locked.id, rng)).toThrow();
    const open = state.patients.find((p) => !p.locked)!;
    open.referred = true;
    expect(() => resolveTreatment(state, open.id, rng)).toThrow('referred elsewhere');
    open.referred = false;
    state.hoursRemaining = 0;
    expect(() => resolveTreatment(state, open.id, rng)).toThrow('Not enough hours');
  });

  it('doubles XP on a bad outcome', () => {
    const rng = mulberry32(43);
    const state = newGame(rng);
    // Hold every skill at level 0 so bad outcomes stay possible, then treat
    // until one appears.
    let sawBad = false;
    for (let i = 0; i < 200 && !sawBad; i++) {
      state.hoursRemaining = 100;
      if (state.patients.filter((p) => !p.locked).length === 0) endDay(state, rng);
      for (const id of Object.keys(state.skills)) state.skills[id].xp = 0;
      const patient = state.patients.find((p) => !p.locked)!;
      const res = resolveTreatment(state, patient.id, rng);
      commitTreatment(state, res);
      if (res.outcome === 'bad') {
        sawBad = true;
        expect(res.xp).toBe(TREATMENTS_BY_ID[res.treatmentId].xpReward * 2);
        expect(state.skills[res.treatmentId].xp).toBe(res.xp);
      } else {
        expect(res.xp).toBe(TREATMENTS_BY_ID[res.treatmentId].xpReward);
      }
    }
    expect(sawBad).toBe(true);
  });
});

describe('training and clinic', () => {
  it('training spends hours and money and grants XP', () => {
    const rng = mulberry32(51);
    const state = newGame(rng);
    state.money = 1000;
    train(state, 'filling', 'video');
    expect(state.money).toBe(950);
    expect(state.skills['filling'].xp).toBe(55);
  });

  it('free research needs no money', () => {
    const state = newGame(mulberry32(52));
    state.money = -500; // even in debt
    train(state, 'filling', 'research');
    expect(state.skills['filling'].xp).toBe(20);
    expect(state.money).toBe(-500);
  });

  it('upgrading to level 7 wins the game', () => {
    const state = newGame(mulberry32(53));
    state.money = 100_000_000;
    for (let lvl = 1; lvl < 7; lvl++) upgradeClinic(state);
    expect(state.clinicLevel).toBe(7);
    expect(hasWon(state)).toBe(true);
  });
});
