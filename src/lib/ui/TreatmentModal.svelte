<script lang="ts">
  import type { TreatmentResolution } from '../core/types';
  import { game } from '../state/gameStore.svelte';
  import { TREATMENTS_BY_ID } from '../data/treatments';
  import { OUTCOME_CONFIGS } from '../data/outcomes';
  import { skillIncomeMult } from '../core/economy';
  import { PATIENT_QUOTES } from '../data/flavour';
  import { fmtMoney, timeOfDay } from './format';
  import ProgressBar from './ProgressBar.svelte';
  import RngBar from './RngBar.svelte';

  interface Props {
    resolution: TreatmentResolution;
  }
  let { resolution }: Props = $props();

  let phase = $state<'procedure' | 'rng' | 'result'>('procedure');

  const treatment = $derived(TREATMENTS_BY_ID[resolution.treatmentId]);
  const config = $derived(OUTCOME_CONFIGS[resolution.outcome]);
  const skillBonusPct = $derived(Math.round((skillIncomeMult(resolution.skillLevel) - 1) * 1000) / 10);
  const timeDelta = $derived(resolution.hoursSpent - resolution.baseHours);
  // Patient is still on the list until commit, so flavour details are available.
  const patient = $derived(game.state.patients.find((p) => p.id === resolution.patientId));
  const patientDetails = $derived(
    patient
      ? [patient.age ? `aged ${patient.age}` : '', patient.occupation ?? '', patient.quirk ?? '']
          .filter(Boolean)
          .join(' · ')
      : ''
  );
  const hoursLeftAfter = $derived(game.state.hoursRemaining - resolution.hoursSpent);
  const clock = $derived(timeOfDay(game.hoursPerDay - hoursLeftAfter));
  // Quote choice reuses the roll's landing fraction as its randomness so it
  // stays stable for this resolution.
  const quote = $derived.by(() => {
    const quotes = PATIENT_QUOTES[resolution.outcome];
    if (!quotes) return null;
    return quotes[Math.floor(resolution.landingFraction * 1000) % quotes.length];
  });
  // Patient review: excellent/good = 5 stars, standard = 4, poor/bad = 1.
  const stars = $derived(
    resolution.outcome === 'excellent' || resolution.outcome === 'good'
      ? 5
      : resolution.outcome === 'standard'
        ? 4
        : 1
  );

  function finish() {
    game.finishTreatment();
  }
</script>

<div class="modal-backdrop">
  <div class="modal">
    <h2>{treatment.name}</h2>
    {#if patient}
      <div class="patient-details dim">
        <strong>{patient.name}</strong>{patientDetails ? `, ${patientDetails}` : ''}
      </div>
    {/if}

    {#if phase === 'procedure'}
      <ProgressBar durationMs={1500} label="Performing procedure…" onDone={() => (phase = 'rng')} />
      <div class="skip-row">
        <button onclick={() => (phase = 'result')}>Skip</button>
      </div>
    {:else if phase === 'rng'}
      <p class="dim">How did it go?</p>
      <RngBar
        weights={resolution.weights}
        landingFraction={resolution.landingFraction}
        outcome={resolution.outcome}
        onDone={() => setTimeout(() => (phase = 'result'), 700)}
      />
      <div class="skip-row">
        <button onclick={() => (phase = 'result')}>Skip</button>
      </div>
    {:else}
      <div class="outcome" style="color: {config.color}">{config.label}</div>
      <dl class="results">
        <dt>Income</dt>
        <dd>
          <span class="money">{fmtMoney(resolution.income)}</span>
          {#if resolution.skillLevel > 0}
            <span class="dim detail">(Skill Lv {resolution.skillLevel}: +{skillBonusPct}%)</span>
          {/if}
          {#if resolution.income !== resolution.baseIncome}
            <span class="dim detail">
              ({resolution.income > resolution.baseIncome ? 'outcome bonus' : 'outcome penalty'})
            </span>
          {/if}
        </dd>
        <dt>Time</dt>
        <dd>
          {resolution.hoursSpent}h
          {#if timeDelta < 0}
            <span class="detail saved">({timeDelta}h — faster than planned!)</span>
          {:else if timeDelta > 0}
            <span class="detail overran">(+{timeDelta}h — complications)</span>
          {/if}
        </dd>
        <dt>Experience</dt>
        <dd>
          +{resolution.xp} XP
          {#if resolution.outcome === 'bad'}
            <span class="dim detail">(×2 — you learn from failure)</span>
          {/if}
        </dd>
        <dt>Day so far</dt>
        <dd>
          It's {clock} — {hoursLeftAfter > 0
            ? `${hoursLeftAfter} ${hoursLeftAfter === 1 ? 'hour' : 'hours'} left today`
            : hoursLeftAfter === 0
              ? 'that was the last appointment of the day'
              : 'you ran over — tomorrow starts short'}
        </dd>
      </dl>
      <blockquote class="quote">
        <span class="stars" aria-label="{stars} out of 5 stars"
          ><span class="filled">{'★'.repeat(stars)}</span>{'☆'.repeat(5 - stars)}</span
        >
        {#if quote}“{quote}”{/if}
        {#if patient}<cite>— {patient.name}</cite>{/if}
      </blockquote>
      <div class="skip-row">
        <button class="primary" onclick={finish}>Continue</button>
      </div>
    {/if}
  </div>
</div>

<style>
  .skip-row {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }
  .outcome {
    font-size: 1.6rem;
    font-weight: 800;
    margin: 8px 0 12px;
  }
  .results {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 8px 18px;
    margin: 0;
  }
  .results dt {
    font-weight: 600;
    color: var(--text-dim);
  }
  .results dd {
    margin: 0;
  }
  .detail {
    font-size: 0.82rem;
    margin-left: 6px;
  }
  .saved {
    color: var(--money);
  }
  .overran {
    color: var(--danger);
  }
  .patient-details {
    font-size: 0.86rem;
    margin: -4px 0 10px;
  }
  .quote {
    margin: 14px 0 0;
    padding: 10px 14px;
    border-left: 3px solid var(--border);
    background: var(--surface-alt);
    border-radius: 0 8px 8px 0;
    font-style: italic;
    font-size: 0.92rem;
  }
  .quote cite {
    display: block;
    font-style: normal;
    font-size: 0.78rem;
    color: var(--text-dim);
    margin-top: 4px;
  }
  .stars {
    display: block;
    font-style: normal;
    font-size: 1.05rem;
    letter-spacing: 2px;
    color: var(--border);
    margin-bottom: 4px;
  }
  .stars .filled {
    color: var(--excellent);
  }
</style>
