export function formatCurrency(
  amountMinorUnits: number,
  currency: string,
  locale: string
) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(amountMinorUnits / 100);
}

export function formatPercent(value: number | null) {
  if (value === null || Number.isNaN(value)) return '—';
  return `${(value * 100).toFixed(1)}%`;
}

export function formatDaysAgo(date: string) {
  const diff = Date.now() - new Date(`${date}T00:00:00Z`).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'Today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}
