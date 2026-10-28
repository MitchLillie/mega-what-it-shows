// The problems #4471 actually holds. causes.ts tells parser from hint by tenant and channel; the desk's
// own reading (desk-notes.json) finds reports whose date moved by one day instead of flipping. A flip
// fix does nothing for those, so they are a problem of their own.
import notes from '#lib/data/desk-notes.json';
import { causeOf, groupByCause, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'shift';
export const PROBLEMS: readonly Problem[] = ['parser', 'hint', 'shift'];

// Counted the desk's way (CauseTable, as exported): every report sits under the cause it is filed by,
// tenant and channel. The one-day moves the desk noted stay counted where they are filed and get their
// own row on top, so the shift row overlaps the row it was filed under.
export type ProblemGroup = {
  problem: Problem | 'unplaced';
  reports: Report[];
  tenants: string[];
  channels: Record<string, number>;
  firstSeen: string;
  lastSeen: string;
  filedUnder?: string;
};

function group(problem: ProblemGroup['problem'], rs: Report[], filedUnder?: string): ProblemGroup {
  const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
  return {
    problem,
    reports: rs,
    tenants: [...new Set(rs.map((r) => r.tenant))].sort(),
    channels: rs.reduce<Record<string, number>>((n, r) => ({ ...n, [r.channel]: (n[r.channel] ?? 0) + 1 }), {}),
    firstSeen: days[0],
    lastSeen: days[days.length - 1],
    filedUnder,
  };
}

export function splitTicket(all: Report[], ticket: number, tenantOf: (r: Report) => Tenant | undefined): ProblemGroup[] {
  const merged = uniqueById(all).filter((r) => r.mergedInto === ticket);
  const groups = groupByCause(merged, tenantOf).map((g) => group(g.cause, g.reports));
  const moved = merged.filter((r) => notes.oneDayMove.includes(r.id));
  if (moved.length) {
    const under = [...new Set(moved.map((r) => causeOf(r, tenantOf(r)) ?? 'unplaced'))].join(', ');
    groups.push(group('shift', moved, under));
  }
  return groups;
}

// Unique reports in the ticket, each counted once.
export const uniqueReports = (all: Report[], ticket: number) => uniqueById(all).filter((r) => r.mergedInto === ticket).length;

// Rows in the export, before the overlapping pages are collapsed to one report per id.
export const exportedRows = (all: Report[], ticket: number) => all.filter((r) => r.mergedInto === ticket).length;
