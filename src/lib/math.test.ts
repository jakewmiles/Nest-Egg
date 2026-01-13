import { describe, expect, it } from 'vitest';
import { accountValueAtDate, explainDelta, fxConversion, netWorthAtDate } from './math';
import type { Account, Cashflow, FxRate, Snapshot } from './types';

const account: Account = {
  id: 'acc',
  name: 'Test',
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
};

const snapshots: Snapshot[] = [
  {
    id: 'snap-1',
    accountId: 'acc',
    asOfDate: '2024-01-01',
    balanceMinorUnits: 10000,
    currency: 'USD',
    source: 'manual',
    createdAt: '2024-01-01'
  },
  {
    id: 'snap-2',
    accountId: 'acc',
    asOfDate: '2024-02-01',
    balanceMinorUnits: 12000,
    currency: 'USD',
    source: 'manual',
    createdAt: '2024-02-01'
  }
];

const fxRates: FxRate[] = [
  {
    id: 'fx-1',
    base: 'USD',
    quote: 'GBP',
    date: '2024-01-01',
    rate: 0.8
  },
  {
    id: 'fx-2',
    base: 'USD',
    quote: 'GBP',
    date: '2024-02-01',
    rate: 0.75
  }
];

const cashflows: Cashflow[] = [
  {
    id: 'flow-1',
    accountId: 'acc',
    date: '2024-02-01',
    amountMinorUnits: 1000,
    currency: 'USD'
  }
];

describe('fxConversion', () => {
  it('converts using latest fx rate on or before date', () => {
    const result = fxConversion(10000, 'USD', 'GBP', fxRates, '2024-02-15', false);
    expect(result.amountMinorUnits).toBe(7500);
    expect(result.missingFx).toBe(false);
  });
});

describe('accountValueAtDate', () => {
  it('picks latest snapshot at or before date', () => {
    const result = accountValueAtDate(account, snapshots, fxRates, '2024-01-15', 'GBP', false);
    expect(result.valueMinorUnits).toBe(8000);
    expect(result.hasData).toBe(true);
  });
});

describe('netWorthAtDate', () => {
  it('sums account values', () => {
    const result = netWorthAtDate([account], snapshots, fxRates, '2024-02-01', 'GBP', false);
    expect(result.valueMinorUnits).toBe(9000);
  });
});

describe('explainDelta', () => {
  it('returns account and tag breakdowns', () => {
    const result = explainDelta(
      [account],
      snapshots,
      cashflows,
      fxRates,
      'GBP',
      '2024-01-01',
      '2024-02-01',
      { includedTags: [], includeDebts: true, includeHidden: true },
      false
    );

    expect(result.totalDelta).toBe(1000);
    expect(result.accountRows[0].moneyMoved).toBe(750);
    expect(result.tagRows[0].tag).toBe('Cash');
  });
});
