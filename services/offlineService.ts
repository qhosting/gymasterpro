import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'GymMasterOffline';
const STORE_NAMES = ['members', 'transactions', 'notifications', 'plans', 'settings'];

let dbPromise: Promise<IDBPDatabase> | null = null;

export const initDB = async () => {
    if (dbPromise) return dbPromise;

    dbPromise = openDB(DB_NAME, 1, {
        upgrade(db) {
            STORE_NAMES.forEach(storeName => {
                if (!db.objectStoreNames.contains(storeName)) {
                    db.createObjectStore(storeName, { keyPath: 'id' });
                }
            });
        },
    });

    return dbPromise;
};

export const saveData = async (storeName: string, data: any[]) => {
    const db = await initDB();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    
    // Clear old data and save new
    await store.clear();
    for (const item of data) {
        await store.put(item);
    }
    await tx.done;
};

export const saveItem = async (storeName: string, item: any) => {
    const db = await initDB();
    await db.put(storeName, item);
};

export const getData = async (storeName: string) => {
    const db = await initDB();
    return db.getAll(storeName);
};

export const getItem = async (storeName: string, id: string) => {
    const db = await initDB();
    return db.get(storeName, id);
};

export const clearStore = async (storeName: string) => {
    const db = await initDB();
    await db.clear(storeName);
};
