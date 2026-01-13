'use client';

import { useMemo, useState } from 'react';
import ExplainDeltaPanel from '@/components/ExplainDeltaPanel';
import { exportDatabase, importDatabase } from '@/lib/backup';
import { formatCurrency } from '@/lib/format';
import { explainDelta, netWorthAtDate } from '@/lib/math';
import { useData } from '@/lib/useData';

export default function UpdatePage() {
  const data = useData();
  const [fromDate, setFromDate] = useState(() => new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 10));
  const [toDate, setToDate] = useState(() => new Date().toISOString().slice(0, 10));

  const view = useMemo(() => {
    if (!data) return null;
    const staleAccounts = data.accounts.filter((account) => {
      const latest = data.snapshots
        .filter((snap) => snap.accountId === account.id)
        .sort((a, b) => (a.asOfDate > b.asOfDate ? -1 : 1))[0];
      const lastUpdate = latest?.asOfDate ?? account.updatedAt;
      const daysSince = Math.floor(
        (Date.now() - new Date(`${lastUpdate}T00:00:00Z`).getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSince > data.settings.stalenessRulesByType[account.type];
    });

    const recentSnapshots = data.snapshots
      .sort((a, b) => (a.asOfDate > b.asOfDate ? -1 : 1))
      .slice(0, 10);

    const delta = explainDelta(
      data.accounts,
      data.snapshots,
      data.cashflows,
      data.fxRates,
      data.settings.baseCurrency,
      fromDate,
      toDate,
      { includedTags: [], includeDebts: true, includeHidden: false },
      data.settings.assumeFxOneToOne
    );

    const netWorthStart = netWorthAtDate(
      data.accounts,
      data.snapshots,
      data.fxRates,
      fromDate,
      data.settings.baseCurrency,
      data.settings.assumeFxOneToOne
    ).valueMinorUnits;
    const netWorthEnd = netWorthAtDate(
      data.accounts,
      data.snapshots,
      data.fxRates,
      toDate,
      data.settings.baseCurrency,
      data.settings.assumeFxOneToOne
    ).valueMinorUnits;

    return { staleAccounts, recentSnapshots, delta, netWorthStart, netWorthEnd };
  }, [data, fromDate, toDate]);

  if (!data || !view) {
    return <div className="text-muted">Loading updates…</div>;
  }

  const percentDelta = view.netWorthStart !== 0 ? (view.netWorthEnd - view.netWorthStart) / view.netWorthStart : null;

  const handleExport = async (vault: boolean) => {
    const passphrase = vault ? window.prompt('Create a passphrase for Vault export') : undefined;
    if (vault && !passphrase) return;
    const payload = await exportDatabase(passphrase ?? undefined);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `worth-it-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const text = await file.text();
      const needsPassphrase = text.includes('\"encrypted\":true');
      const passphrase = needsPassphrase ? window.prompt('Enter vault passphrase') ?? undefined : undefined;
      await importDatabase(text, passphrase);
      window.location.reload();
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Stale accounts</h2>
        <div className="space-y-2">
          {view.staleAccounts.length === 0 && (
            <div className="rounded-2xl bg-panel p-4 text-sm text-muted">All accounts are fresh.</div>
          )}
          {view.staleAccounts.map((account) => (
            <div key={account.id} className="flex items-center justify-between rounded-2xl bg-panel p-4">
              <div>
                <div className="text-sm font-medium">{account.name}</div>
                <div className="text-xs text-muted">Suggested cadence: {data.settings.stalenessRulesByType[account.type]} days</div>
              </div>
              <button className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-black">
                Update
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Recent changes</h2>
        <div className="rounded-2xl bg-panel p-4 text-sm text-muted">
          {view.recentSnapshots.map((snap) => (
            <div key={snap.id} className="flex items-center justify-between border-b border-white/5 py-2 last:border-none">
              <span>{snap.asOfDate}</span>
              <span>{formatCurrency(snap.balanceMinorUnits, snap.currency, data.settings.locale)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Date range compare</h2>
        <div className="rounded-2xl bg-panel p-4 space-y-3">
          <div className="flex flex-wrap gap-3">
            <label className="text-xs text-muted">
              From
              <input
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
                className="mt-1 block rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-white"
              />
            </label>
            <label className="text-xs text-muted">
              To
              <input
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
                className="mt-1 block rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-white"
              />
            </label>
          </div>
          <div className="text-sm text-muted">
            Net worth delta: {formatCurrency(view.delta.totalDelta, data.settings.baseCurrency, data.settings.locale)}
          </div>
          <div className="text-sm text-muted">
            Percent delta: {percentDelta === null ? 'Unknown' : `${(percentDelta * 100).toFixed(1)}%`}
          </div>
        </div>
        <ExplainDeltaPanel result={view.delta} baseCurrency={data.settings.baseCurrency} locale={data.settings.locale} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Backup & Vault</h2>
        <div className="rounded-2xl bg-panel p-4 space-y-3 text-sm text-muted">
          <p>Export your data as JSON. Vault exports encrypt the payload locally with a passphrase.</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleExport(false)}
              className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white"
            >
              Export JSON
            </button>
            <button
              onClick={() => handleExport(true)}
              className="rounded-full bg-accent px-4 py-2 text-xs font-semibold text-black"
            >
              Export Vault (encrypted)
            </button>
            <button
              onClick={handleImport}
              className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white"
            >
              Import
            </button>
          </div>
          <p className="text-xs text-muted">
            Vault mode keeps the encryption key only in memory. Forgetting your passphrase means the data is unrecoverable.
          </p>
        </div>
      </section>
    </div>
  );
}
