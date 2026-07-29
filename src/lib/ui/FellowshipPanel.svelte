<script lang="ts">
  import { game } from '../state/gameStore.svelte';
  import { FELLOWSHIPS, FELLOWSHIPS_BY_ID } from '../data/fellowships';
  import { treatmentsInTier } from '../data/treatments';
  import { canStartFellowship } from '../core/fellowship';
  import { fmtMoney } from './format';

  const active = $derived(game.state.activeFellowship);
  const activeDef = $derived(active ? FELLOWSHIPS_BY_ID[active.defId] : null);

  let picks = $state<Record<string, string>>({});

  function rewardText(level: number): string {
    return level > 0
      ? `Certification + skill starts at Lv ${level}`
      : 'Certification (skill starts at Lv 0)';
  }
</script>

<div class="panel">
  {#if active && activeDef}
    <div class="card active-card">
      <h3>{activeDef.name} — in progress</h3>
      <p class="dim">
        Day {active.daysDone} of {activeDef.days} complete. {activeDef.hoursPerDay} hours are
        committed automatically each day.
      </p>
      <div class="track">
        <div class="fill" style="width: {(active.daysDone / activeDef.days) * 100}%"></div>
      </div>
    </div>
  {/if}

  {#each FELLOWSHIPS as def (def.id)}
    {@const tierTreatments = treatmentsInTier(def.tier)}
    {@const uncertified = tierTreatments.filter((t) => game.state.skills[t.id] === undefined)}
    {@const pick = picks[def.id] ?? uncertified[0]?.id}
    {@const blocked = pick ? canStartFellowship(game.state, pick) : 'All tier treatments certified'}
    <div class="card">
      <h3>{def.name} <span class="tier-badge">Tier {def.tier}</span></h3>
      <dl>
        <dt>Commitment</dt><dd>{def.hoursPerDay}h/day × {def.days} days</dd>
        <dt>Tuition</dt><dd>{fmtMoney(def.tuition)}</dd>
        <dt>Reward</dt><dd>{rewardText(def.grantsSkillLevel)}</dd>
        {#if def.tier === 5}
          <dt></dt><dd class="dim note">The only path to Tier 5 certification.</dd>
        {/if}
      </dl>
      {#if uncertified.length > 0}
        <div class="start-row">
          <select
            value={pick}
            onchange={(e) => (picks[def.id] = (e.currentTarget as HTMLSelectElement).value)}
          >
            {#each uncertified as t (t.id)}
              <option value={t.id}>{t.name}</option>
            {/each}
          </select>
          {#if blocked}<span class="reason dim">{blocked}</span>{/if}
          <button
            class="primary"
            disabled={blocked !== null}
            onclick={() => game.startFellowship(pick)}
          >
            Begin
          </button>
        </div>
      {:else}
        <span class="dim">All Tier {def.tier} treatments certified.</span>
      {/if}
    </div>
  {/each}
</div>

<style>
  .panel {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  dl {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 4px 16px;
    margin: 0 0 10px;
    font-size: 0.9rem;
  }
  dt {
    color: var(--text-dim);
    font-weight: 600;
  }
  dd {
    margin: 0;
  }
  .note {
    font-style: italic;
  }
  .start-row {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  select {
    font: inherit;
    padding: 6px 10px;
    border-radius: 8px;
    border: 1px solid var(--border);
  }
  .reason {
    font-size: 0.8rem;
  }
  .active-card {
    border-color: var(--accent);
  }
  .track {
    height: 10px;
    border-radius: 999px;
    background: var(--surface-alt);
    border: 1px solid var(--border);
    overflow: hidden;
  }
  .fill {
    height: 100%;
    background: var(--accent);
  }
</style>
