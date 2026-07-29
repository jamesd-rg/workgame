<script lang="ts">
  import { game } from '../state/gameStore.svelte';
  import { FELLOWSHIPS_BY_ID } from '../data/fellowships';
  import { clinicLevelDef } from '../data/clinicLevels';
  import { fmtMoney } from './format';

  interface Props {
    onEndDay: () => void;
  }
  let { onEndDay }: Props = $props();

  const clinic = $derived(clinicLevelDef(game.state.clinicLevel));
  const fellowship = $derived(
    game.state.activeFellowship ? FELLOWSHIPS_BY_ID[game.state.activeFellowship.defId] : null
  );
  const pips = $derived(
    Array.from({ length: game.hoursPerDay }, (_, i) => i < game.state.hoursRemaining)
  );
</script>

<header class="header card">
  <div class="row">
    <div class="stat">
      <span class="label">Day</span>
      <span class="value">{game.state.day}</span>
    </div>
    <div class="stat hours">
      <span class="label">Hours</span>
      <span class="pips" title="{game.state.hoursRemaining} of {game.hoursPerDay} hours left">
        {#each pips as full, i (i)}
          <span class="pip" class:full></span>
        {/each}
        {#if game.state.hoursRemaining < 0}
          <span class="overdrawn">({game.state.hoursRemaining})</span>
        {/if}
      </span>
    </div>
    <div class="stat">
      <span class="label">Money</span>
      <span class="value money" class:debt={game.inDebt}>{fmtMoney(game.state.money)}</span>
    </div>
    <div class="stat">
      <span class="label">Clinic</span>
      <span class="value">Lv {game.state.clinicLevel} <span class="dim clinic-name">{clinic.name}</span></span>
    </div>
    {#if fellowship && game.state.activeFellowship}
      <div class="stat">
        <span class="label">Fellowship</span>
        <span class="value fellowship">
          {fellowship.name} · day {game.state.activeFellowship.daysDone + 1}/{fellowship.days}
        </span>
      </div>
    {/if}
    <button class="primary end-day" onclick={onEndDay}>End Day</button>
  </div>
</header>

<style>
  .header {
    position: sticky;
    top: 8px;
    z-index: 10;
    margin: 8px 0 16px;
  }
  .row {
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
  }
  .stat {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .label {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-dim);
  }
  .value {
    font-weight: 600;
  }
  .clinic-name {
    font-weight: 400;
    font-size: 0.85rem;
  }
  .money.debt {
    color: var(--danger);
  }
  .pips {
    display: flex;
    gap: 3px;
    align-items: center;
    padding-top: 4px;
  }
  .pip {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 1.5px solid var(--accent);
    background: transparent;
  }
  .pip.full {
    background: var(--accent);
  }
  .overdrawn {
    color: var(--danger);
    font-size: 0.8rem;
    margin-left: 4px;
  }
  .fellowship {
    font-size: 0.85rem;
  }
  .end-day {
    margin-left: auto;
  }
</style>
