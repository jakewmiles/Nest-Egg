'use client';

import { useEffect, useState } from 'react';
import { db } from './db';
import type { Account, Cashflow, FxRate, Settings, Snapshot } from './types';
import { ensureSeedData, getSettings } from './repository';

export type DataState = {
  settings: Settings;
  accounts: Account[];
  snapshots: Snapshot[];
  cashflows: Cashflow[];
  fxRates: FxRate[];
};

export function useData() {
  const [state, setState] = useState<DataState | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      await ensureSeedData();
      const [settings, accounts, snapshots, cashflows, fxRates] = await Promise.all([
        getSettings(),
        db.accounts.toArray(),
        db.snapshots.toArray(),
        db.cashflows.toArray(),
        db.fxRates.toArray()
      ]);
      if (mounted) {
        setState({ settings, accounts, snapshots, cashflows, fxRates });
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return state;
}
