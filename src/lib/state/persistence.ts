import type { GameState } from '../core/types';

export const SAVE_KEY = 'openwide.save';
export const BACKUP_KEY = 'openwide.save.backup';
export const SAVE_VERSION = 1;

interface SaveEnvelope {
  version: number;
  savedAt: string;
  state: GameState;
}

/** Keyed by from-version; applied sequentially until current. */
const migrations: Record<number, (raw: unknown) => unknown> = {};

export function persist(state: GameState): void {
  try {
    const envelope: SaveEnvelope = {
      version: SAVE_VERSION,
      savedAt: new Date().toISOString(),
      state
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(envelope));
  } catch {
    // Storage full or unavailable; the game keeps running unsaved.
  }
}

/** Returns the saved state, or null if none / unreadable (raw kept as backup). */
export function loadSave(): GameState | null {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(SAVE_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;
  try {
    let envelope = JSON.parse(raw) as SaveEnvelope;
    let version = envelope.version;
    while (version < SAVE_VERSION) {
      const migrate = migrations[version];
      if (!migrate) throw new Error(`No migration from save version ${version}`);
      envelope = migrate(envelope) as SaveEnvelope;
      version = envelope.version;
    }
    if (!envelope.state || typeof envelope.state.day !== 'number') {
      throw new Error('Malformed save');
    }
    return envelope.state;
  } catch {
    try {
      localStorage.setItem(BACKUP_KEY, raw);
      localStorage.removeItem(SAVE_KEY);
    } catch {
      // ignore
    }
    return null;
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // ignore
  }
}
