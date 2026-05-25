// Ambient declaration for rate-limit-mongo (no @types package exists).
// Must remain a "script" file — no top-level imports — so TS treats
// `declare module` as an ambient declaration, not a module augmentation.

declare module 'rate-limit-mongo' {
  interface MongoStoreOptions {
    uri:                      string;
    collectionName?:          string;
    expireTimeMs?:            number;
    resetExpireDateOnChange?: boolean;
    createTtlIndex?:          boolean;
    errorHandler?:            (err: Error) => void;
  }

  // Matches express-rate-limit's LegacyStore interface structurally.
  class MongoStore {
    constructor(options: MongoStoreOptions);
    incr(key: string, cb: (err: Error | undefined, totalHits: number, resetTime: Date | undefined) => void): void;
    decrement(key: string): void;
    resetKey(key: string): void;
    resetAll?(): void;
  }

  export = MongoStore;
}
