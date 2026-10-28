<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import { exportedRows, splitTicket, uniqueReports, type Problem } from '#lib/kb/problems';
  import { tenantOf } from '#lib/kb/locales';
  import type { Report } from '#lib/kb/causes';

  // tickets: problem → the ticket that now owns it, e.g. { parser: { n: 1, href: '…' } }
  let { ticket, tickets, labels }: {
    ticket: number;
    tickets: Partial<Record<Problem, { n: number; href: string }>>;
    labels: Record<Problem, string>;
  } = $props();

  const all = reports as Report[];
  const groups = $derived(splitTicket(all, ticket, tenantOf));
  const total = $derived(uniqueReports(all, ticket));
  const rows = $derived(exportedRows(all, ticket));
  const channels = (c: Record<string, number>) =>
    Object.entries(c).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ×${n}`).join(' · ');
</script>

<p class="sum">
  <strong>{total}</strong> reports in #{ticket} ({rows} export rows, {rows - total} exported twice) ·
  <strong>{groups.length}</strong> problems
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>came in by</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each groups as g (g.problem)}
      {@const t = g.problem === 'unplaced' ? undefined : tickets[g.problem]}
      <tr>
        <td>{g.problem === 'unplaced' ? 'no tenant on file' : labels[g.problem]}</td>
        <td><strong>{g.reports.length}</strong></td>
        <td>{g.tenants.length}</td>
        <td class="muted">{channels(g.channels)}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>{#if t}<a href={t.href}>#{t.n}</a>{:else}<span class="warn">none yet</span>{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

{#each groups as g (g.problem)}
  {#if g.filedUnder}
    <p class="muted">{g.reports.length} one-day moves are also counted under <code>{g.filedUnder}</code>, where the desk filed them by tenant. The desk counts a report where it is filed and footnotes it (desk-notes.json).</p>
  {/if}
{/each}

<style>
  .sum { font-size: 1.1rem; }
  .muted { color: var(--muted); font-size: 0.85em; }
  .warn { color: var(--warn); font-weight: 600; }
</style>
