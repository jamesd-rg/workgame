import { beforeEach, describe, expect, it } from 'vitest';
import { loadSave, persist, clearSave, SAVE_KEY, BACKUP_KEY } from '../src/lib/state/persistence';
import { newGame } from '../src/lib/core/newGame';
import { mulberry32 } from '../src/lib/core/rng';

function installMemoryStorage() {
  const store = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: (i: number) => [...store.keys()][i] ?? null,
    get length() {
      return store.size;
    }
  } as Storage;
  return store;
}

describe('persistence', () => {
  beforeEach(() => {
    installMemoryStorage();
  });

  it('roundtrips a game state through the save envelope', () => {
    const state = newGame(mulberry32(61));
    state.money = 12345;
    state.day = 42;
    persist(state);
    const loaded = loadSave();
    expect(loaded).toEqual(state);
  });

  it('returns null when no save exists', () => {
    expect(loadSave()).toBeNull();
  });

  it('quarantines a corrupt save as a backup and returns null', () => {
    localStorage.setItem(SAVE_KEY, '{not json');
    expect(loadSave()).toBeNull();
    expect(localStorage.getItem(BACKUP_KEY)).toBe('{not json');
    expect(localStorage.getItem(SAVE_KEY)).toBeNull();
  });

  it('rejects a structurally invalid save', () => {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 1, state: { nope: true } }));
    expect(loadSave()).toBeNull();
  });

  it('clearSave removes the save', () => {
    persist(newGame(mulberry32(62)));
    clearSave();
    expect(loadSave()).toBeNull();
  });
});
