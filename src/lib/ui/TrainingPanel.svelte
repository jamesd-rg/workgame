<script lang="ts">
  import { game } from '../state/gameStore.svelte';
  import { TRAINING } from '../data/training';
  import { TREATMENTS, TREATMENTS_BY_ID } from '../data/treatments';
  import { canTrain, trainingCostFor } from '../core/training';
  import type { TrainingKind } from '../core/types';
  import { fmtMoney } from './format';
  import SkillBadge from './SkillBadge.svelte';

  const certified = $derived(TREATMENTS.filter((t) => game.state.skills[t.id] !== undefined));
  let selectedId = $state('');
  const selected = $derived(
    certified.find((t) => t.id === selectedId) ?? certified[0]
  );

  function doTrain(kind: TrainingKind) {
    if (!selected) return;
    const id = selected.id;
    const option = TRAINING.find((t) => t.kind === kind)!;
    game.runTimed(`${option.name} — ${selected.name}`, option.hours, () => game.train(id, kind));
  }
</script>

<div class="panel">
  <div class="card">
    <h3>Choose a skill to train</h3>
    <select bind:value={selectedId}>
      {#each certified as t (t.id)}
        <option value={t.id}>Tier {t.tier} — {t.name}</option>
      {/each}
    </select>
    {#if selected}
      <div class="skill-row">
        <span>{TREATMENTS_BY_ID[selected.id].name}</span>
        <SkillBadge xp={game.state.skills[selected.id].xp} />
      </div>
    {/if}
  </div>

  {#if selected}
    <div class="options">
      {#each TRAINING as option (option.kind)}
        {@const cost = trainingCostFor(selected.id, option.kind)}
        {@const blocked = canTrain(game.state, selected.id, option.kind)}
        <div class="card option">
          <h3>{option.name}</h3>
          <dl>
            <dt>Time</dt><dd>{option.hours}h</dd>
            <dt>Cost</dt><dd>{cost === 0 ? 'Free' : fmtMoney(cost)}</dd>
            <dt>XP</dt><dd>+{option.xp}</dd>
            <dt>XP/hour</dt><dd>{Math.round(option.xp / option.hours)}</dd>
          </dl>
          {#if blocked}
            <span class="reason dim">{blocked}</span>
          {/if}
          <button class="primary" disabled={blocked !== null} onclick={() => doTrain(option.kind)}>
            Train
          </button>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .panel {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  select {
    font: inherit;
    padding: 6px 10px;
    border-radius: 8px;
    border: 1px solid var(--border);
    width: 100%;
    max-width: 380px;
  }
  .skill-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 10px;
  }
  .options {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 10px;
  }
  .option {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .option dl {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 3px 12px;
    margin: 0;
    font-size: 0.88rem;
    flex: 1;
  }
  .option dt {
    color: var(--text-dim);
  }
  .option dd {
    margin: 0;
    text-align: right;
    font-weight: 600;
  }
  .reason {
    font-size: 0.8rem;
  }
</style>
