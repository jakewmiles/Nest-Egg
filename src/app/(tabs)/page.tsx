'use client';

import { useMemo, useState } from 'react';
import AccountCard from '@/components/AccountCard';
import ExplainDeltaPanel from '@/components/ExplainDeltaPanel';
import LineChart from '@/components/LineChart';
import RangeChips, { type RangeKey } from '@/components/RangeChips';
import { formatCurrency, formatPercent } from '@/lib/format';
import { useData } from '@/lib/useData';
import { buildNetWorthSeries } from '@/lib/series';
import { explainDelta, netWorthAtDate } from '@/lib/math';
import { rangeToDates } from '@/lib/date';

export default function AccountsPage() {
  const data = useData();
  const [range, setRange] = useState<RangeKey>('6m');
  const [includeDebts, setIncludeDebts] = useState(true);
  const [includeHidden, setIncludeHidden] = useState(false);
  const [includedTags, setIncludedTags] = useState<string[]>([]);
  const [showExplain, setShowExplain] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showFab, setShowFab] = useState(false);

  const tags = useMemo(() => {
    if (!data) return [];
    const tagSet = new Set<string>();
    data.accounts.forEach((account) => account.tags.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet);
  }, [data]);

  const view = useMemo(() => {
    if (!data) return null;
    const rangeDates = rangeToDates(range);
    const filteredAccounts = data.accounts.filter((account) => {
      if (!includeDebts && account.type === 'debt') return false;
      if (!includeHidden && (account.hidden || account.archived)) return false;
      if (includedTags.length === 0) return true;
      return account.tags.some((tag) => includedTags.includes(tag));
    });

    const series = buildNetWorthSeries(
      filteredAccounts,
      data.snapshots,
      data.fxRates,
      data.settings.baseCurrency,
      data.settings.assumeFxOneToOne,
      rangeDates
    );

    const endValue = netWorthAtDate(
      filteredAccounts,
      data.snapshots,
      data.fxRates,
      rangeDates.end,
      data.settings.baseCurrency,
      data.settings.assumeFxOneToOne
    );

    const startValue = netWorthAtDate(
      filteredAccounts,
      data.snapshots,
      data.fxRates,
      rangeDates.start,
      data.settings.baseCurrency,
      data.settings.assumeFxOneToOne
    );

    const delta = endValue.valueMinorUnits - startValue.valueMinorUnits;
    const percent = startValue.valueMinorUnits !== 0 ? delta / startValue.valueMinorUnits : null;

    return {
      series,
      endValue: endValue.valueMinorUnits,
      delta,
      percent,
      rangeDates,
      missingFx: endValue.missingFxAccounts
    };
  }, [data, range, includeDebts, includedTags]);

  if (!data || !view) {
    return <div className="text-muted">Loading your net worth…</div>;
  }

  const selectedPoint = view.series[selectedIndex] ?? view.series[view.series.length - 1];
  const explain = explainDelta(
    data.accounts,
    data.snapshots,
    data.cashflows,
    data.fxRates,
    data.settings.baseCurrency,
    view.rangeDates.start,
    view.rangeDates.end,
    { includedTags, includeDebts, includeHidden },
    data.settings.assumeFxOneToOne
  );

  return (
    <>
      <section className="space-y-4">
        <div className="rounded-3xl bg-panel p-6">
          <div className="text-xs uppercase text-muted">Net worth</div>
          <div className="mt-2 text-3xl font-semibold">
            {formatCurrency(view.endValue, data.settings.baseCurrency, data.settings.locale)}
          </div>
          <div className="mt-1 text-sm text-muted">
            {formatCurrency(view.delta, data.settings.baseCurrency, data.settings.locale)} ({formatPercent(view.percent)})
          </div>
          {view.missingFx.length > 0 && (
            <div className="mt-3 text-xs text-danger">
              FX missing for some accounts. Totals exclude them unless you assume 1:1.
            </div>
          )}
        </div>
        <RangeChips value={range} onChange={setRange} />
        <LineChart
          points={view.series.map((point) => ({
            label: point.date.slice(5),
            value: point.valueMinorUnits / 100
          }))}
        />
        <div className="rounded-2xl bg-panel p-4">
          <div className="flex items-center justify-between text-sm text-muted">
            <span>Scrub date</span>
            <span>{selectedPoint?.date}</span>
          </div>
          <input
            type="range"
            min={0}
            max={Math.max(view.series.length - 1, 0)}
            value={selectedIndex}
            onChange={(event) => setSelectedIndex(Number(event.target.value))}
            className="mt-3 w-full accent-accent"
          />
          <div className="mt-3 text-xl font-semibold">
            {formatCurrency(
              (selectedPoint?.valueMinorUnits ?? 0) as number,
              data.settings.baseCurrency,
              data.settings.locale
            )}
          </div>
          <button
            onClick={() => setShowExplain((prev) => !prev)}
            className="mt-3 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-black"
          >
            {showExplain ? 'Hide' : 'What changed?'}
          </button>
        </div>
        {showExplain && (
          <ExplainDeltaPanel
            result={explain}
            baseCurrency={data.settings.baseCurrency}
            locale={data.settings.locale}
          />
        )}
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Accounts</h2>
          <div className="flex items-center gap-2 text-xs text-muted">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeDebts}
                onChange={(event) => setIncludeDebts(event.target.checked)}
                className="accent-accent"
              />
              Include debts
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeHidden}
                onChange={(event) => setIncludeHidden(event.target.checked)}
                className="accent-accent"
              />
              Include hidden
            </label>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => {
            const active = includedTags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() =>
                  setIncludedTags((prev) =>
                    prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
                  )
                }
                className={`rounded-full px-3 py-1 text-xs ${
                  active ? 'bg-accent text-black' : 'bg-white/10 text-muted'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
        <div className="space-y-3">
          {data.accounts
            .filter((account) => includeHidden || (!account.hidden && !account.archived))
            .filter((account) => (includeDebts ? true : account.type !== 'debt'))
            .filter((account) =>
              includedTags.length === 0
                ? true
                : account.tags.some((tag) => includedTags.includes(tag))
            )
            .map((account) => {
              const latest = data.snapshots
                .filter((snap) => snap.accountId === account.id)
                .sort((a, b) => (a.asOfDate > b.asOfDate ? -1 : 1))[0];
              const stalenessRule = data.settings.stalenessRulesByType[account.type];
              const lastUpdate = latest?.asOfDate ?? account.updatedAt;
              const daysSince = Math.floor(
                (Date.now() - new Date(`${lastUpdate}T00:00:00Z`).getTime()) / (1000 * 60 * 60 * 24)
              );
              const baseBalance = latest
                ? netWorthAtDate(
                    [account],
                    data.snapshots,
                    data.fxRates,
                    latest.asOfDate,
                    data.settings.baseCurrency,
                    data.settings.assumeFxOneToOne
                  ).valueMinorUnits
                : 0;
              const nativeBalance = latest?.balanceMinorUnits ?? 0;
              return (
                <AccountCard
                  key={account.id}
                  account={account}
                  baseBalanceMinorUnits={baseBalance}
                  nativeBalanceMinorUnits={nativeBalance}
                  locale={data.settings.locale}
                  baseCurrency={data.settings.baseCurrency}
                  nativeCurrency={account.currency}
                  isStale={daysSince > stalenessRule}
                />
              );
            })}
        </div>
      </section>

      <div className="fixed bottom-24 right-6 flex flex-col items-end gap-2">
        {showFab && (
          <div className="space-y-2 text-right text-xs text-muted">
            <button className="block rounded-full bg-panel px-3 py-2 text-white shadow">
              Add account
            </button>
            <button className="block rounded-full bg-panel px-3 py-2 text-white shadow">
              Add/update snapshot
            </button>
            <button className="block rounded-full bg-panel px-3 py-2 text-white shadow">
              Add cashflow
            </button>
          </div>
        )}
        <button
          onClick={() => setShowFab((prev) => !prev)}
          className="rounded-full bg-accent px-4 py-3 text-lg font-bold text-black shadow-lg"
        >
          +
        </button>
      </div>
    </>
  );
}
