<script lang="ts">
  import { game } from '../state/gameStore.svelte';
  import { TREATMENTS } from '../data/treatments';
  import { CERTIFICATIONS } from '../data/certification';
  import { minClinicLevelForTier } from '../data/clinicLevels';
  import { canStartCertification } from '../core/certification';
  import { fmtMoney } from './format';

  const inProgress = $derived(game.state.certsInProgress);
  const available = $derived(
    TREATMENTS.filter(
      (t) =>
        game.state.skills[t.id] === undefined &&
        !game.state.certsInProgress.some((c) => c.treatmentId === t.id)
    )
  );
</script>

<div class="panel">
  {#if inProgress.length > 0}
    <h3>In progress</h3>
    {#each inProgress as cert (cert.treatmentId)}
      {@const treatment = TREATMENTS.find((t) => t.id === cert.treatmentId)!}
      <div class="card row">
        <div>
          <strong>{treatment.name}</strong>
          <span class="tier-badge">Tier {treatment.tier}</span>
          <div class="dim progress-text">{cert.hoursDone} / {cert.totalHours} hours studied</div>
          <div class="track"><div class="fill" style="width: {(cert.hoursDone / cert.totalHours) * 100}%"></div></div>
        </div>
        <button
          class="primary"
          disabled={game.state.hoursRemaining < 1}
          onclick={() =>
            game.runTimed(`Studying — ${treatment.name}`, 1, () =>
              game.studyCertificationHour(cert.treatmentId)
            )}
        >
          +1 Hour Study
        </button>
      </div>
    {/each}
  {/if}

  <h3>Available certifications</h3>
  {#each available as treatment (treatment.id)}
    {@const cert = CERTIFICATIONS[treatment.tier]}
    {@const blocked = canStartCertification(game.state, treatment.id)}
    <div class="card row">
      <div>
        <strong>{treatment.name}</strong>
        <span class="tier-badge">Tier {treatment.tier}</span>
        {#if cert}
          <div class="dim progress-text">
            {cert.totalHours} study hours · {fmtMoney(cert.fee)} fee · earn up to
            {fmtMoney(treatment.basePrice)}/patient
          </div>
        {:else}
          <div class="dim progress-text">
            Available by fellowship only — see the Fellowships tab.
            {#if game.state.clinicLevel < minClinicLevelForTier(treatment.tier)}
              Requires Clinic Level {minClinicLevelForTier(treatment.tier)}.
            {/if}
          </div>
        {/if}
      </div>
      {#if cert}
        <div class="action">
          {#if blocked}<span class="reason dim">{blocked}</span>{/if}
          <button
            class="primary"
            disabled={blocked !== null}
            onclick={() => game.startCertification(treatment.id)}
          >
            Enrol
          </button>
        </div>
      {/if}
    </div>
  {/each}
  {#if available.length === 0}
    <div class="card dim">You're certified in everything. Impressive.</div>
  {/if}
</div>

<style>
  .panel {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 14px;
  }
  .row > div:first-child {
    flex: 1;
  }
  .progress-text {
    font-size: 0.84rem;
    margin-top: 4px;
  }
  .track {
    height: 8px;
    border-radius: 999px;
    background: var(--surface-alt);
    border: 1px solid var(--border);
    overflow: hidden;
    margin-top: 6px;
    max-width: 320px;
  }
  .fill {
    height: 100%;
    background: var(--accent);
  }
  .action {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
    flex-shrink: 0;
  }
  .reason {
    font-size: 0.78rem;
    text-align: right;
  }
</style>
