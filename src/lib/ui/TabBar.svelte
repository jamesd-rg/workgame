<script lang="ts">
  export type Tab = 'patients' | 'training' | 'certs' | 'fellowships' | 'clinic' | 'about';

  interface Props {
    active: Tab;
    onSelect: (tab: Tab) => void;
  }
  let { active, onSelect }: Props = $props();

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: 'patients', label: 'Patients' },
    { id: 'training', label: 'Training' },
    { id: 'certs', label: 'Certifications' },
    { id: 'fellowships', label: 'Fellowships' },
    { id: 'clinic', label: 'Clinic' },
    { id: 'about', label: 'About' }
  ];
</script>

<nav class="tabs">
  {#each tabs as tab (tab.id)}
    <button class:active={active === tab.id} onclick={() => onSelect(tab.id)}>
      {tab.label}
    </button>
  {/each}
</nav>

<style>
  .tabs {
    display: flex;
    gap: 6px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }
  .tabs button {
    border-radius: 999px;
    padding: 7px 18px;
  }
  .tabs button.active {
    background: var(--accent);
    border-color: var(--accent);
    color: #fff;
  }
</style>
