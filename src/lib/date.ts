import type { RangeKey } from '@/components/RangeChips';

export function rangeToDates(range: RangeKey) {
  const end = new Date();
  const start = new Date(end);
  switch (range) {
    case '1m':
      start.setMonth(end.getMonth() - 1);
      break;
    case '6m':
      start.setMonth(end.getMonth() - 6);
      break;
    case '1y':
      start.setFullYear(end.getFullYear() - 1);
      break;
    case 'ytd':
      start.setMonth(0, 1);
      break;
    case 'all':
    default:
      start.setFullYear(end.getFullYear() - 5);
      break;
  }
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10)
  };
}
