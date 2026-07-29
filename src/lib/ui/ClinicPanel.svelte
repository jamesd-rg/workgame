<script lang="ts">
  import { game } from '../state/gameStore.svelte';
  import { CLINIC_LEVELS, CLINIC_MAX_LEVEL, clinicLevelDef } from '../data/clinicLevels';
  import { canUpgradeClinic } from '../core/clinic';
  import { fmtMoney } from './format';

  const current = $derived(clinicLevelDef(game.state.clinicLevel));
  const next = $derived(
    game.state.clinicLevel < CLINIC_MAX_LEVEL ? clinicLevelDef(game.state.clinicLevel + 1) : null
  );
  const blocked = $derived(canUpgradeClinic(game.state));

  function unlocksText(level: number): string | null {
    if (level === 3) return 'Unlocks Tier 4 treatments';
    if (level === 5) return 'Unlocks Tier 5 treatments';
    if (level === CLINIC_MAX_LEVEL) return 'Winning condition!';
    return null;
  }
</script>

<div class="panel">
  <div class="card">
    <h3>Level {current.level}: {current.name}</h3>
    <dl>
      <dt>Working hours</dt><dd>{current.hoursPerDay}h/day</dd>
      <dt>Daily costs</dt><dd>−{fmtMoney(current.dailyFee)}/day</dd>
    </dl>
  </div>

  {#if next}
    <div class="card next">
      <h3>Upgrade to Level {next.level}: {next.name}</h3>
      <dl>
        <dt>Cost</dt><dd>{fmtMoney(next.upgradeCost)}</dd>
        <dt>Working hours</dt><dd>{next.hoursPerDay}h/day (+1, from tomorrow)</dd>
        <dt>Daily costs</dt><dd>−{fmtMoney(next.dailyFee)}/day</dd>
        {#if unlocksText(next.level)}
          <dt>Unlocks</dt><dd class="unlock">{unlocksText(next.level)}</dd>
        {/if}
      </dl>
      {#if blocked}<span class="reason dim">{blocked}</span>{/if}
      <button class="primary" disabled={blocked !== null} onclick={() => game.upgradeClinic()}>
        Upgrade
      </button>
    </div>
  {/if}

  <div class="card ladder">
    <h3>Clinic ladder</h3>
    <table>
      <thead>
        <tr><th>Lv</th><th>Name</th><th>Hours</th><th>Daily fee</th><th>Cost</th></tr>
      </thead>
      <tbody>
        {#each CLINIC_LEVELS as lvl (lvl.level)}
          <tr class:current={lvl.level === game.state.clinicLevel}>
            <td>{lvl.level}</td>
            <td>{lvl.name}</td>
            <td>{lvl.hoursPerDay}h</td>
            <td>−{fmtMoney(lvl.dailyFee)}</td>
            <td>{lvl.upgradeCost > 0 ? fmtMoney(lvl.upgradeCost) : '—'}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <div class="card danger-zone">
    <h3>Danger zone</h3>
    <button onclick={() => { if (confirm('Restart from Day 1? Your save will be erased.')) game.resetGame(); }}>
      Reset game
    </button>
  </div>
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
  .unlock {
    color: var(--accent-dark);
    font-weight: 700;
  }
  .next {
    border-color: var(--accent);
  }
  .reason {
    display: block;
    font-size: 0.8rem;
    margin-bottom: 6px;
  }
  .ladder table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.86rem;
  }
  .ladder th {
    text-align: left;
    color: var(--text-dim);
    font-weight: 600;
    padding: 4px 8px;
    border-bottom: 1px solid var(--border);
  }
  .ladder td {
    padding: 4px 8px;
    border-bottom: 1px solid var(--surface-alt);
  }
  .ladder tr.current td {
    background: var(--surface-alt);
    font-weight: 700;
  }
  .danger-zone h3 {
    color: var(--danger);
  }
</style>
