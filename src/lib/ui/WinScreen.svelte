<script lang="ts">
  import { game } from '../state/gameStore.svelte';
  import { OUTCOME_CONFIGS } from '../data/outcomes';
  import { BAR_ORDER } from '../core/outcomes';
  import { fmtMoney } from './format';

  const stats = $derived(game.state.stats);
</script>

<div class="modal-backdrop">
  <div class="modal win">
    <h1>🏆 World-Class Dental Hospital</h1>
    <p>
      From a single chair to a world-class hospital in <strong>{game.state.day} days</strong> — by
      investing in skills, certifications, and continual learning.
    </p>
    <dl class="rows">
      <dt>Total earned</dt>
      <dd class="money">{fmtMoney(stats.totalEarned)}</dd>
      <dt>Patients treated</dt>
      <dd>{stats.totalTreated}</dd>
    </dl>
    <h3>Outcomes</h3>
    <dl class="rows">
      {#each BAR_ORDER as kind (kind)}
        <dt><span class="swatch" style="background: {OUTCOME_CONFIGS[kind].color}"></span>{OUTCOME_CONFIGS[kind].label}</dt>
        <dd>{stats.outcomeCounts[kind]}</dd>
      {/each}
    </dl>
    <div class="footer">
      <button class="primary" onclick={() => game.markWinShown()}>Keep Practicing</button>
    </div>
  </div>
</div>

<style>
  .win h1 {
    font-size: 1.5rem;
  }
  .rows {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 6px 18px;
    margin: 12px 0;
  }
  .rows dt {
    font-weight: 600;
    color: var(--text-dim);
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .rows dd {
    margin: 0;
    text-align: right;
    font-weight: 600;
  }
  .swatch {
    width: 10px;
    height: 10px;
    border-radius: 2px;
    display: inline-block;
  }
  .footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }
</style>
