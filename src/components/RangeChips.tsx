'use client';

const ranges = [
  { label: '1m', value: '1m' },
  { label: '6m', value: '6m' },
  { label: 'YTD', value: 'ytd' },
  { label: '1y', value: '1y' },
  { label: 'All', value: 'all' }
];

export type RangeKey = (typeof ranges)[number]['value'];

export default function RangeChips({
  value,
  onChange
}: {
  value: RangeKey;
  onChange: (value: RangeKey) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {ranges.map((range) => (
        <button
          key={range.value}
          onClick={() => onChange(range.value)}
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            value === range.value ? 'bg-accent text-black' : 'bg-white/10 text-muted'
          }`}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}
