import type { GameState, TrainingKind, TreatmentResolution } from '../core/types';
import { mathRng } from '../core/rng';
import { newGame } from '../core/newGame';
import { resolveTreatment, commitTreatment } from '../core/treatment';
import { train } from '../core/training';
import { startCertification, studyCertificationHour } from '../core/certification';
import { startFellowship } from '../core/fellowship';
import { upgradeClinic } from '../core/clinic';
import { endDay } from '../core/day';
import { clinicLevelDef, CLINIC_MAX_LEVEL } from '../data/clinicLevels';
import { levelFromXp } from '../core/leveling';
import { loadSave, persist, clearSave } from './persistence';

export type ActiveAction =
  | { kind: 'treatment'; resolution: TreatmentResolution }
  | { kind: 'busy'; label: string; hours: number; durationMs: number; onComplete: () => void };

export type Celebration =
  | { kind: 'levelUp'; treatmentId: string; fromLevel: number; toLevel: number }
  | { kind: 'certified'; treatmentId: string; startLevel: number; viaFellowship: boolean };

function loadOrNew(): GameState {
  return loadSave() ?? newGame(mathRng);
}

export class GameStore {
  state = $state<GameState>(loadOrNew());
  /** In-flight animation state; never persisted. */
  activeAction = $state<ActiveAction | null>(null);
  /** Pending congratulation modals (level ups, new certifications). */
  celebrations = $state<Celebration[]>([]);

  hoursPerDay = $derived(clinicLevelDef(this.state.clinicLevel).hoursPerDay);
  dailyFee = $derived(clinicLevelDef(this.state.clinicLevel).dailyFee);
  inDebt = $derived(this.state.money < 0);
  hasWon = $derived(this.state.clinicLevel >= CLINIC_MAX_LEVEL);

  private skillLevel(treatmentId: string): number | null {
    const skill = this.state.skills[treatmentId];
    return skill ? levelFromXp(skill.xp) : null;
  }

  /** Runs an action, queueing a celebration if the skill levels up or certifies. */
  private withSkillTracking(treatmentId: string, viaFellowship: boolean, fn: () => void): void {
    const before = this.skillLevel(treatmentId);
    fn();
    const after = this.skillLevel(treatmentId);
    if (after === null) return;
    if (before === null) {
      this.celebrations.push({ kind: 'certified', treatmentId, startLevel: after, viaFellowship });
    } else if (after > before) {
      this.celebrations.push({ kind: 'levelUp', treatmentId, fromLevel: before, toLevel: after });
    }
  }

  dismissCelebration(): void {
    this.celebrations.shift();
  }

  /** Sends a patient elsewhere; their card is disabled for the rest of the day. */
  referPatient(patientId: string): void {
    const patient = this.state.patients.find((p) => p.id === patientId);
    if (!patient || patient.locked) return;
    patient.referred = true;
    this.save();
  }

  /** Phase 1: roll the treatment and hold it for the UI to animate. */
  beginTreatment(patientId: string): TreatmentResolution {
    const resolution = resolveTreatment(this.state, patientId, mathRng);
    this.activeAction = { kind: 'treatment', resolution };
    return resolution;
  }

  /** Phase 2: apply the held resolution and save. */
  finishTreatment(): void {
    if (this.activeAction?.kind !== 'treatment') return;
    const resolution = this.activeAction.resolution;
    this.withSkillTracking(resolution.treatmentId, false, () =>
      commitTreatment(this.state, resolution)
    );
    this.activeAction = null;
    this.save();
  }

  cancelAction(): void {
    this.activeAction = null;
  }

  /**
   * Shows the time-passing modal for the given in-game hours, then runs the
   * action when the bar completes.
   */
  runTimed(label: string, hours: number, onComplete: () => void): void {
    if (this.activeAction) return;
    const durationMs = Math.min(2500, 600 + hours * 250);
    this.activeAction = { kind: 'busy', label, hours, durationMs, onComplete };
  }

  finishBusy(): void {
    if (this.activeAction?.kind !== 'busy') return;
    const { onComplete } = this.activeAction;
    this.activeAction = null;
    onComplete();
  }

  train(treatmentId: string, kind: TrainingKind): void {
    this.withSkillTracking(treatmentId, false, () => train(this.state, treatmentId, kind));
    this.save();
  }

  startCertification(treatmentId: string): void {
    startCertification(this.state, treatmentId);
    this.save();
  }

  studyCertificationHour(treatmentId: string): void {
    this.withSkillTracking(treatmentId, false, () =>
      studyCertificationHour(this.state, treatmentId)
    );
    this.save();
  }

  startFellowship(treatmentId: string): void {
    startFellowship(this.state, treatmentId);
    this.save();
  }

  upgradeClinic(): void {
    upgradeClinic(this.state);
    this.save();
  }

  endDay(): void {
    // A fellowship completing during endDay grants a certification.
    const fellowshipTarget = this.state.activeFellowship?.treatmentId;
    if (fellowshipTarget) {
      this.withSkillTracking(fellowshipTarget, true, () => endDay(this.state, mathRng));
    } else {
      endDay(this.state, mathRng);
    }
    this.save();
  }

  markWinShown(): void {
    this.state.winShown = true;
    this.save();
  }

  resetGame(): void {
    clearSave();
    this.state = newGame(mathRng);
    this.activeAction = null;
    this.celebrations = [];
    this.save();
  }

  private save(): void {
    persist($state.snapshot(this.state));
  }
}

export const game = new GameStore();
