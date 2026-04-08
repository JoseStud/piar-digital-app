import { webcrypto } from 'node:crypto';
import { resetProgressCryptoKeyCacheForTests } from '@piar-digital-app/features/piar/lib/persistence/progress-crypto';

type RequestSuccessHandler<T> = ((event: Event & { target: IDBRequest<T> }) => void) | null;
type RequestErrorHandler<T> = ((event: Event & { target: IDBRequest<T> }) => void) | null;

class FakeIdbRequest<T> {
  result!: T;
  error: DOMException | null = null;
  onsuccess: RequestSuccessHandler<T> = null;
  onerror: RequestErrorHandler<T> = null;

  succeed(result: T): void {
    this.result = result;
    this.onsuccess?.(new Event('success') as Event & { target: IDBRequest<T> });
  }

  fail(error: DOMException): void {
    this.error = error;
    this.onerror?.(new Event('error') as Event & { target: IDBRequest<T> });
  }
}

class FakeIdbOpenRequest extends FakeIdbRequest<IDBDatabase> {
  onupgradeneeded: ((event: IDBVersionChangeEvent) => void) | null = null;
  onblocked: ((event: IDBVersionChangeEvent) => void) | null = null;
}

class FakeIdbTransaction {
  error: DOMException | null = null;
  onerror: ((event: Event) => void) | null = null;
  onabort: ((event: Event) => void) | null = null;
  private completeHandler: ((event: Event) => void) | null = null;
  private completed = false;

  constructor(private readonly records: Map<IDBValidKey, unknown>) {}

  get oncomplete(): ((event: Event) => void) | null {
    return this.completeHandler;
  }

  set oncomplete(handler: ((event: Event) => void) | null) {
    this.completeHandler = handler;
    if (this.completed && handler) {
      Promise.resolve().then(() => handler(new Event('complete')));
    }
  }

  objectStore(): IDBObjectStore {
    const transaction = this;

    return {
      get(key: IDBValidKey) {
        const request = new FakeIdbRequest<unknown>();
        Promise.resolve().then(() => {
          request.succeed(transaction.records.get(key));
          transaction.complete();
        });
        return request as unknown as IDBRequest<unknown>;
      },
      put(value: unknown) {
        const request = new FakeIdbRequest<IDBValidKey>();
        Promise.resolve().then(() => {
          const id = (value as { id?: IDBValidKey }).id;
          if (id === undefined) {
            const error = new DOMException('Missing key', 'DataError');
            request.fail(error);
            transaction.fail(error);
            return;
          }

          transaction.records.set(id, value);
          request.succeed(id);
          transaction.complete();
        });
        return request as unknown as IDBRequest<IDBValidKey>;
      },
    } as IDBObjectStore;
  }

  private complete(): void {
    this.completed = true;
    this.completeHandler?.(new Event('complete'));
  }

  private fail(error: DOMException): void {
    this.error = error;
    this.onerror?.(new Event('error'));
  }
}

class FakeIdbDatabase {
  readonly objectStoreNames: DOMStringList;

  constructor(private readonly stores: Map<string, Map<IDBValidKey, unknown>>) {
    this.objectStoreNames = {
      contains: (name: string) => stores.has(name),
    } as DOMStringList;
  }

  createObjectStore(name: string): IDBObjectStore {
    if (!this.stores.has(name)) {
      this.stores.set(name, new Map());
    }

    return {} as IDBObjectStore;
  }

  transaction(name: string): IDBTransaction {
    const records = this.stores.get(name);
    if (!records) {
      throw new DOMException(`Unknown object store: ${name}`, 'NotFoundError');
    }

    return new FakeIdbTransaction(records) as unknown as IDBTransaction;
  }

  close(): void {}
}

function createMemoryIndexedDb(): IDBFactory {
  const databases = new Map<string, Map<string, Map<IDBValidKey, unknown>>>();

  return {
    open(name: string) {
      const request = new FakeIdbOpenRequest();

      Promise.resolve().then(() => {
        let stores = databases.get(name);
        const isNewDatabase = !stores;
        if (!stores) {
          stores = new Map();
          databases.set(name, stores);
        }

        const database = new FakeIdbDatabase(stores) as unknown as IDBDatabase;
        request.result = database;
        if (isNewDatabase) {
          request.onupgradeneeded?.(new Event('upgradeneeded') as IDBVersionChangeEvent);
        }
        request.succeed(database);
      });

      return request as unknown as IDBOpenDBRequest;
    },
  } as IDBFactory;
}

export function installEncryptedProgressStorageMocks(): void {
  resetProgressCryptoKeyCacheForTests();
  Object.defineProperty(globalThis, 'crypto', {
    configurable: true,
    value: webcrypto,
  });
  Object.defineProperty(globalThis, 'indexedDB', {
    configurable: true,
    value: createMemoryIndexedDb(),
  });
}
