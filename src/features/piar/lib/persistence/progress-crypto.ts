const KEY_DB_NAME = 'piar-digital-progress-keys';
const KEY_DB_VERSION = 1;
const KEY_STORE_NAME = 'progress-keys';
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

async function writeStoredKey(database: IDBDatabase, key: CryptoKey): Promise<void> {
  const transaction = database.transaction(KEY_STORE_NAME, 'readwrite');
  const done = transactionDone(transaction, 'Could not write encrypted draft key.');
  transaction.objectStore(KEY_STORE_NAME).put({ id: PROGRESS_KEY_ID, key });
  await done;
}

function isSecretCryptoKey(value: CryptoKey | CryptoKeyPair): value is CryptoKey {
  return 'type' in value && value.type === 'secret';
}

async function createDeviceKey(): Promise<CryptoKey> {
  const cryptoApi = getCryptoApi();
  const key = await cryptoApi.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
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
    await writeStoredKey(database, key);
    return key;
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

export function isEncryptedProgressEnvelope(value: unknown): value is EncryptedProgressEnvelope {
  return isRecord(value)
    && value.storageVersion === ENCRYPTED_PROGRESS_STORAGE_VERSION
    && value.kind === ENCRYPTED_PROGRESS_KIND
    && value.alg === 'AES-GCM'
    && value.keyId === PROGRESS_KEY_ID
    && typeof value.iv === 'string'
    && typeof value.ciphertext === 'string';
}

export function looksLikeEncryptedProgressEnvelope(value: unknown): boolean {
  return isRecord(value) && value.kind === ENCRYPTED_PROGRESS_KIND;
}

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
