export type AccountType =
  | 'cash'
  | 'equity'
  | 'crypto'
  | 'real_estate'
  | 'pension'
  | 'other'
  | 'debt';

export type Liquidity = 'accessible' | 'restricted';
export type ValuationMethod = 'manual' | 'price_feed' | 'manual_fx';

export type Settings = {
  id: string;
  baseCurrency: string;
  locale: string;
  theme: 'dark' | 'light';
  stalenessRulesByType: Record<AccountType, number>;
  goalAmount?: number;
  goalCurrency?: string;
  vaultEnabled: boolean;
  lastExportAt?: string;
  assumeFxOneToOne: boolean;
};

export type Account = {
  id: string;
  name: string;
  type: AccountType;
  currency: string;
  tags: string[];
  liquidity: Liquidity;
  ownershipPercent: number;
  valuationMethod: ValuationMethod;
  linkUrl?: string;
  notes?: string;
  hidden: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Snapshot = {
  id: string;
  accountId: string;
  asOfDate: string;
  balanceMinorUnits: number;
  currency: string;
  source: 'manual' | 'import';
  createdAt: string;
};

export type Cashflow = {
  id: string;
  accountId: string;
  date: string;
  amountMinorUnits: number;
  currency: string;
  memo?: string;
};

export type FxRate = {
  id: string;
  base: string;
  quote: string;
  date: string;
  rate: number;
};

export type PricePoint = {
  id: string;
  symbol: string;
  dateTimeISO: string;
  price: number;
  currency: string;
  source: string;
};

export type ExplainFilters = {
  includedTags: string[];
  includeDebts: boolean;
  includeHidden: boolean;
};

export type ExplainAccountRow = {
  accountId: string;
  name: string;
  tagGroup: string;
  valueA: number;
  valueB: number;
  delta: number;
  percentChange: number | null;
  moneyMoved?: number;
  marketChange?: number;
};

export type ExplainTagRow = {
  tag: string;
  valueA: number;
  valueB: number;
  delta: number;
};

export type ExplainDeltaResult = {
  totalDelta: number;
  accountRows: ExplainAccountRow[];
  tagRows: ExplainTagRow[];
  missingFxAccounts: string[];
  moneyMovedAvailable: boolean;
};
