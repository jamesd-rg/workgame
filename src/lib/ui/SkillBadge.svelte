<script lang="ts">
  import { levelFromXp, levelProgress, LEVEL_CAP } from '../core/leveling';

  interface Props {
    xp: number;
    compact?: boolean;
  }
  let { xp, compact = false }: Props = $props();

  const level = $derived(levelFromXp(xp));
  const progress = $derived(levelProgress(xp));
</script>

<span class="skill" class:compact title="{xp.toLocaleString()} XP">
  <span class="level">Lv {level}</span>
  {#if !compact && level < LEVEL_CAP}
    <span class="bar"><span class="fill" style="width: {progress * 100}%"></span></span>
  {/if}
</span>

<style>
  .skill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .level {
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--accent-dark);
  }
  .bar {
    width: 56px;
    height: 6px;
    border-radius: 999px;
    background: var(--surface-alt);
    overflow: hidden;
    border: 1px solid var(--border);
  }
  .fill {
    display: block;
    height: 100%;
    background: var(--accent);
    border-radius: 999px;
  }
</style>
