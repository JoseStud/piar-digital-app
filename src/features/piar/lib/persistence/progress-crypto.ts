/**
 * Web Crypto + IndexedDB plumbing for encrypted PIAR draft storage.
 *
 * Drafts are encrypted with AES-256-GCM using a non-extractable device key
 * generated once per browser profile and stored in IndexedDB. The key never
 * leaves the browser; it cannot be exported even by code running in this
 * origin (extractable: false). All public functions reject (do not throw
 * synchronously) and surface a typed `ProgressCryptoError` on failure so the
 * caller can map to user-facing Spanish messages.
 *
 * Threat model:
 * - PROTECTS against: casual reads of localStorage by other browser
 *   extensions or other OS users on the same machine.
 * - DOES NOT PROTECT against: malicious code running in this same origin,
 *   an attacker with full filesystem access to the user's IndexedDB,
 *   or a compromised browser.
 *
 * @see ./progress-store.ts — the localStorage wrapper that calls this module
 */
const KEY_DB_NAME = 'piar-digital-progress-keys';
const KEY_DB_VERSION = 1;
const KEY_STORE_NAME = 'progress-keys';
// why: string-with-version suffix instead of a numeric id so a future key
// rotation can introduce 'piar-progress-device-key-v2' alongside v1 without
// ambiguity in the IndexedDB store.
const PROGRESS_KEY_ID = 'piar-progress-device-key-v1';
const ENCRYPTED_PROGRESS_KIND = 'piar-progress-encrypted';
const ENCRYPTED_PROGRESS_STORAGE_VERSION = 1;
const AES_GCM_IV_BYTES = 12;

export type ProgressCryptoErrorCode =
  | 'crypto_unavailable'
  | 'key_unavailable'
  | 'encryption_failed'
  | 'decryption_failed';

export interface EncryptedProgressEnvelope {
  storageVersion: typeof ENCRYPTED_PROGRESS_STORAGE_VERSION;
  kind: typeof ENCRYPTED_PROGRESS_KIND;
  alg: 'AES-GCM';
  keyId: typeof PROGRESS_KEY_ID;
  iv: string;
  ciphertext: string;
}

interface StoredProgressKey {
  id: typeof PROGRESS_KEY_ID;
  key: CryptoKey;
}

/** Typed error surfaced by every public function in this module. */
export class ProgressCryptoError extends Error {
  readonly code: ProgressCryptoErrorCode;

  constructor(code: ProgressCryptoErrorCode, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'ProgressCryptoError';
    this.code = code;
  }
}

let deviceKeyPromise: Promise<CryptoKey> | null = null;

export function resetProgressCryptoKeyCacheForTests(): void {
  deviceKeyPromise = null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getCryptoApi(): Crypto {
  if (
    typeof crypto === 'undefined'
    || !crypto.subtle
    || typeof crypto.subtle.encrypt !== 'function'
    || typeof crypto.subtle.decrypt !== 'function'
    || typeof crypto.subtle.generateKey !== 'function'
    || typeof crypto.getRandomValues !== 'function'
  ) {
    throw new ProgressCryptoError(
      'crypto_unavailable',
      'Web Crypto is not available for encrypted draft storage.',
    );
  }

  return crypto;
}

function getIndexedDbApi(): IDBFactory {
  if (typeof indexedDB === 'undefined') {
    throw new ProgressCryptoError(
      'key_unavailable',
      'IndexedDB is not available for encrypted draft key storage.',
    );
  }

  return indexedDB;
}

function buildKeyUnavailableError(message: string, cause?: unknown): ProgressCryptoError {
  return new ProgressCryptoError('key_unavailable', message, cause instanceof Error ? { cause } : undefined);
}

function requestToPromise<T>(request: IDBRequest<T>, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(buildKeyUnavailableError(message, request.error ?? undefined));
  });
}

function transactionDone(transaction: IDBTransaction, message: string): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(buildKeyUnavailableError(message, transaction.error ?? undefined));
    transaction.onabort = () => reject(buildKeyUnavailableError(message, transaction.error ?? undefined));
  });
}

function openKeyDatabase(): Promise<IDBDatabase> {
  const indexedDbApi = getIndexedDbApi();

  return new Promise((resolve, reject) => {
    let request: IDBOpenDBRequest;
    try {
      request = indexedDbApi.open(KEY_DB_NAME, KEY_DB_VERSION);
    } catch (error) {
      reject(buildKeyUnavailableError('Could not open encrypted draft key storage.', error));
      return;
    }

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(KEY_STORE_NAME)) {
        database.createObjectStore(KEY_STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onblocked = () => reject(buildKeyUnavailableError('Encrypted draft key storage is blocked.'));
    request.onerror = () => reject(buildKeyUnavailableError('Could not open encrypted draft key storage.', request.error ?? undefined));
    request.onsuccess = () => resolve(request.result);
  });
}

async function readStoredKey(database: IDBDatabase): Promise<StoredProgressKey | undefined> {
  const transaction = database.transaction(KEY_STORE_NAME, 'readonly');
  const done = transactionDone(transaction, 'Could not finish reading encrypted draft key.');
  const request = transaction.objectStore(KEY_STORE_NAME).get(PROGRESS_KEY_ID) as IDBRequest<StoredProgressKey | undefined>;
  const record = await requestToPromise(request, 'Could not read encrypted draft key.');
  await done;
  return record;
}

function isConstraintError(error: DOMException | null): boolean {
  return error?.name === 'ConstraintError';
}

async function addStoredKey(database: IDBDatabase, key: CryptoKey): Promise<boolean> {
  const transaction = database.transaction(KEY_STORE_NAME, 'readwrite');
  const done = transactionDone(transaction, 'Could not write encrypted draft key.');
  const request = transaction.objectStore(KEY_STORE_NAME).add({ id: PROGRESS_KEY_ID, key });

  const addResult = new Promise<boolean>((resolve, reject) => {
    request.onsuccess = () => resolve(true);
    request.onerror = (event) => {
      if (isConstraintError(request.error)) {
        // why: a second tab may have raced us to write the same PROGRESS_KEY_ID.
        // IndexedDB raises ConstraintError; we swallow it and let the caller
        // re-read the winning key. event.preventDefault() stops the abort from
        // failing the whole transaction.
        event.preventDefault();
        resolve(false);
        return;
      }

      reject(buildKeyUnavailableError('Could not write encrypted draft key.', request.error ?? undefined));
    };
  });

  try {
    const added = await addResult;
    await done;
    return added;
  } catch (error) {
    try {
      await done;
    } catch {
      // Preserve the original request error when one exists.
    }
    throw error;
  }
}

function isSecretCryptoKey(value: CryptoKey | CryptoKeyPair): value is CryptoKey {
  return 'type' in value && value.type === 'secret';
}

async function createDeviceKey(): Promise<CryptoKey> {
  const cryptoApi = getCryptoApi();
  const key = await cryptoApi.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    // why: extractable=false is the entire reason an attacker with DOM access
    // cannot dump the raw key bytes. Without this flag the in-origin threat
    // model collapses — even though the key handle never leaves this module,
    // SubtleCrypto.exportKey would otherwise be able to read it back.
    false,
    ['encrypt', 'decrypt'],
  );

  if (!isSecretCryptoKey(key)) {
    throw buildKeyUnavailableError('Web Crypto did not create a usable draft key.');
  }

  return key;
}

async function loadOrCreateDeviceKey(): Promise<CryptoKey> {
  const database = await openKeyDatabase();

  try {
    const storedKey = await readStoredKey(database);
    if (storedKey?.id === PROGRESS_KEY_ID && storedKey.key) {
      return storedKey.key;
    }

    const key = await createDeviceKey();
    const added = await addStoredKey(database, key);
    if (added) {
      return key;
    }

    // why: if `addStoredKey` returned false the other tab won the write race;
    // re-read so this tab uses the same key the winner persisted. If the
    // re-read still finds nothing, that's an unrecoverable IDB inconsistency.
    const winningStoredKey = await readStoredKey(database);
    if (winningStoredKey?.id === PROGRESS_KEY_ID && winningStoredKey.key) {
      return winningStoredKey.key;
    }

    throw buildKeyUnavailableError('Could not read encrypted draft key created by another tab.');
  } catch (error) {
    if (error instanceof ProgressCryptoError) {
      throw error;
    }

    throw buildKeyUnavailableError('Could not prepare encrypted draft key.', error);
  } finally {
    database.close();
  }
}

async function getDeviceKey(): Promise<CryptoKey> {
  if (!deviceKeyPromise) {
    deviceKeyPromise = loadOrCreateDeviceKey().catch((error: unknown) => {
      // why: don't memoize the failure. If the first key load fails (e.g., IDB
      // transiently unavailable), the next caller should get a fresh attempt
      // instead of replaying the same rejected promise forever.
      deviceKeyPromise = null;
      throw error;
    });
  }

  return deviceKeyPromise;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }

  return btoa(binary);
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

/**
 * Strict shape check for an encrypted draft envelope. Used as the gate
 * before attempting to decrypt; rejects anything that does not match the
 * exact storage version + algorithm + key id this module expects.
 */
export function isEncryptedProgressEnvelope(value: unknown): value is EncryptedProgressEnvelope {
  return isRecord(value)
    && value.storageVersion === ENCRYPTED_PROGRESS_STORAGE_VERSION
    && value.kind === ENCRYPTED_PROGRESS_KIND
    && value.alg === 'AES-GCM'
    && value.keyId === PROGRESS_KEY_ID
    && typeof value.iv === 'string'
    && typeof value.ciphertext === 'string';
}

/**
 * Loose shape check that recognizes envelopes from any version of the
 * encrypted format. Used by the load path to distinguish "this is plainly
 * unencrypted data" from "this is a future-version encrypted envelope we
 * cannot read."
 */
export function looksLikeEncryptedProgressEnvelope(value: unknown): boolean {
  return isRecord(value) && value.kind === ENCRYPTED_PROGRESS_KIND;
}

/**
 * Encrypts an already-serialized progress JSON string. Generates a fresh
 * 96-bit IV per call (never reused), then base64-encodes both IV and
 * ciphertext for safe storage in localStorage.
 */
export async function encryptSerializedProgress(serializedProgress: string): Promise<EncryptedProgressEnvelope> {
  const cryptoApi = getCryptoApi();
  const key = await getDeviceKey();
  const iv = cryptoApi.getRandomValues(new Uint8Array(AES_GCM_IV_BYTES));

  try {
    const plaintext = new TextEncoder().encode(serializedProgress);
    const ciphertext = new Uint8Array(await cryptoApi.subtle.encrypt(
      { name: 'AES-GCM', iv: toArrayBuffer(iv) },
      key,
      toArrayBuffer(plaintext),
    ));

    return {
      storageVersion: ENCRYPTED_PROGRESS_STORAGE_VERSION,
      kind: ENCRYPTED_PROGRESS_KIND,
      alg: 'AES-GCM',
      keyId: PROGRESS_KEY_ID,
      iv: bytesToBase64(iv),
      ciphertext: bytesToBase64(ciphertext),
    };
  } catch (error) {
    throw new ProgressCryptoError(
      'encryption_failed',
      'Could not encrypt draft progress.',
      error instanceof Error ? { cause: error } : undefined,
    );
  }
}

/**
 * Decrypts an envelope produced by `encryptSerializedProgress`. Returns
 * the original serialized progress JSON string. Throws
 * `ProgressCryptoError('decryption_failed')` if the envelope was tampered
 * with, the IV is wrong, or the wrong key is loaded.
 */
export async function decryptSerializedProgress(envelope: EncryptedProgressEnvelope): Promise<string> {
  const cryptoApi = getCryptoApi();
  const key = await getDeviceKey();

  try {
    const iv = base64ToBytes(envelope.iv);
    const ciphertext = base64ToBytes(envelope.ciphertext);
    const plaintext = await cryptoApi.subtle.decrypt(
      { name: 'AES-GCM', iv: toArrayBuffer(iv) },
      key,
      toArrayBuffer(ciphertext),
    );
    return new TextDecoder().decode(plaintext);
  } catch (error) {
    throw new ProgressCryptoError(
      'decryption_failed',
      'Could not decrypt draft progress.',
      error instanceof Error ? { cause: error } : undefined,
    );
  }
}
