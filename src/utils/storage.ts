import { RegistrationItem } from '../types';

const DB_NAME = 'wabupcup_indexed_db';
const DB_VERSION = 1;
const STORE_REGISTRATIONS = 'registrations';

/**
 * Open or upgrade native IndexedDB
 */
function openIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB is not supported in this environment'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_REGISTRATIONS)) {
        db.createObjectStore(STORE_REGISTRATIONS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save registrations into IndexedDB (supports large Base64 files & PDFs without size limits)
 */
export async function idbSaveRegistrations(items: RegistrationItem[]): Promise<void> {
  try {
    const db = await openIDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_REGISTRATIONS, 'readwrite');
      const store = tx.objectStore(STORE_REGISTRATIONS);
      
      // Clear existing and write fresh
      store.clear();
      for (const item of items) {
        store.put(item);
      }

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[IDB] Could not save registrations to IndexedDB:', err);
  }
}

/**
 * Retrieve all registrations from IndexedDB
 */
export async function idbGetRegistrations(): Promise<RegistrationItem[]> {
  try {
    const db = await openIDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_REGISTRATIONS, 'readonly');
      const store = tx.objectStore(STORE_REGISTRATIONS);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('[IDB] Could not get registrations from IndexedDB:', err);
    return [];
  }
}

/**
 * Save a single registration item to IndexedDB
 */
export async function idbSaveRegistration(item: RegistrationItem): Promise<void> {
  try {
    const db = await openIDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_REGISTRATIONS, 'readwrite');
      const store = tx.objectStore(STORE_REGISTRATIONS);
      store.put(item);

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[IDB] Could not save registration to IndexedDB:', err);
  }
}

/**
 * Delete a registration from IndexedDB
 */
export async function idbDeleteRegistration(id: string): Promise<void> {
  try {
    const db = await openIDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_REGISTRATIONS, 'readwrite');
      const store = tx.objectStore(STORE_REGISTRATIONS);
      store.delete(id);

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[IDB] Could not delete registration from IndexedDB:', err);
  }
}

/**
 * Sanitize registration for LocalStorage by omitting large base64 file payloads
 * so it never exceeds localStorage 5MB quota.
 */
export function sanitizeRegistrationsForLocalStorage(items: RegistrationItem[]): RegistrationItem[] {
  return items.map(item => {
    const sanitizedDocs: any = {};
    if (item.documents) {
      for (const [key, doc] of Object.entries(item.documents)) {
        if (doc) {
          sanitizedDocs[key] = {
            name: doc.name,
            size: doc.size,
            uploadDate: doc.uploadDate,
            type: doc.type,
            // Strip heavy base64 data to keep localStorage ultra-lightweight (<50KB total)
            previewUrl: doc.previewUrl && doc.previewUrl.startsWith('data:') && doc.previewUrl.length > 5000 
              ? undefined 
              : doc.previewUrl,
            fileData: undefined,
          };
        }
      }
    }

    return {
      ...item,
      teamLogo: item.teamLogo && item.teamLogo.startsWith('data:') && item.teamLogo.length > 50000
        ? undefined
        : item.teamLogo,
      documents: sanitizedDocs,
    };
  });
}

/**
 * Safe wrapper for localStorage.setItem that NEVER crashes the application on QuotaExceededError.
 */
export function safeLocalStorageSet(key: string, value: string): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error: any) {
    console.warn(`[Storage] Failed to save key "${key}" to localStorage (${error?.name}):`, error?.message);
    
    // If quota exceeded, try cleaning up old heavy keys and retry with sanitized version if applicable
    try {
      if (key === 'wabupcup_registrations') {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          const sanitized = sanitizeRegistrationsForLocalStorage(parsed);
          localStorage.setItem(key, JSON.stringify(sanitized));
          return true;
        }
      }
    } catch (innerErr) {
      console.warn('[Storage] Fallback sanitization also failed:', innerErr);
    }
    return false;
  }
}

/**
 * Safe wrapper for localStorage.getItem with fallback
 */
export function safeLocalStorageGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined' || !window.localStorage) return fallback;
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    return JSON.parse(saved) as T;
  } catch (error) {
    console.warn(`[Storage] Error reading key "${key}" from localStorage:`, error);
    return fallback;
  }
}
