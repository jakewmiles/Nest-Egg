import type { Account, Cashflow, FxRate, Snapshot } from './types';

const today = new Date();

const toDate = (date: Date) => date.toISOString().slice(0, 10);

export function generateSeedData() {
  const accounts: Account[] = [
    {
      id: 'acc-cash',
      name: 'Main Current Account',
      type: 'cash',
      currency: 'GBP',
      tags: ['Cash'],
      liquidity: 'accessible',
      ownershipPercent: 100,
      valuationMethod: 'manual',
      hidden: false,
      archived: false,
      createdAt: toDate(today),
      updatedAt: toDate(today)
    },
    {
      id: 'acc-equity',
      name: 'Global Equity ISA',
      type: 'equity',
      currency: 'GBP',
      tags: ['Equity'],
      liquidity: 'restricted',
      ownershipPercent: 100,
      valuationMethod: 'manual',
      hidden: false,
      archived: false,
      createdAt: toDate(today),
      updatedAt: toDate(today)
    },
    {
      id: 'acc-crypto',
      name: 'Crypto Wallet',
      type: 'crypto',
      currency: 'USD',
      tags: ['Crypto'],
      liquidity: 'accessible',
      ownershipPercent: 100,
      valuationMethod: 'manual_fx',
      hidden: false,
      archived: false,
      createdAt: toDate(today),
      updatedAt: toDate(today)
    },
    {
      id: 'acc-debt',
      name: 'Mortgage',
      type: 'debt',
      currency: 'GBP',
      tags: ['Debt', 'Real Estate'],
      liquidity: 'restricted',
      ownershipPercent: 100,
      valuationMethod: 'manual',
      hidden: false,
      archived: false,
      createdAt: toDate(today),
      updatedAt: toDate(today)
    }
  ];

  const snapshots: Snapshot[] = [];
  const cashflows: Cashflow[] = [];
  const fxRates: FxRate[] = [];

  for (let i = 0; i < 12; i += 1) {
    const date = new Date(today);
    date.setMonth(today.getMonth() - (11 - i));
    const asOfDate = toDate(date);
    snapshots.push(
      {
        id: `snap-cash-${asOfDate}`,
        accountId: 'acc-cash',
        asOfDate,
        balanceMinorUnits: 320000 + i * 15000,
        currency: 'GBP',
        source: 'manual',
        createdAt: asOfDate
      },
      {
        id: `snap-equity-${asOfDate}`,
        accountId: 'acc-equity',
        asOfDate,
        balanceMinorUnits: 520000 + i * 45000,
        currency: 'GBP',
        source: 'manual',
        createdAt: asOfDate
      },
      {
        id: `snap-crypto-${asOfDate}`,
        accountId: 'acc-crypto',
        asOfDate,
        balanceMinorUnits: 160000 + i * 22000,
        currency: 'USD',
        source: 'manual',
        createdAt: asOfDate
      },
      {
        id: `snap-debt-${asOfDate}`,
        accountId: 'acc-debt',
        asOfDate,
        balanceMinorUnits: -1800000 + i * 15000,
        currency: 'GBP',
        source: 'manual',
        createdAt: asOfDate
      }
    );

    cashflows.push({
      id: `flow-equity-${asOfDate}`,
      accountId: 'acc-equity',
      date: asOfDate,
      amountMinorUnits: 15000,
      currency: 'GBP',
      memo: 'Monthly contribution'
    });

    fxRates.push({
      id: `fx-usd-gbp-${asOfDate}`,
      base: 'USD',
      quote: 'GBP',
      date: asOfDate,
      rate: 0.79 + i * 0.002
    });
  }

  return { accounts, snapshots, cashflows, fxRates };
}
