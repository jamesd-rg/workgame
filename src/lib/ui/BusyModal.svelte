<script lang="ts">
  import { game } from '../state/gameStore.svelte';
  import ProgressBar from './ProgressBar.svelte';

  interface Props {
    label: string;
    hours: number;
    durationMs: number;
  }
  let { label, hours, durationMs }: Props = $props();
</script>

<div class="modal-backdrop">
  <div class="modal">
    <h2>{label}</h2>
    <p class="dim">{hours} {hours === 1 ? 'hour passes' : 'hours pass'}…</p>
    <ProgressBar {durationMs} onDone={() => game.finishBusy()} />
  </div>
</div>
