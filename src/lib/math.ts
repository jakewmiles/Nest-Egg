import type {
  Account,
  Cashflow,
  ExplainDeltaResult,
  ExplainFilters,
  FxRate,
  Snapshot
} from './types';

export type FxLookupResult = {
  rate: number | null;
  usedAssumption: boolean;
};

const parseDate = (value: string) => new Date(`${value}T00:00:00Z`).getTime();

export function fxConversion(
  amountMinorUnits: number,
  currency: string,
  baseCurrency: string,
  fxRates: FxRate[],
  asOfDate: string,
  assumeFxOneToOne: boolean
): { amountMinorUnits: number; missingFx: boolean } {
  if (currency === baseCurrency) {
    return { amountMinorUnits, missingFx: false };
  }

  const rate = findFxRate(currency, baseCurrency, fxRates, asOfDate);
  if (!rate) {
    if (assumeFxOneToOne) {
      return { amountMinorUnits, missingFx: true };
    }
    return { amountMinorUnits: 0, missingFx: true };
  }

  return {
    amountMinorUnits: Math.round(amountMinorUnits * rate.rate),
    missingFx: false
  };
}

export function findFxRate(
  base: string,
  quote: string,
  fxRates: FxRate[],
  asOfDate: string
): FxRate | null {
  const targetTime = parseDate(asOfDate);
  const filtered = fxRates
    .filter((rate) => rate.base === base && rate.quote === quote)
    .filter((rate) => parseDate(rate.date) <= targetTime)
    .sort((a, b) => parseDate(b.date) - parseDate(a.date));
  return filtered[0] ?? null;
}

export function accountValueAtDate(
  account: Account,
  snapshots: Snapshot[],
  fxRates: FxRate[],
  asOfDate: string,
  baseCurrency: string,
  assumeFxOneToOne: boolean
): { valueMinorUnits: number; missingFx: boolean; hasData: boolean } {
  const targetTime = parseDate(asOfDate);
  const snapshot = snapshots
    .filter((item) => item.accountId === account.id)
    .filter((item) => parseDate(item.asOfDate) <= targetTime)
    .sort((a, b) => parseDate(b.asOfDate) - parseDate(a.asOfDate))[0];

  if (!snapshot) {
    return { valueMinorUnits: 0, missingFx: false, hasData: false };
  }

  const converted = fxConversion(
    snapshot.balanceMinorUnits,
    snapshot.currency,
    baseCurrency,
    fxRates,
    snapshot.asOfDate,
    assumeFxOneToOne
  );

  return {
    valueMinorUnits: converted.amountMinorUnits,
    missingFx: converted.missingFx,
    hasData: true
  };
}

export function netWorthAtDate(
  accounts: Account[],
  snapshots: Snapshot[],
  fxRates: FxRate[],
  asOfDate: string,
  baseCurrency: string,
  assumeFxOneToOne: boolean
): { valueMinorUnits: number; missingFxAccounts: string[] } {
  const missingFxAccounts: string[] = [];
  const valueMinorUnits = accounts.reduce((total, account) => {
    const result = accountValueAtDate(
      account,
      snapshots,
      fxRates,
      asOfDate,
      baseCurrency,
      assumeFxOneToOne
    );
    if (result.missingFx) missingFxAccounts.push(account.id);
    return total + result.valueMinorUnits;
  }, 0);

  return { valueMinorUnits, missingFxAccounts };
}

export function explainDelta(
  accounts: Account[],
  snapshots: Snapshot[],
  cashflows: Cashflow[],
  fxRates: FxRate[],
  baseCurrency: string,
  dateA: string,
  dateB: string,
  filters: ExplainFilters,
  assumeFxOneToOne: boolean
): ExplainDeltaResult {
  const missingFxAccounts: string[] = [];
  const includedAccounts = accounts.filter((account) => {
    if (!filters.includeDebts && account.type === 'debt') return false;
    if (!filters.includeHidden && (account.hidden || account.archived)) return false;
    if (filters.includedTags.length === 0) return true;
    return account.tags.some((tag) => filters.includedTags.includes(tag));
  });

  const accountRows = includedAccounts.map((account) => {
    const valueA = accountValueAtDate(
      account,
      snapshots,
      fxRates,
      dateA,
      baseCurrency,
      assumeFxOneToOne
    );
    const valueB = accountValueAtDate(
      account,
      snapshots,
      fxRates,
      dateB,
      baseCurrency,
      assumeFxOneToOne
    );

    if (valueA.missingFx || valueB.missingFx) {
      missingFxAccounts.push(account.id);
    }

    const delta = valueB.valueMinorUnits - valueA.valueMinorUnits;
    const percentChange = valueA.valueMinorUnits !== 0
      ? delta / valueA.valueMinorUnits
      : null;

    const flows = cashflows.filter(
      (flow) =>
        flow.accountId === account.id &&
        parseDate(flow.date) > parseDate(dateA) &&
        parseDate(flow.date) <= parseDate(dateB)
    );

    let moneyMoved: number | undefined;
    let marketChange: number | undefined;

    if (flows.length > 0) {
      const totalFlow = flows.reduce((sum, flow) => {
        const converted = fxConversion(
          flow.amountMinorUnits,
          flow.currency,
          baseCurrency,
          fxRates,
          flow.date,
          assumeFxOneToOne
        );
        if (converted.missingFx) missingFxAccounts.push(account.id);
        return sum + converted.amountMinorUnits;
      }, 0);
      moneyMoved = totalFlow;
      marketChange = delta - totalFlow;
    }

    return {
      accountId: account.id,
      name: account.name,
      tagGroup: account.tags[0] ?? account.type,
      valueA: valueA.valueMinorUnits,
      valueB: valueB.valueMinorUnits,
      delta,
      percentChange,
      moneyMoved,
      marketChange
    };
  });

  const tagGroups = new Map<string, { valueA: number; valueB: number }> ();
  accountRows.forEach((row) => {
    const key = row.tagGroup;
    const current = tagGroups.get(key) ?? { valueA: 0, valueB: 0 };
    tagGroups.set(key, {
      valueA: current.valueA + row.valueA,
      valueB: current.valueB + row.valueB
    });
  });

  const tagRows = Array.from(tagGroups.entries()).map(([tag, values]) => ({
    tag,
    valueA: values.valueA,
    valueB: values.valueB,
    delta: values.valueB - values.valueA
  }));

  const totalDelta = accountRows.reduce((sum, row) => sum + row.delta, 0);
  const moneyMovedAvailable = accountRows.some((row) => row.moneyMoved !== undefined);

  return {
    totalDelta,
    accountRows: accountRows.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 10),
    tagRows,
    missingFxAccounts: Array.from(new Set(missingFxAccounts)),
    moneyMovedAvailable
  };
}
