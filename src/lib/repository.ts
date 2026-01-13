import { db, defaultSettings } from './db';
import type { Account, Settings } from './types';
import { generateSeedData } from './seed';

export async function ensureSeedData() {
  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    await db.settings.put(defaultSettings);
  }

  const accountCount = await db.accounts.count();
  if (accountCount === 0) {
    const seed = generateSeedData();
    await db.accounts.bulkPut(seed.accounts);
    await db.snapshots.bulkPut(seed.snapshots);
    await db.cashflows.bulkPut(seed.cashflows);
    await db.fxRates.bulkPut(seed.fxRates);
  }
}

export async function getSettings(): Promise<Settings> {
  const settings = await db.settings.get('primary');
  return settings ?? defaultSettings;
}

export async function getAccounts(): Promise<Account[]> {
  return db.accounts.toArray();
}
