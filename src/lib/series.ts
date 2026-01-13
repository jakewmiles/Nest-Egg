import type { Account, FxRate, Snapshot } from './types';
import { netWorthAtDate } from './math';

const parseDate = (value: string) => new Date(`${value}T00:00:00Z`).getTime();

export function uniqueSnapshotDates(snapshots: Snapshot[], range?: { start: string; end: string }) {
  const dates = new Set<string>();
  snapshots.forEach((snapshot) => {
    if (range) {
      if (parseDate(snapshot.asOfDate) < parseDate(range.start)) return;
      if (parseDate(snapshot.asOfDate) > parseDate(range.end)) return;
    }
    dates.add(snapshot.asOfDate);
  });
  if (range) {
    dates.add(range.start);
    dates.add(range.end);
  }
  return Array.from(dates).sort((a, b) => parseDate(a) - parseDate(b));
}

export function buildNetWorthSeries(
  accounts: Account[],
  snapshots: Snapshot[],
  fxRates: FxRate[],
  baseCurrency: string,
  assumeFxOneToOne: boolean,
  range: { start: string; end: string }
) {
  const dates = uniqueSnapshotDates(snapshots, range);
  return dates.map((date) => {
    const result = netWorthAtDate(accounts, snapshots, fxRates, date, baseCurrency, assumeFxOneToOne);
    return { date, valueMinorUnits: result.valueMinorUnits, missingFx: result.missingFxAccounts };
  });
}
