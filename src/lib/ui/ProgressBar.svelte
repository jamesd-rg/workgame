<script lang="ts">
  import { onMount } from 'svelte';
  import { prefersReducedMotion } from './format';

  interface Props {
    durationMs: number;
    label?: string;
    onDone: () => void;
  }
  let { durationMs, label = '', onDone }: Props = $props();

  let started = $state(false);
  const duration = $derived(prefersReducedMotion() ? 10 : durationMs);

  onMount(() => {
    // Two frames so the 0%-width state paints before the transition begins.
    requestAnimationFrame(() => requestAnimationFrame(() => (started = true)));
  });
</script>

<div class="wrap">
  {#if label}<div class="label dim">{label}</div>{/if}
  <div class="track">
    <div
      class="fill"
      class:started
      style="transition-duration: {duration}ms"
      ontransitionend={onDone}
    ></div>
  </div>
</div>

<style>
  .wrap {
    margin: 12px 0;
  }
  .label {
    font-size: 0.85rem;
    margin-bottom: 6px;
  }
  .track {
    height: 14px;
    border-radius: 999px;
    background: var(--surface-alt);
    border: 1px solid var(--border);
    overflow: hidden;
  }
  .fill {
    height: 100%;
    width: 0%;
    background: var(--accent);
    border-radius: 999px;
    transition-property: width;
    transition-timing-function: linear;
  }
  .fill.started {
    width: 100%;
  }
</style>
