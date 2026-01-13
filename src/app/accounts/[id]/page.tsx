'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import LineChart from '@/components/LineChart';
import RangeChips, { type RangeKey } from '@/components/RangeChips';
import { formatCurrency } from '@/lib/format';
import { accountValueAtDate, explainDelta } from '@/lib/math';
import { rangeToDates } from '@/lib/date';
import { useData } from '@/lib/useData';

export default function AccountDetailPage() {
  const params = useParams<{ id: string }>();
  const data = useData();
  const [range, setRange] = useState<RangeKey>('6m');

  const account = data?.accounts.find((item) => item.id === params.id);

  const view = useMemo(() => {
    if (!data || !account) return null;
    const rangeDates = rangeToDates(range);
    const snapshots = data.snapshots.filter((snap) => snap.accountId === account.id);
    const series = snapshots.map((snap) => ({
      label: snap.asOfDate.slice(5),
      value: snap.balanceMinorUnits / 100
    }));
    const value = accountValueAtDate(
      account,
      data.snapshots,
      data.fxRates,
      rangeDates.end,
      data.settings.baseCurrency,
      data.settings.assumeFxOneToOne
    );
    const explain = explainDelta(
      [account],
      data.snapshots,
      data.cashflows,
      data.fxRates,
      data.settings.baseCurrency,
      rangeDates.start,
      rangeDates.end,
      { includedTags: [], includeDebts: true, includeHidden: true },
      data.settings.assumeFxOneToOne
    );

    return { rangeDates, series, value, explain };
  }, [data, account, range]);

  if (!data || !account || !view) {
    return <div className="px-4 py-6 text-muted">Account not found.</div>;
  }

  const latestSnapshot = data.snapshots
    .filter((snap) => snap.accountId === account.id)
    .sort((a, b) => (a.asOfDate > b.asOfDate ? -1 : 1))[0];

  const cadence =
    account.type === 'crypto'
      ? 'Every 3 days'
      : account.type === 'equity'
      ? 'Weekly'
      : account.type === 'real_estate'
      ? 'Monthly'
      : 'Monthly';

  return (
    <div className="space-y-6 px-4 pb-24 pt-6">
      <header className="space-y-1">
        <div className="text-xs uppercase text-muted">{account.type}</div>
        <h1 className="text-2xl font-semibold">{account.name}</h1>
        <div className="text-sm text-muted">{account.currency}</div>
      </header>

      <section className="rounded-2xl bg-panel p-5">
        <div className="text-xs uppercase text-muted">Balance</div>
        <div className="mt-2 text-2xl font-semibold">
          {formatCurrency(latestSnapshot?.balanceMinorUnits ?? 0, account.currency, data.settings.locale)}
        </div>
        <div className="mt-1 text-sm text-muted">
          Base: {formatCurrency(view.value.valueMinorUnits, data.settings.baseCurrency, data.settings.locale)}
        </div>
        <div className="mt-2 text-sm text-muted">
          Updated {latestSnapshot?.asOfDate ?? 'Unknown'}
        </div>
      </section>

      <RangeChips value={range} onChange={setRange} />
      <LineChart points={view.series} />

      <section className="rounded-2xl bg-panel p-5">
        <div className="text-xs uppercase text-muted">Explain change</div>
        <div className="mt-2 text-sm text-muted">
          Total change: {formatCurrency(view.explain.totalDelta, data.settings.baseCurrency, data.settings.locale)}
        </div>
        <div className="mt-3 grid gap-2 text-sm text-muted">
          <div className="flex items-center justify-between">
            <span>Money moved</span>
            <span>
              {view.explain.moneyMovedAvailable
                ? formatCurrency(view.explain.accountRows[0]?.moneyMoved ?? 0, data.settings.baseCurrency, data.settings.locale)
                : 'Unknown'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Market change</span>
            <span>
              {view.explain.moneyMovedAvailable
                ? formatCurrency(view.explain.accountRows[0]?.marketChange ?? 0, data.settings.baseCurrency, data.settings.locale)
                : 'Unknown'}
            </span>
          </div>
          {!view.explain.moneyMovedAvailable && (
            <div className="text-xs text-muted">
              Add cashflows to split deposits vs market.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl bg-panel p-5">
        <div className="text-xs uppercase text-muted">Staleness</div>
        <div className="mt-2 text-sm text-muted">Suggested cadence: {cadence}</div>
        <button className="mt-3 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-black">
          Add snapshot for today
        </button>
      </section>

      <section className="rounded-2xl bg-panel p-5">
        <div className="text-xs uppercase text-muted">Notes</div>
        <p className="mt-2 text-sm text-muted">{account.notes ?? 'Add a short note here.'}</p>
        {account.linkUrl && (
          <a className="mt-2 inline-block text-sm text-accent" href={account.linkUrl}>
            Open institution link
          </a>
        )}
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl bg-panel p-4">
          <div className="text-xs uppercase text-muted">Liquidity</div>
          <div className="mt-2 text-sm font-semibold">{account.liquidity}</div>
        </div>
        <div className="rounded-2xl bg-panel p-4">
          <div className="text-xs uppercase text-muted">Ownership</div>
          <div className="mt-2 text-sm font-semibold">{account.ownershipPercent}%</div>
        </div>
        <div className="rounded-2xl bg-panel p-4">
          <div className="text-xs uppercase text-muted">Valuation</div>
          <div className="mt-2 text-sm font-semibold">{account.valuationMethod.replace('_', ' ')}</div>
        </div>
      </section>
    </div>
  );
}
