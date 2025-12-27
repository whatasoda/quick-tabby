import type { ThumbnailConfig } from "../shared/types.ts";

const DB_NAME = "quicktabby-thumbnails";
const DB_VERSION = 1;
const STORE_NAME = "thumbnails";
const MAX_THUMBNAILS = 100;

// Default config used when no config is provided
const DEFAULT_THUMBNAIL_CONFIG: ThumbnailConfig = {
  size: 200,
  captureQuality: 70,
  resizeQuality: 0.8,
};

interface StoredThumbnail {
  tabId: number;
  dataUrl: string;
  capturedAt: number;
}

let db: IDBDatabase | null = null;

export async function initThumbnailCache(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
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
}

async function resizeImage(
  dataUrl: string,
  size: number,
  quality: number
): Promise<string> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const bitmap = await createImageBitmap(blob);

  const aspectRatio = bitmap.width / bitmap.height;
  const width = aspectRatio > 1 ? size : Math.round(size * aspectRatio);
  const height = aspectRatio > 1 ? Math.round(size / aspectRatio) : size;

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const resizedBlob = await canvas.convertToBlob({
    type: "image/jpeg",
    quality,
  });
  return blobToDataUrl(resizedBlob);
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function storeThumbnail(thumbnail: StoredThumbnail): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!db) return reject(new Error("DB not initialized"));

    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(thumbnail);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function pruneOldThumbnails(): Promise<void> {
  return new Promise((resolve) => {
    if (!db) return resolve();

    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const index = store.index("capturedAt");

    const countRequest = store.count();
    countRequest.onsuccess = () => {
      const count = countRequest.result;
      if (count <= MAX_THUMBNAILS) return resolve();

      const toDelete = count - MAX_THUMBNAILS;
      const cursor = index.openCursor();
      let deleted = 0;

      cursor.onsuccess = (event) => {
        const c = (event.target as IDBRequest).result as IDBCursorWithValue | null;
        if (c && deleted < toDelete) {
          c.delete();
          deleted++;
          c.continue();
        } else {
          resolve();
        }
      };
    };
  });
}

export async function captureAndStoreThumbnail(
  tabId: number,
  windowId: number,
  config?: ThumbnailConfig
): Promise<void> {
  if (!db) return;

  const { size, captureQuality, resizeQuality } =
    config ?? DEFAULT_THUMBNAIL_CONFIG;

  try {
    const dataUrl = await chrome.tabs.captureVisibleTab(windowId, {
      format: "jpeg",
      quality: captureQuality,
    });

    const resized = await resizeImage(dataUrl, size, resizeQuality);

    const thumbnail: StoredThumbnail = {
      tabId,
      dataUrl: resized,
      capturedAt: Date.now(),
    };

    await storeThumbnail(thumbnail);
    await pruneOldThumbnails();
  } catch {
    // Silently fail - some pages cannot be captured (chrome://, etc.)
  }
}

export async function getThumbnail(tabId: number): Promise<string | null> {
  return new Promise((resolve) => {
    if (!db) return resolve(null);

    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(tabId);

    request.onsuccess = () => {
      const result = request.result as StoredThumbnail | undefined;
      resolve(result?.dataUrl ?? null);
    };
    request.onerror = () => resolve(null);
  });
}

export async function getThumbnailsForTabs(
  tabIds: number[]
): Promise<Map<number, string>> {
  return new Promise((resolve) => {
    if (!db) return resolve(new Map());

    const result = new Map<number, string>();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);

    let pending = tabIds.length;
    if (pending === 0) return resolve(result);

    for (const tabId of tabIds) {
      const request = store.get(tabId);
      request.onsuccess = () => {
        const data = request.result as StoredThumbnail | undefined;
        if (data) result.set(tabId, data.dataUrl);
        if (--pending === 0) resolve(result);
      };
      request.onerror = () => {
        if (--pending === 0) resolve(result);
      };
    }
  });
}

export async function deleteThumbnail(tabId: number): Promise<void> {
  return new Promise((resolve) => {
    if (!db) return resolve();

    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(tabId);

    request.onsuccess = () => resolve();
    request.onerror = () => resolve();
  });
}
