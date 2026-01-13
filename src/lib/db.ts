import Dexie, { type Table } from 'dexie';
import type { Account, Cashflow, FxRate, PricePoint, Settings, Snapshot } from './types';

export class WorthItDB extends Dexie {
  settings!: Table<Settings, string>;
  accounts!: Table<Account, string>;
  snapshots!: Table<Snapshot, string>;
  cashflows!: Table<Cashflow, string>;
  fxRates!: Table<FxRate, string>;
  pricePoints!: Table<PricePoint, string>;

  constructor() {
    super('worth_it');
    this.version(1).stores({
      settings: 'id',
      accounts: 'id, type, currency, hidden, archived, updatedAt',
      snapshots: 'id, accountId, asOfDate',
      cashflows: 'id, accountId, date',
      fxRates: 'id, base, quote, date',
      pricePoints: 'id, symbol, dateTimeISO'
    });
  }
}

export const db = new WorthItDB();

export const defaultSettings: Settings = {
  id: 'primary',
  baseCurrency: 'GBP',
  locale: 'en-GB',
  theme: 'dark',
  vaultEnabled: false,
  assumeFxOneToOne: false,
  stalenessRulesByType: {
    cash: 30,
    equity: 7,
    crypto: 3,
    real_estate: 30,
    pension: 30,
    other: 30,
    debt: 30
  }
};
