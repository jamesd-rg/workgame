<script lang="ts">
  import type { Celebration } from '../state/gameStore.svelte';
  import { TREATMENTS_BY_ID } from '../data/treatments';
  import { CONDITIONS_BY_TREATMENT } from '../data/conditions';
  import { RED_GONE_LEVEL, ORANGE_GONE_LEVEL } from '../core/outcomes';

  interface Props {
    celebration: Celebration;
    onClose: () => void;
  }
  let { celebration, onClose }: Props = $props();

  const treatment = $derived(TREATMENTS_BY_ID[celebration.treatmentId]);
  const condition = $derived(CONDITIONS_BY_TREATMENT[celebration.treatmentId]);

  // Educational beats: call out the outcome-bar thresholds when crossed.
  const crossedRed = $derived(
    celebration.kind === 'levelUp'
      ? celebration.fromLevel < RED_GONE_LEVEL && celebration.toLevel >= RED_GONE_LEVEL
      : celebration.startLevel >= RED_GONE_LEVEL
  );
  const crossedOrange = $derived(
    celebration.kind === 'levelUp'
      ? celebration.fromLevel < ORANGE_GONE_LEVEL && celebration.toLevel >= ORANGE_GONE_LEVEL
      : celebration.startLevel >= ORANGE_GONE_LEVEL
  );
</script>

<div class="modal-backdrop">
  <div class="modal celebrate">
    {#if celebration.kind === 'levelUp'}
      <div class="emoji">🎉</div>
      <h2>Level Up!</h2>
      <p class="headline">
        <strong>{treatment.name}</strong> is now
        <span class="big-level">Level {celebration.toLevel}</span>
        <span class="dim">(up from {celebration.fromLevel})</span>
      </p>
      <p class="dim">
        Higher skill means more income from every {condition.name.toLowerCase()} patient and better
        odds on the outcome bar.
      </p>
    {:else}
      <div class="emoji">📜</div>
      <h2>Newly Certified!</h2>
      <p class="headline">
        You are now certified in <strong>{treatment.name}</strong>
        <span class="tier-badge">Tier {treatment.tier}</span>
      </p>
      <p class="dim">
        You can now treat patients presenting with {condition.name.toLowerCase()}.
        {#if celebration.viaFellowship && celebration.startLevel > 0}
          Your fellowship training starts you at <strong>Level {celebration.startLevel}</strong>.
        {/if}
      </p>
    {/if}

    {#if crossedRed || crossedOrange}
      <ul class="perks">
        {#if crossedRed}
          <li><span class="swatch red"></span>Bad outcomes no longer occur for this treatment</li>
        {/if}
        {#if crossedOrange}
          <li><span class="swatch orange"></span>Poor outcomes no longer occur for this treatment</li>
        {/if}
      </ul>
    {/if}

    <div class="footer">
      <button class="primary" onclick={onClose}>Continue</button>
    </div>
  </div>
</div>

<style>
  .celebrate {
    max-width: 460px;
    text-align: center;
  }
  .emoji {
    font-size: 2.6rem;
    line-height: 1;
    margin-bottom: 6px;
  }
  .headline {
    font-size: 1.05rem;
    margin: 10px 0;
  }
  .big-level {
    font-weight: 800;
    color: var(--accent-dark);
    font-size: 1.15rem;
  }
  .perks {
    list-style: none;
    margin: 14px 0 0;
    padding: 10px 14px;
    background: var(--surface-alt);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 0.88rem;
    font-weight: 600;
    text-align: left;
  }
  .perks li {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .swatch {
    width: 12px;
    height: 12px;
    border-radius: 3px;
    flex-shrink: 0;
  }
  .swatch.red {
    background: var(--bad);
  }
  .swatch.orange {
    background: var(--poor);
  }
  .footer {
    display: flex;
    justify-content: center;
    margin-top: 18px;
  }
</style>
