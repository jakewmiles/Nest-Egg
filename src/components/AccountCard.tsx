import Link from 'next/link';
import type { Account } from '@/lib/types';
import { formatCurrency, formatDaysAgo } from '@/lib/format';

const iconByType: Record<Account['type'], string> = {
  cash: '💷',
  equity: '📈',
  crypto: '🪙',
  real_estate: '🏠',
  pension: '🧾',
  other: '🧰',
  debt: '📉'
};

export default function AccountCard({
  account,
  baseBalanceMinorUnits,
  nativeBalanceMinorUnits,
  locale,
  baseCurrency,
  nativeCurrency,
  isStale
}: {
  account: Account;
  baseBalanceMinorUnits: number;
  nativeBalanceMinorUnits: number;
  locale: string;
  baseCurrency: string;
  nativeCurrency: string;
  isStale: boolean;
}) {
  return (
    <Link href={`/accounts?id=${account.id}`} className="block rounded-2xl bg-panel p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted">
            <span>{iconByType[account.type]}</span>
            <span>{account.name}</span>
          </div>
          <div className="mt-2 text-lg font-semibold">
            {formatCurrency(baseBalanceMinorUnits, baseCurrency, locale)}
          </div>
          <div className="text-xs text-muted">
            {formatCurrency(nativeBalanceMinorUnits, nativeCurrency, locale)}
          </div>
        </div>
        {isStale ? (
          <span className="rounded-full bg-danger/20 px-2 py-1 text-xs text-danger">Stale</span>
        ) : (
          <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-muted">Fresh</span>
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
        {account.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-white/10 px-2 py-1">
            {tag}
          </span>
        ))}
        <span>Updated {formatDaysAgo(account.updatedAt)}</span>
      </div>
    </Link>
  );
}
