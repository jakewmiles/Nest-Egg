import { jest } from '@jest/globals';
import { rangeToDates } from './date';

describe('rangeToDates', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-07-10T00:00:00Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('returns start and end dates for 1m range', () => {
    const result = rangeToDates('1m');
    expect(result).toEqual({ start: '2024-06-10', end: '2024-07-10' });
  });

  it('returns start and end dates for ytd range', () => {
    const result = rangeToDates('ytd');
    expect(result).toEqual({ start: '2024-01-01', end: '2024-07-10' });
  });
});
