<script lang="ts">
  import type { Patient } from '../core/types';
  import { game } from '../state/gameStore.svelte';
  import PatientCard from './PatientCard.svelte';

  interface Props {
    onTreat: (patientId: string) => void;
    onShowLocked: (patient: Patient) => void;
  }
  let { onTreat, onShowLocked }: Props = $props();

  const open = $derived(game.state.patients.filter((p) => !p.locked));
  const referrals = $derived(game.state.patients.filter((p) => p.locked));
</script>

<div class="list">
  {#if open.length === 0}
    <div class="card empty dim">
      No more patients today. End the day to see tomorrow's list — or spend remaining hours on
      training and certification.
    </div>
  {/if}
  {#each open as patient (patient.id)}
    <PatientCard {patient} {onTreat} {onShowLocked} />
  {/each}
  {#if referrals.length > 0}
    <h3 class="referral-heading dim">Referrals you had to turn away</h3>
    {#each referrals as patient (patient.id)}
      <PatientCard {patient} {onTreat} {onShowLocked} />
    {/each}
  {/if}
</div>

<style>
  .list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .empty {
    text-align: center;
    padding: 28px;
  }
  .referral-heading {
    margin: 12px 0 0;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
</style>
