import { db, defaultSettings } from './db';
import type { Account, Settings } from './types';
export async function ensureSeedData() {
  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    await db.settings.put(defaultSettings);
  }
}

export async function getSettings(): Promise<Settings> {
  const settings = await db.settings.get('primary');
  return settings ?? defaultSettings;
}

export async function getAccounts(): Promise<Account[]> {
  return db.accounts.toArray();
}
