import { jest } from '@jest/globals';

describe('generateSeedData', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T00:00:00Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('creates deterministic seed data across collections', async () => {
    const { generateSeedData } = await import('./seed');
    const seed = generateSeedData();

    expect(seed.accounts).toHaveLength(4);
    expect(seed.snapshots).toHaveLength(48);
    expect(seed.cashflows).toHaveLength(12);
    expect(seed.fxRates).toHaveLength(12);

    const firstSnapshot = seed.snapshots[0];
    expect(firstSnapshot.asOfDate).toBe('2023-02-15');
    expect(firstSnapshot.createdAt).toBe('2023-02-15');
    expect(firstSnapshot.id).toContain('2023-02-15');
  });
});
