'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import BarChart from '@/components/BarChart';
import MultiLineChart from '@/components/MultiLineChart';
import { formatCurrency } from '@/lib/format';
import { explainDelta, netWorthAtDate } from '@/lib/math';
import { useData } from '@/lib/useData';

const formatMonth = (date: Date) =>
  date.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });

export default function InsightsPage() {
  const data = useData();

  const view = useMemo(() => {
    if (!data) return null;
    const end = new Date();
    const monthStart = new Date(end.getFullYear(), end.getMonth() - 1, end.getDate());
    const months: { label: string; date: string }[] = [];
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(end.getFullYear(), end.getMonth() - i, 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      months.push({ label: formatMonth(d), date: monthEnd.toISOString().slice(0, 10) });
    }

    const netWorthByMonth = months.map((month) =>
      netWorthAtDate(
        data.accounts,
        data.snapshots,
        data.fxRates,
        month.date,
        data.settings.baseCurrency,
        data.settings.assumeFxOneToOne
      ).valueMinorUnits
    );

    const monthlyChanges = netWorthByMonth.map((value, index) => {
      if (index === 0) return 0;
      return value - netWorthByMonth[index - 1];
    });

    const assets = netWorthAtDate(
      data.accounts.filter((account) => account.type !== 'debt'),
      data.snapshots,
      data.fxRates,
      months[months.length - 1].date,
      data.settings.baseCurrency,
      data.settings.assumeFxOneToOne
    ).valueMinorUnits;

    const debts = Math.abs(
      netWorthAtDate(
        data.accounts.filter((account) => account.type === 'debt'),
        data.snapshots,
        data.fxRates,
        months[months.length - 1].date,
        data.settings.baseCurrency,
        data.settings.assumeFxOneToOne
      ).valueMinorUnits
    );

    const ratio = assets > 0 ? debts / assets : null;

    const goalAmount = data.settings.goalAmount ?? 0;
    const hasGoal = goalAmount > 0;
    const latestValue = netWorthByMonth[netWorthByMonth.length - 1];
    const distanceToGoal = hasGoal ? goalAmount - latestValue : null;

    const sixMonthsChange = monthlyChanges.slice(-6).reduce((sum, v) => sum + v, 0) / 6;
    const timeToGoal =
      hasGoal && monthlyChanges.length >= 6 && sixMonthsChange > 0
        ? Math.ceil(distanceToGoal! / sixMonthsChange)
        : null;

    const movers = explainDelta(
      data.accounts,
      data.snapshots,
      data.cashflows,
      data.fxRates,
      data.settings.baseCurrency,
      monthStart.toISOString().slice(0, 10),
      end.toISOString().slice(0, 10),
      { includedTags: [], includeDebts: true, includeHidden: false },
      data.settings.assumeFxOneToOne
    ).accountRows;

    return {
      months,
      netWorthByMonth,
      monthlyChanges,
      assets,
      debts,
      ratio,
      goalAmount,
      hasGoal,
      distanceToGoal,
      timeToGoal,
      movers
    };
  }, [data]);

  if (!data || !view) {
    return <div className="text-muted">Loading insights…</div>;
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Monthly change</h2>
        <BarChart
          points={view.months.map((month, index) => ({
            label: month.label,
            value: view.monthlyChanges[index] / 100
          }))}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Assets vs Debts</h2>
        <div className="rounded-2xl bg-panel p-5">
          <div className="flex items-center justify-between text-sm">
            <span>Assets</span>
            <span>{formatCurrency(view.assets, data.settings.baseCurrency, data.settings.locale)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span>Debts</span>
            <span>{formatCurrency(-view.debts, data.settings.baseCurrency, data.settings.locale)}</span>
          </div>
          <div className="mt-3 text-xs text-muted">
            Debt-to-asset ratio: {view.ratio ? view.ratio.toFixed(2) : 'Unknown'}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Goal line</h2>
        <MultiLineChart
          labels={view.months.map((month) => month.label)}
          datasets={[
            {
              label: 'Net worth',
              data: view.netWorthByMonth.map((value) => value / 100),
              borderColor: '#8bd3ff',
              backgroundColor: 'rgba(139, 211, 255, 0.2)'
            },
            {
              label: 'Goal',
              data: view.months.map(() => view.goalAmount / 100),
              borderColor: '#fbbf24',
              backgroundColor: 'rgba(251, 191, 36, 0.2)',
              borderDash: [6, 6]
            }
          ]}
        />
        <div className="rounded-2xl bg-panel p-5 text-sm text-muted">
          <div>
            Distance to goal:{' '}
            {view.hasGoal
              ? formatCurrency(view.distanceToGoal ?? 0, data.settings.baseCurrency, data.settings.locale)
              : 'Set a goal in Settings'}
          </div>
          <div className="mt-2">
            Rough time to goal:{' '}
            {view.timeToGoal
              ? `${view.timeToGoal} months (rolling 6-month average)`
              : 'Unknown (need 6 months of data)'}
          </div>
          <p className="mt-2 text-xs text-muted">
            This is a rough estimate using the rolling-average monthly change. It is not a forecast.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Largest movers</h2>
        <div className="rounded-2xl bg-panel p-5 text-sm text-muted space-y-2">
          {view.movers.map((row) => (
            <div key={row.accountId} className="flex items-center justify-between">
              <div className="flex flex-col">
                <span>{row.name}</span>
                <Link href="/update" className="text-xs text-accent">
                  Explain
                </Link>
              </div>
              <span>{formatCurrency(row.delta, data.settings.baseCurrency, data.settings.locale)}</span>
            </div>
          ))}
          <p className="text-xs text-muted">Based on the last 30 days.</p>
        </div>
      </section>
    </div>
  );
}
