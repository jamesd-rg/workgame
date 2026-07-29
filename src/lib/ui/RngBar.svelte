<script lang="ts">
  import { onMount } from 'svelte';
  import type { OutcomeKind } from '../core/types';
  import { BAR_ORDER } from '../core/outcomes';
  import { OUTCOME_CONFIGS } from '../data/outcomes';
  import { prefersReducedMotion } from './format';

  interface Props {
    weights: Record<OutcomeKind, number>;
    landingFraction: number;
    outcome: OutcomeKind;
    onDone: () => void;
  }
  let { weights, landingFraction, outcome, onDone }: Props = $props();

  let landed = $state(false);

  const segments = $derived(
    BAR_ORDER.filter((kind) => weights[kind] > 0).map((kind) => ({
      kind,
      width: weights[kind],
      config: OUTCOME_CONFIGS[kind]
    }))
  );

  interface Step {
    pos: number;
    ms: number;
    ease: string;
  }

  const reduced = prefersReducedMotion();

  // A few full-width bounces before the final settle, so the sweep reads as
  // random. Waypoints are cosmetic — the outcome was already rolled.
  // Reduced motion: one direct move to the result instead of the bounces.
  function buildSteps(): Step[] {
    if (reduced) return [{ pos: landingFraction, ms: 900, ease: 'cubic-bezier(0.15, 0.85, 0.25, 1)' }];
    const swing = 'cubic-bezier(0.45, 0.05, 0.55, 0.95)';
    return [
      { pos: 0.82 + Math.random() * 0.15, ms: 650, ease: 'cubic-bezier(0.3, 0, 0.4, 1)' },
      { pos: 0.04 + Math.random() * 0.12, ms: 620, ease: swing },
      { pos: Math.min(0.97, Math.max(0.15, landingFraction + 0.08 + Math.random() * 0.08)), ms: 550, ease: swing },
      { pos: landingFraction, ms: 850, ease: 'cubic-bezier(0.15, 0.85, 0.25, 1)' }
    ];
  }

  const steps = buildSteps();
  let stepIdx = $state(-1);
  const needle = $derived(stepIdx >= 0 ? steps[stepIdx] : { pos: 0, ms: 0, ease: 'linear' });

  onMount(() => {
    // Two frames so the needle paints at 0 before the first transition begins.
    requestAnimationFrame(() => requestAnimationFrame(() => (stepIdx = 0)));
  });

  function handleNeedleStop() {
    if (stepIdx < steps.length - 1) {
      stepIdx += 1;
    } else if (!landed) {
      landed = true;
      // Reduced motion skips the bounces, so hold on the landed result long
      // enough to read before the modal advances.
      if (reduced) setTimeout(onDone, 2000);
      else onDone();
    }
  }
</script>

<div class="rng">
  <div class="bar">
    {#each segments as seg (seg.kind)}
      <div
        class="segment"
        class:winner={landed && seg.kind === outcome}
        style="flex-basis: {seg.width}%; background: {seg.config.color}"
        title="{seg.config.label}: {seg.width.toFixed(1)}%"
      ></div>
    {/each}
    <div
      class="needle"
      style="left: {needle.pos * 100}%; transition-duration: {needle.ms}ms; transition-timing-function: {needle.ease}"
      ontransitionend={handleNeedleStop}
    ></div>
  </div>
  <div class="legend">
    {#each segments as seg (seg.kind)}
      <span class="legend-item" class:winner={landed && seg.kind === outcome}>
        <span class="swatch" style="background: {seg.config.color}"></span>{seg.config.label}
      </span>
    {/each}
  </div>
</div>

<style>
  .rng {
    margin: 12px 0;
  }
  .bar {
    position: relative;
    display: flex;
    height: 40px;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid var(--border);
  }
  .segment {
    height: 100%;
    transition: filter 0.2s;
  }
  .segment.winner {
    animation: pulse 0.5s ease-in-out 2;
  }
  @keyframes pulse {
    0%, 100% { filter: brightness(1); }
    50% { filter: brightness(1.35); }
  }
  .needle {
    position: absolute;
    top: -2px;
    bottom: -2px;
    width: 3px;
    margin-left: -1.5px;
    background: #142028;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.6);
    transition-property: left;
  }
  .legend {
    display: flex;
    gap: 12px;
    margin-top: 8px;
    flex-wrap: wrap;
    font-size: 0.78rem;
    color: var(--text-dim);
  }
  .legend-item {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  .legend-item.winner {
    font-weight: 700;
    color: var(--text);
  }
  .swatch {
    width: 10px;
    height: 10px;
    border-radius: 2px;
    display: inline-block;
  }
</style>
