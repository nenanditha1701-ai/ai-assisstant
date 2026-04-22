import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'ai_assistant_cache';
const DB_VERSION = 1;

export async function initDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('tasks')) {
        db.createObjectStore('tasks', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('goals')) {
        db.createObjectStore('goals', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('meetings')) {
        db.createObjectStore('meetings', { keyPath: 'id' });
      }
    },
  });
}

export async function cacheData(storeName: string, data: any[]) {
  const db = await initDB();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  for (const item of data) {
    await store.put(item);
  }
  await tx.done;
}

export async function getCachedData(storeName: string) {
  const db = await initDB();
  return db.getAll(storeName);
}
