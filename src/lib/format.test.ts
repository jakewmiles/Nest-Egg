import { jest } from '@jest/globals';
import { formatCurrency, formatDaysAgo, formatPercent } from './format';

describe('formatCurrency', () => {
  it('formats minor units as whole currency', () => {
    expect(formatCurrency(12345, 'USD', 'en-US')).toBe('$123');
  });
});

describe('formatPercent', () => {
  it('formats a percent with one decimal', () => {
    expect(formatPercent(0.1234)).toBe('12.3%');
  });

  it('returns em dash for null or NaN', () => {
    expect(formatPercent(null)).toBe('—');
    expect(formatPercent(Number.NaN)).toBe('—');
  });
});

describe('formatDaysAgo', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-05T00:00:00Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('returns Today when date matches the current day', () => {
    expect(formatDaysAgo('2024-01-05')).toBe('Today');
  });

  it('returns singular day for yesterday', () => {
    expect(formatDaysAgo('2024-01-04')).toBe('1 day ago');
  });

  it('returns multiple days for earlier dates', () => {
    expect(formatDaysAgo('2024-01-01')).toBe('4 days ago');
  });
});
