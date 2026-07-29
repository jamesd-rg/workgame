<script lang="ts">
  import type { Patient } from '../core/types';
  import { game } from '../state/gameStore.svelte';
  import { patientTreatment } from '../core/patients';
  import { CONDITIONS_BY_ID, SEVERITIES_BY_KEY } from '../data/conditions';
  import { levelFromXp } from '../core/leveling';
  import { fmtMoney } from './format';

  interface Props {
    patient: Patient;
    onTreat: () => void;
    onRefer: () => void;
    onBack: () => void;
  }
  let { patient, onTreat, onRefer, onBack }: Props = $props();

  const condition = $derived(CONDITIONS_BY_ID[patient.conditionId]);
  const treatment = $derived(patientTreatment(patient));
  const severity = $derived(SEVERITIES_BY_KEY[patient.severity]);
  const skill = $derived(game.state.skills[treatment.id]);
</script>

<div class="modal-backdrop">
  <div class="modal form">
    <div class="form-head">
      <h2>Patient Intake Form</h2>
      <span class="stamp">NEW PATIENT</span>
    </div>

    <div class="grid">
      <div class="field wide">
        <span class="flabel">Full name</span>
        <span class="fvalue">{patient.name}</span>
      </div>
      <div class="field">
        <span class="flabel">Age</span>
        <span class="fvalue">{patient.age ?? '—'}</span>
      </div>
      <div class="field">
        <span class="flabel">Occupation</span>
        <span class="fvalue">{patient.occupation ?? '—'}</span>
      </div>
      <div class="field">
        <span class="flabel">Height</span>
        <span class="fvalue">{patient.heightCm ? `${patient.heightCm} cm` : '—'}</span>
      </div>
      <div class="field">
        <span class="flabel">Weight</span>
        <span class="fvalue">{patient.weightKg ? `${patient.weightKg} kg` : '—'}</span>
      </div>
      <div class="field">
        <span class="flabel">Blood pressure</span>
        <span class="fvalue">{patient.bloodPressure ?? '—'}</span>
      </div>
      <div class="field">
        <span class="flabel">Resting pulse</span>
        <span class="fvalue">{patient.restingPulse ? `${patient.restingPulse} bpm` : '—'}</span>
      </div>
      <div class="field wide">
        <span class="flabel">Notes</span>
        <span class="fvalue">{patient.quirk ? `Patient ${patient.quirk}.` : '—'}</span>
      </div>
      <div class="field wide divider">
        <span class="flabel">Presenting condition</span>
        <span class="fvalue">{condition.name} — {severity.label.toLowerCase()}. {condition.blurb}</span>
      </div>
      <div class="field">
        <span class="flabel">Recommended treatment</span>
        <span class="fvalue">{treatment.name}</span>
      </div>
      <div class="field">
        <span class="flabel">Skill used</span>
        <span class="fvalue">{treatment.name} — Lv {skill ? levelFromXp(skill.xp) : 0}</span>
      </div>
      <div class="field">
        <span class="flabel">Estimated time</span>
        <span class="fvalue">{patient.hours}h</span>
      </div>
      <div class="field">
        <span class="flabel">Quoted price</span>
        <span class="fvalue money">{fmtMoney(patient.price)}</span>
      </div>
    </div>

    <div class="footer">
      <button onclick={onBack}>Back</button>
      <div class="decision">
        <button class="refer" onclick={onRefer}>Refer elsewhere</button>
        <button
          class="primary"
          disabled={game.state.hoursRemaining < patient.hours}
          onclick={onTreat}
        >
          Treat
        </button>
      </div>
    </div>
    {#if game.state.hoursRemaining < patient.hours}
      <p class="dim no-time">Not enough hours left today for this procedure.</p>
    {/if}
  </div>
</div>

<style>
  .form {
    max-width: 620px;
  }
  .form-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 2px solid var(--text);
    padding-bottom: 8px;
    margin-bottom: 14px;
  }
  .form-head h2 {
    margin: 0;
    font-size: 1.15rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .stamp {
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    color: var(--accent-dark);
    border: 2px solid var(--accent-dark);
    border-radius: 4px;
    padding: 2px 8px;
    transform: rotate(3deg);
  }
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px 24px;
  }
  .field {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .field.wide {
    grid-column: 1 / -1;
  }
  .field.divider {
    border-top: 1px dashed var(--border);
    padding-top: 10px;
    margin-top: 4px;
  }
  .flabel {
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-dim);
  }
  .fvalue {
    border-bottom: 1px dotted var(--border);
    padding-bottom: 3px;
    font-size: 0.95rem;
  }
  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 18px;
  }
  .decision {
    display: flex;
    gap: 10px;
  }
  .refer {
    border-color: var(--warn);
    color: var(--warn);
  }
  .refer:hover {
    border-color: var(--warn);
    background: #fdf6ea;
  }
  .no-time {
    text-align: right;
    font-size: 0.8rem;
    margin: 8px 0 0;
  }
</style>
