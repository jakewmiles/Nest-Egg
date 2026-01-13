# Worth It

Offline-first, single-user net worth tracker built for fast, explainable updates.

## Features (V1)
- Accounts, Insights, Update tabs with explainable deltas.
- IndexedDB via Dexie with typed schema + seed data.
- PWA installable app shell with offline caching.
- Export/Import JSON and optional Vault encryption.

## Run locally
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run start
```

## Deploy
- Works on any Node hosting that supports Next.js.
- `npm run build` then `npm run start`.

## Math spec (core rules)
- **Value at date D**: latest snapshot on/before D per account.
- **FX conversion**: convert snapshot currency to base using latest FX rate on/before D.
  - If FX is missing and "assume 1:1" is off, the account is excluded and flagged as missing FX.
- **Net worth at D**: sum of account values at D.
- **Period delta**: `netWorth(B) - netWorth(A)`.
- **Explain delta**:
  - Per-account delta is `value(B) - value(A)`.
  - Money moved = sum of cashflows within (A, B].
  - Market change = `delta - money moved` when cashflows are present; otherwise show **unknown**.

## Seed data
The first run seeds demo accounts, snapshots, cashflows, and FX rates to make the UI immediately populated.

