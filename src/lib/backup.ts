import { db, defaultSettings } from './db';
import type { Settings } from './types';

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

async function deriveKey(passphrase: string, salt: Uint8Array) {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 310000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

const toBase64 = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes));

const fromBase64 = (value: string) =>
  Uint8Array.from(atob(value), (char) => char.charCodeAt(0));

async function encryptPayload(payload: string, passphrase: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, textEncoder.encode(payload));
  return {
    salt: toBase64(salt),
    iv: toBase64(iv),
    data: toBase64(new Uint8Array(cipher))
  };
}

async function decryptPayload(payload: { salt: string; iv: string; data: string }, passphrase: string) {
  const salt = fromBase64(payload.salt);
  const iv = fromBase64(payload.iv);
  const data = fromBase64(payload.data);
  const key = await deriveKey(passphrase, salt);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
  return textDecoder.decode(plain);
}

export async function exportDatabase(passphrase?: string) {
  const [settings, accounts, snapshots, cashflows, fxRates, pricePoints] = await Promise.all([
    db.settings.get('primary'),
    db.accounts.toArray(),
    db.snapshots.toArray(),
    db.cashflows.toArray(),
    db.fxRates.toArray(),
    db.pricePoints.toArray()
  ]);

  const payload = JSON.stringify({
    schemaVersion: 1,
    settings: settings ?? defaultSettings,
    accounts,
    snapshots,
    cashflows,
    fxRates,
    pricePoints
  });

  if (passphrase) {
    const encrypted = await encryptPayload(payload, passphrase);
    return JSON.stringify({ encrypted: true, payload: encrypted });
  }

  return JSON.stringify({ encrypted: false, payload });
}

export async function importDatabase(raw: string, passphrase?: string) {
  const parsed = JSON.parse(raw);
  let payload: string;
  if (parsed.encrypted) {
    if (!passphrase) throw new Error('Passphrase required');
    payload = await decryptPayload(parsed.payload, passphrase);
  } else {
    payload = parsed.payload;
  }

  const data = JSON.parse(payload);
  await db.transaction('rw', db.settings, db.accounts, db.snapshots, db.cashflows, db.fxRates, db.pricePoints, async () => {
    await Promise.all([
      db.settings.clear(),
      db.accounts.clear(),
      db.snapshots.clear(),
      db.cashflows.clear(),
      db.fxRates.clear(),
      db.pricePoints.clear()
    ]);
    await db.settings.put(data.settings ?? defaultSettings);
    await db.accounts.bulkPut(data.accounts ?? []);
    await db.snapshots.bulkPut(data.snapshots ?? []);
    await db.cashflows.bulkPut(data.cashflows ?? []);
    await db.fxRates.bulkPut(data.fxRates ?? []);
    await db.pricePoints.bulkPut(data.pricePoints ?? []);
  });

  return data as { settings: Settings };
}
