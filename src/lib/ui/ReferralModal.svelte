<script lang="ts">
  import type { Patient } from '../core/types';
  import type { Tab } from './TabBar.svelte';
  import { game } from '../state/gameStore.svelte';
  import { patientTreatment } from '../core/patients';
  import { CONDITIONS_BY_ID } from '../data/conditions';
  import { CERTIFICATIONS } from '../data/certification';
  import { FELLOWSHIPS_BY_TIER } from '../data/fellowships';
  import { minClinicLevelForTier } from '../data/clinicLevels';
  import { fmtMoney } from './format';

  interface Props {
    patient: Patient;
    onClose: () => void;
    onGoTo: (tab: Tab) => void;
  }
  let { patient, onClose, onGoTo }: Props = $props();

  const treatment = $derived(patientTreatment(patient));
  const condition = $derived(CONDITIONS_BY_ID[patient.conditionId]);
  const cert = $derived(CERTIFICATIONS[treatment.tier]);
  const fellowship = $derived(FELLOWSHIPS_BY_TIER[treatment.tier]);
  const clinicGate = $derived(minClinicLevelForTier(treatment.tier));
  const needsClinic = $derived(game.state.clinicLevel < clinicGate);
  const certProgress = $derived(
    game.state.certsInProgress.find((c) => c.treatmentId === treatment.id)
  );
  const targetTab: Tab = $derived(cert ? 'certs' : 'fellowships');
</script>

<div class="modal-backdrop">
  <div class="modal">
    <h2>Referred elsewhere — for now</h2>
    <p>
      <strong>{patient.name}</strong> needs <strong>{treatment.name}</strong> for their
      {condition.name.toLowerCase()} ({condition.blurb.toLowerCase()}) You had to refer them to
      another practice — worth {fmtMoney(patient.price)} and {patient.hours}h of work you didn't get.
    </p>
    <h3>To treat patients like this:</h3>
    <ul class="steps">
      {#if needsClinic}
        <li>Upgrade your clinic to <strong>Level {clinicGate}</strong> (currently Lv {game.state.clinicLevel})</li>
      {/if}
      {#if certProgress}
        <li>
          Finish your <strong>{treatment.name}</strong> certification — {certProgress.hoursDone} of
          {certProgress.totalHours} study hours done
        </li>
      {:else if cert}
        <li>
          Complete the <strong>{treatment.name}</strong> certification: {cert.totalHours} study
          hours + {fmtMoney(cert.fee)} enrolment fee
        </li>
      {:else if fellowship}
        <li>
          Complete the <strong>{fellowship.name}</strong>: {fellowship.hoursPerDay}h/day for
          {fellowship.days} days, {fmtMoney(fellowship.tuition)} tuition — the only path to Tier
          {treatment.tier}
        </li>
      {/if}
    </ul>
    <div class="footer">
      <button onclick={onClose}>Close</button>
      <button class="primary" onclick={() => onGoTo(targetTab)}>
        Go to {cert ? 'Certifications' : 'Fellowships'}
      </button>
    </div>
  </div>
</div>

<style>
  .steps {
    margin: 0;
    padding-left: 20px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 18px;
  }
</style>
