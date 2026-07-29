<script lang="ts">
  import type { DaySummary } from '../core/types';
  import { fmtMoney, fmtSigned } from './format';

  interface Props {
    summary: DaySummary;
    onClose: () => void;
  }
  let { summary, onClose }: Props = $props();

  const net = $derived(summary.income - summary.fee);
</script>

<div class="modal-backdrop">
  <div class="modal">
    <h2>Day {summary.day} complete</h2>
    <dl class="rows">
      <dt>Patients treated</dt>
      <dd>{summary.treatments}</dd>
      <dt>Income</dt>
      <dd class="money">{fmtMoney(summary.income)}</dd>
      <dt>Practice costs</dt>
      <dd class="fee">−{fmtMoney(summary.fee)}</dd>
      <dt>Net</dt>
      <dd class:positive={net >= 0} class:negative={net < 0}>{fmtSigned(net)}</dd>
      <dt>XP gained</dt>
      <dd>{summary.xpGained.toLocaleString()}</dd>
      {#if summary.fellowshipDay}
        <dt>Fellowship</dt>
        <dd>{summary.fellowshipDay}</dd>
      {/if}
    </dl>
    <div class="footer">
      <button class="primary" onclick={onClose}>Start Day {summary.day + 1}</button>
    </div>
  </div>
</div>

<style>
  .rows {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 8px 18px;
    margin: 0;
  }
  .rows dt {
    font-weight: 600;
    color: var(--text-dim);
  }
  .rows dd {
    margin: 0;
    text-align: right;
  }
  .fee {
    color: var(--danger);
  }
  .positive {
    color: var(--money);
    font-weight: 700;
  }
  .negative {
    color: var(--danger);
    font-weight: 700;
  }
  .footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 18px;
  }
</style>
