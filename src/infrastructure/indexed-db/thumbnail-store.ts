import { isIDBCursorWithValue, isIDBOpenDBRequest, isStoredThumbnail } from "./type-guards.ts";
import type { StoredThumbnail, ThumbnailStore } from "./types.ts";

const DB_NAME = "quicktabby-thumbnails";
const DB_VERSION = 1;
const STORE_NAME = "thumbnails";

export function createThumbnailStore(): ThumbnailStore {
  let db: IDBDatabase | null = null;

  return {
    isInitialized(): boolean {
      return db !== null;
    },

    async init(): Promise<void> {
      if (db !== null) return;

      return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);

        request.onupgradeneeded = (event) => {
          if (!isIDBOpenDBRequest(event.target)) {
            reject(new Error("Invalid event target during DB upgrade"));
            return;
          }

          const database = event.target.result;
          if (!database.objectStoreNames.contains(STORE_NAME)) {
            const store = database.createObjectStore(STORE_NAME, {
              keyPath: "tabId",
            });
            store.createIndex("capturedAt", "capturedAt");
          }
        };

        request.onsuccess = () => {
          db = request.result;
          resolve();
        };
      });
    },

    async get(tabId: number): Promise<StoredThumbnail | undefined> {
      return new Promise((resolve, reject) => {
        if (!db) {
          resolve(undefined);
          return;
        }

        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(tabId);

        request.onsuccess = () => {
          const result = request.result;
          if (isStoredThumbnail(result)) {
            resolve(result);
          } else {
            resolve(undefined);
          }
        };
        request.onerror = () => reject(request.error);
      });
    },

    async getMany(tabIds: number[]): Promise<Map<number, StoredThumbnail>> {
      return new Promise((resolve, _reject) => {
        if (!db) {
          resolve(new Map());
          return;
        }

        const result = new Map<number, StoredThumbnail>();
        if (tabIds.length === 0) {
          resolve(result);
          return;
        }

        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);

        let pending = tabIds.length;

        for (const tabId of tabIds) {
          const request = store.get(tabId);

          request.onsuccess = () => {
            const data = request.result;
            if (isStoredThumbnail(data)) {
              result.set(tabId, data);
            }
            pending--;
            if (pending === 0) {
              resolve(result);
            }
          };

          request.onerror = () => {
            pending--;
            if (pending === 0) {
              resolve(result);
            }
          };
        }
      });
    },

    async put(thumbnail: StoredThumbnail): Promise<void> {
      return new Promise((resolve, reject) => {
        if (!db) {
          reject(new Error("DB not initialized"));
          return;
        }

        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const request = store.put(thumbnail);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    },

    async delete(tabId: number): Promise<void> {
      return new Promise((resolve) => {
        if (!db) {
          resolve();
          return;
        }

        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const request = store.delete(tabId);

        request.onsuccess = () => resolve();
        request.onerror = () => resolve(); // Silently ignore errors
      });
    },

    async prune(maxCount: number): Promise<void> {
      return new Promise((resolve) => {
        if (!db) {
          resolve();
          return;
        }

        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const index = store.index("capturedAt");

        const countRequest = store.count();
        countRequest.onsuccess = () => {
          const count = countRequest.result;
          if (count <= maxCount) {
            resolve();
            return;
          }

          const toDelete = count - maxCount;
          const cursorRequest = index.openCursor();
          let deleted = 0;

          cursorRequest.onsuccess = (event) => {
            const target = event.target;
            if (!target || !("result" in target)) {
              resolve();
              return;
            }

            const cursor = (target as IDBRequest<IDBCursorWithValue | null>).result;
            if (isIDBCursorWithValue(cursor) && deleted < toDelete) {
              cursor.delete();
              deleted++;
              cursor.continue();
            } else {
              resolve();
            }
          };

          cursorRequest.onerror = () => resolve();
        };

        countRequest.onerror = () => resolve();
      });
    },
  };
}
