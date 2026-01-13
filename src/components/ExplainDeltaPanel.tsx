import type { ExplainDeltaResult } from '@/lib/types';
import { formatCurrency, formatPercent } from '@/lib/format';

export default function ExplainDeltaPanel({
  result,
  baseCurrency,
  locale
}: {
  result: ExplainDeltaResult;
  baseCurrency: string;
  locale: string;
}) {
  return (
    <div className="rounded-2xl bg-panel p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase text-muted">Total change</div>
          <div className="text-xl font-semibold">
            {formatCurrency(result.totalDelta, baseCurrency, locale)}
          </div>
        </div>
        {result.missingFxAccounts.length > 0 && (
          <span className="rounded-full bg-danger/20 px-2 py-1 text-xs text-danger">
            FX missing
          </span>
        )}
      </div>
      <div className="mt-4 space-y-3">
        {result.accountRows.map((row) => (
          <div key={row.accountId} className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-medium">{row.name}</div>
              <div className="text-xs text-muted">{row.tagGroup}</div>
              {result.moneyMovedAvailable ? (
                <div className="mt-1 text-xs text-muted">
                  {row.moneyMoved === undefined
                    ? 'Money moved: unknown'
                    : `Money moved: ${formatCurrency(row.moneyMoved, baseCurrency, locale)}`}
                  {row.marketChange !== undefined && (
                    <span className="ml-2">Market: {formatCurrency(row.marketChange, baseCurrency, locale)}</span>
                  )}
                </div>
              ) : (
                <div className="mt-1 text-xs text-muted">Add cashflows to split deposits vs market</div>
              )}
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold">
                {formatCurrency(row.delta, baseCurrency, locale)}
              </div>
              <div className="text-xs text-muted">{formatPercent(row.percentChange)}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 border-t border-white/10 pt-3">
        <div className="text-xs uppercase text-muted">By tag</div>
        <div className="mt-2 space-y-2">
          {result.tagRows.map((row) => (
            <div key={row.tag} className="flex items-center justify-between text-sm">
              <span>{row.tag}</span>
              <span>{formatCurrency(row.delta, baseCurrency, locale)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
