<script lang="ts">
  import type { Patient } from '../core/types';
  import { game } from '../state/gameStore.svelte';
  import { patientTreatment } from '../core/patients';
  import { CONDITIONS_BY_ID, SEVERITIES_BY_KEY } from '../data/conditions';
  import { fmtMoney } from './format';
  import SkillBadge from './SkillBadge.svelte';

  interface Props {
    patient: Patient;
    onTreat: (patientId: string) => void;
    onShowLocked: (patient: Patient) => void;
  }
  let { patient, onTreat, onShowLocked }: Props = $props();

  const condition = $derived(CONDITIONS_BY_ID[patient.conditionId]);
  const treatment = $derived(patientTreatment(patient));
  const severity = $derived(SEVERITIES_BY_KEY[patient.severity]);
  const skill = $derived(game.state.skills[treatment.id]);
  const notEnoughHours = $derived(game.state.hoursRemaining < patient.hours);
  const disabledReason = $derived(
    patient.locked
      ? patient.lockReason ?? 'Locked'
      : patient.referred
        ? 'Referred elsewhere'
        : notEnoughHours
          ? 'Not enough hours today'
          : null
  );
</script>

<div class="card patient" class:locked={patient.locked} class:referred={patient.referred}>
  <div class="top">
    <div>
      <div class="name">{patient.name}</div>
      <div class="condition">
        {condition.name}
        <span class="tier-badge">Tier {treatment.tier}</span>
        <span class="severity {patient.severity}">{severity.label}</span>
      </div>
      <div class="blurb dim">{condition.blurb}</div>
    </div>
    <div class="side">
      <div class="price money">{fmtMoney(patient.price)}</div>
      <div class="hours dim">{patient.hours}h</div>
      <div class="skill-line">
        <span class="dim">Skill used:</span>
        {treatment.name}
        {#if skill}
          <SkillBadge xp={skill.xp} compact />
        {:else}
          <span class="uncertified">not certified</span>
        {/if}
      </div>
    </div>
  </div>
  <div class="actions">
    {#if disabledReason}
      <span class="reason dim">{disabledReason}</span>
    {/if}
    {#if patient.locked}
      <button onclick={() => onShowLocked(patient)}>How do I treat this?</button>
    {:else}
      <button
        class="primary"
        disabled={disabledReason !== null || game.activeAction !== null}
        onclick={() => onTreat(patient.id)}
      >
        {patient.referred ? 'Referred' : 'Treat'}
      </button>
    {/if}
  </div>
</div>

<style>
  .patient {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .patient.locked,
  .patient.referred {
    opacity: 0.65;
    background: var(--surface-alt);
  }
  .skill-line {
    font-size: 0.82rem;
    display: flex;
    align-items: center;
    gap: 5px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  .uncertified {
    color: var(--warn);
    font-weight: 600;
    font-size: 0.78rem;
  }
  .top {
    display: flex;
    justify-content: space-between;
    gap: 12px;
  }
  .name {
    font-weight: 700;
  }
  .condition {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 2px;
    flex-wrap: wrap;
  }
  .blurb {
    font-size: 0.82rem;
    margin-top: 4px;
  }
  .side {
    text-align: right;
    display: flex;
    flex-direction: column;
    gap: 3px;
    align-items: flex-end;
    flex-shrink: 0;
  }
  .price {
    font-size: 1.05rem;
  }
  .hours {
    font-size: 0.82rem;
  }
  .severity {
    font-size: 0.75rem;
    font-weight: 600;
    padding: 1px 7px;
    border-radius: 999px;
  }
  .severity.mild {
    background: #e3f2e6;
    color: #26663a;
  }
  .severity.moderate {
    background: #fdf0dd;
    color: #9c6410;
  }
  .severity.severe {
    background: #fbe3e1;
    color: #a02c22;
  }
  .actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;
  }
  .reason {
    font-size: 0.8rem;
  }
</style>
