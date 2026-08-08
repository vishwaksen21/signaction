/**
 * IndexedDB-based model cache for Vosk WASM models.
 * Stores the ~40MB model blob so it persists offline.
 */

const DB_NAME = 'signaction-models';
const DB_VERSION = 1;
const STORE_NAME = 'vosk-models';
const MODEL_KEY = 'vosk-en-us-small';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

/**
 * Check if the Vosk model is cached in IndexedDB.
 */
export async function isModelCached(): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(MODEL_KEY);
      req.onsuccess = () => resolve(!!req.result);
      req.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

/**
 * Get the cached model blob (as ArrayBuffer) from IndexedDB.
 */
export async function getCachedModel(): Promise<ArrayBuffer | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(MODEL_KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Save a model blob (ArrayBuffer or Blob) to IndexedDB.
 */
export async function cacheModel(data: ArrayBuffer | Blob): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(data, MODEL_KEY);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Delete the cached model from IndexedDB.
 */
export async function deleteCachedModel(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(MODEL_KEY);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Download the Vosk small English model via our API proxy (avoids CORS).
 * Reports progress via callback. Returns the ArrayBuffer.
 */
export async function downloadModel(
  onProgress?: (loaded: number, total: number) => void
): Promise<ArrayBuffer> {
  // Proxy through our API to avoid CORS (alphacephei.com has no CORS headers)
  const MODEL_URLS = ['/api/vosk-model'];

  let lastError: Error | null = null;

  for (const MODEL_URL of MODEL_URLS) {
    try {
      const response = await fetch(MODEL_URL, { cache: 'no-store' });
      if (!response.ok) {
        lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
        continue;
      }

      const contentLength = Number(response.headers.get('content-length')) || 0;
      const reader = response.body?.getReader();
      if (!reader) {
        lastError = new Error('Response body not readable');
        continue;
      }

      const chunks: Uint8Array[] = [];
      let received = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        onProgress?.(received, contentLength || received);
      }

      // Combine all chunks into a single ArrayBuffer
      const total = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const result = new Uint8Array(total);
      let offset = 0;
      for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
      }

      return result.buffer;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      continue;
    }
  }

  throw lastError || new Error('Failed to download model from all sources');
}
