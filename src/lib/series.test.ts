import type { Account, FxRate, Snapshot } from './types';
import { buildNetWorthSeries, uniqueSnapshotDates } from './series';

const accounts: Account[] = [
  {
    id: 'acc-1',
    name: 'Checking',
    type: 'cash',
    currency: 'USD',
    tags: ['Cash'],
    liquidity: 'accessible',
    ownershipPercent: 100,
    valuationMethod: 'manual',
    hidden: false,
    archived: false,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
];

const snapshots: Snapshot[] = [
  {
    id: 'snap-1',
    accountId: 'acc-1',
    asOfDate: '2024-01-01',
    balanceMinorUnits: 50000,
    currency: 'USD',
    source: 'manual',
    createdAt: '2024-01-01'
  },
  {
    id: 'snap-2',
    accountId: 'acc-1',
    asOfDate: '2024-01-10',
    balanceMinorUnits: 70000,
    currency: 'USD',
    source: 'manual',
    createdAt: '2024-01-10'
  }
];

const fxRates: FxRate[] = [];

describe('uniqueSnapshotDates', () => {
  it('collects unique dates within a range and includes boundaries', () => {
    const result = uniqueSnapshotDates(snapshots, { start: '2024-01-05', end: '2024-01-31' });
    expect(result).toEqual(['2024-01-05', '2024-01-10', '2024-01-31']);
  });
});

describe('buildNetWorthSeries', () => {
  it('builds a net worth series using snapshots', () => {
    const result = buildNetWorthSeries(
      accounts,
      snapshots,
      fxRates,
      'USD',
      false,
      { start: '2024-01-01', end: '2024-01-10' }
    );

    expect(result).toEqual([
      { date: '2024-01-01', valueMinorUnits: 50000, missingFx: [] },
      { date: '2024-01-10', valueMinorUnits: 70000, missingFx: [] }
    ]);
  });
});
