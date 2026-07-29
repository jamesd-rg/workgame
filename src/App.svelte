<script lang="ts">
  import type { Patient } from './lib/core/types';
  import { game } from './lib/state/gameStore.svelte';
  import Header from './lib/ui/Header.svelte';
  import TabBar, { type Tab } from './lib/ui/TabBar.svelte';
  import PatientList from './lib/ui/PatientList.svelte';
  import TreatmentModal from './lib/ui/TreatmentModal.svelte';
  import IntakeModal from './lib/ui/IntakeModal.svelte';
  import BusyModal from './lib/ui/BusyModal.svelte';
  import ReferralModal from './lib/ui/ReferralModal.svelte';
  import EndDayModal from './lib/ui/EndDayModal.svelte';
  import TrainingPanel from './lib/ui/TrainingPanel.svelte';
  import CertificationPanel from './lib/ui/CertificationPanel.svelte';
  import FellowshipPanel from './lib/ui/FellowshipPanel.svelte';
  import ClinicPanel from './lib/ui/ClinicPanel.svelte';
  import AboutPanel from './lib/ui/AboutPanel.svelte';
  import DebtBanner from './lib/ui/DebtBanner.svelte';
  import CelebrationModal from './lib/ui/CelebrationModal.svelte';
  import WinScreen from './lib/ui/WinScreen.svelte';

  let tab = $state<Tab>('patients');
  let showEndDaySummary = $state(false);
  let referralPatient = $state<Patient | null>(null);
  let intakePatient = $state<Patient | null>(null);

  function handleTreat(patientId: string) {
    intakePatient = game.state.patients.find((p) => p.id === patientId) ?? null;
  }

  function handleEndDay() {
    game.endDay();
    showEndDaySummary = true;
  }

  const showWin = $derived(game.hasWon && !game.state.winShown);
</script>

<main>
  <div class="title-row">
    <h1>🦷 Open Wide</h1>
    <span class="dim tagline">Skills pay the bills — a continual-learning practice sim</span>
  </div>

  <Header onEndDay={handleEndDay} />

  {#if game.inDebt}
    <DebtBanner />
  {/if}

  <TabBar active={tab} onSelect={(t) => (tab = t)} />

  {#if tab === 'patients'}
    <PatientList onTreat={handleTreat} onShowLocked={(p) => (referralPatient = p)} />
  {:else if tab === 'training'}
    <TrainingPanel />
  {:else if tab === 'certs'}
    <CertificationPanel />
  {:else if tab === 'fellowships'}
    <FellowshipPanel />
  {:else if tab === 'clinic'}
    <ClinicPanel />
  {:else if tab === 'about'}
    <AboutPanel />
  {/if}

  {#if game.activeAction?.kind === 'treatment'}
    <TreatmentModal resolution={game.activeAction.resolution} />
  {:else if game.activeAction?.kind === 'busy'}
    <BusyModal
      label={game.activeAction.label}
      hours={game.activeAction.hours}
      durationMs={game.activeAction.durationMs}
    />
  {/if}

  {#if intakePatient}
    <IntakeModal
      patient={intakePatient}
      onTreat={() => {
        const id = intakePatient!.id;
        intakePatient = null;
        game.beginTreatment(id);
      }}
      onRefer={() => {
        game.referPatient(intakePatient!.id);
        intakePatient = null;
      }}
      onBack={() => (intakePatient = null)}
    />
  {/if}

  {#if referralPatient}
    <ReferralModal
      patient={referralPatient}
      onClose={() => (referralPatient = null)}
      onGoTo={(t) => {
        tab = t;
        referralPatient = null;
      }}
    />
  {/if}

  {#if showEndDaySummary && game.state.lastDaySummary}
    <EndDayModal summary={game.state.lastDaySummary} onClose={() => (showEndDaySummary = false)} />
  {/if}

  {#if game.celebrations.length > 0 && !game.activeAction && !intakePatient && !referralPatient && !showEndDaySummary}
    <CelebrationModal
      celebration={game.celebrations[0]}
      onClose={() => game.dismissCelebration()}
    />
  {/if}

  {#if showWin}
    <WinScreen />
  {/if}
</main>

<style>
  .title-row {
    display: flex;
    align-items: baseline;
    gap: 12px;
    padding-top: 18px;
    flex-wrap: wrap;
  }
  .title-row h1 {
    font-size: 1.4rem;
    margin: 0;
  }
  .tagline {
    font-size: 0.85rem;
  }
</style>
