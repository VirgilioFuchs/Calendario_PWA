import type { CalendarEvent } from '../types';

interface CacheEntry {
    id: string;
    startDate: string;
    endDate: string;
    events: CalendarEvent[];
    etag: string | null;
    timestamp: number;
    expiresAt: number;
}

interface CacheStore {
    [key: string]: CacheEntry;
}

class EventCacheIDB {
    private readonly DB_NAME = 'EventCacheDB';
    private readonly DB_VERSION = 1;
    private readonly STORE_NAME = 'events';
    private readonly CACHE_DURATION = 3 * 24 * 60 * 60 * 1000; // 3 dias
    private db: IDBDatabase | null = null;
    private initPromise: Promise<void> | null = null;

    constructor() {
        this.initPromise = this.initDB();
    }

    private async initDB(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

            request.onerror = () => {
                console.error('Erro ao abrir IndexedDB:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log(' IndexedDB inicializado');
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                if (!db.objectStoreNames.contains(this.STORE_NAME)) {
                    const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });

                    // Índices de busca otimizada
                    store.createIndex('startDate', 'startDate', { unique: false });
                    store.createIndex('endDate', 'endDate', { unique: false });
                    store.createIndex('expiresAt', 'expiresAt', { unique: false });

                    console.log(' Object store criado');
                }
            };
        });
    }

    /**
     * Garante que o DB está inicializado
     */
    private async ensureDB(): Promise<IDBDatabase> {
        if (!this.db) {
            await this.initPromise;
        }
        if (!this.db) {
            throw new Error('Failed to initialize IndexedDB');
        }
        return this.db;
    }

    /**
     * Gera chave única para o range de datas
     */
    private generateCacheKey(startDate: string, endDate: string): string {
        return `range_${startDate}_${endDate}`;
    }

    /**
     * Busca entrada do cache por range
     */
    async get(startDate: string, endDate: string): Promise<CacheEntry | null> {
        try {
            const db = await this.ensureDB();
            const key = this.generateCacheKey(startDate, endDate);

            return new Promise((resolve, reject) => {
                const transaction = db.transaction([this.STORE_NAME], 'readonly');
                const store = transaction.objectStore(this.STORE_NAME);
                const request = store.get(key);

                request.onsuccess = () => {
                    const entry = request.result as CacheEntry | undefined;

                    if (!entry) {
                        resolve(null);
                        return;
                    }

                    // Valida expiração
                    if (entry.expiresAt < Date.now()) {
                        this.delete(startDate, endDate);
                        resolve(null);
                        return;
                    }

                    resolve(entry);
                };

                request.onerror = () => {
                    console.error('Erro ao buscar do cache:', request.error);
                    reject(request.error);
                };
            });
        } catch (error) {
            console.error('Erro no get:', error);
            return null;
        }
    }

    /**
     * Armazena entrada no cache
     */
    async set(entry: Omit<CacheEntry, 'id' | 'timestamp' | 'expiresAt'>): Promise<void> {
        try {
            const db = await this.ensureDB();
            const now = Date.now();

            const cacheEntry: CacheEntry = {
                ...entry,
                id: this.generateCacheKey(entry.startDate, entry.endDate),
                timestamp: now,
                expiresAt: now + this.CACHE_DURATION
            };

            const stats = await this.getStats();
            const size = new Blob([JSON.stringify(cacheEntry)]).size;
            console.log(`
                ✅ Cache salvo: ${entry.startDate} → ${entry.endDate}
                📝 Eventos: ${entry.events.length}
                💾 Tamanho: ${(size / 1024).toFixed(2)} KB
                📊 Total de caches: ${stats.entries}
            `);

            return new Promise((resolve, reject) => {
                const transaction = db.transaction([this.STORE_NAME], 'readwrite');
                const store = transaction.objectStore(this.STORE_NAME);
                const request = store.put(cacheEntry);

                request.onsuccess = () => {
                    console.log('Cache salvo:', entry.startDate, entry.endDate);
                    resolve();
                };

                request.onerror = () => {
                    console.error('Erro ao salvar cache:', request.error);
                    reject(request.error);
                };
            });
        } catch (error) {
            console.error('Erro no set:', error);
        }
    }

    /**
     * Remove entrada específica do cache
     */
    async delete(startDate: string, endDate: string): Promise<void> {
        try {
            const db = await this.ensureDB();
            const key = this.generateCacheKey(startDate, endDate);

            return new Promise((resolve, reject) => {
                const transaction = db.transaction([this.STORE_NAME], 'readwrite');
                const store = transaction.objectStore(this.STORE_NAME);
                const request = store.delete(key);

                request.onsuccess = () => {
                    console.log('🗑️ Cache deletado:', startDate, endDate);
                    resolve();
                };

                request.onerror = () => {
                    console.error('Erro ao deletar cache:', request.error);
                    reject(request.error);
                };
            });
        } catch (error) {
            console.error('Erro no delete:', error);
        }
    }

    /**
     * Remove todas as entradas expiradas
     */
    async clearExpired(): Promise<void> {
        try {
            const db = await this.ensureDB();
            const now = Date.now();

            return new Promise((resolve, reject) => {
                const transaction = db.transaction([this.STORE_NAME], 'readwrite');
                const store = transaction.objectStore(this.STORE_NAME);
                const index = store.index('expiresAt');
                const range = IDBKeyRange.upperBound(now);
                const request = index.openCursor(range);

                let deletedCount = 0;

                request.onsuccess = (event) => {
                    const cursor = (event.target as IDBRequest).result;
                    if (cursor) {
                        cursor.delete();
                        deletedCount++;
                        cursor.continue();
                    } else {
                        console.log(`🧹 ${deletedCount} entradas expiradas removidas`);
                        resolve();
                    }
                };

                request.onerror = () => {
                    console.error('Erro ao limpar cache expirado:', request.error);
                    reject(request.error);
                };
            });
        } catch (error) {
            console.error('Erro no clearExpired:', error);
        }
    }

    /**
     * Limpa o cache
     */
    async clearAll(): Promise<void> {
        try {
            const db = await this.ensureDB();

            return new Promise((resolve, reject) => {
                const transaction = db.transaction([this.STORE_NAME], 'readwrite');
                const store = transaction.objectStore(this.STORE_NAME);
                const request = store.clear();

                request.onsuccess = () => {
                    console.log(' Todo o cache foi limpo');
                    resolve();
                };

                request.onerror = () => {
                    console.error('Erro ao limpar cache:', request.error);
                    reject(request.error);
                };
            });
        } catch (error) {
            console.error('Erro no clearAll:', error);
        }
    }

    /**
     * Retorna informações sobre o cache
     */
    async getStats(): Promise<{
        entries: number;
        oldestEntry: number | null;
        newestEntry: number | null
    }> {
        try {
            const db = await this.ensureDB();

            return new Promise((resolve, reject) => {
                const transaction = db.transaction([this.STORE_NAME], 'readonly');
                const store = transaction.objectStore(this.STORE_NAME);
                const request = store.getAll();

                request.onsuccess = () => {
                    const entries = request.result as CacheEntry[];

                    if (entries.length === 0) {
                        resolve({ entries: 0, oldestEntry: null, newestEntry: null });
                        return;
                    }

                    const timestamps = entries.map(e => e.timestamp);

                    resolve({
                        entries: entries.length,
                        oldestEntry: Math.min(...timestamps),
                        newestEntry: Math.max(...timestamps)
                    });
                };

                request.onerror = () => {
                    reject(request.error);
                };
            });
        } catch (error) {
            console.error('Erro no getStats:', error);
            return { entries: 0, oldestEntry: null, newestEntry: null };
        }
    }
}

// Exporta instância singleton
export const eventCache = new EventCacheIDB();

// Limpeza automática a cada hora (se estiver no browser)
if (typeof window !== 'undefined') {
    setInterval(async () => {
        await eventCache.clearExpired();
    }, 60 * 60 * 1000); // 1 hora
}
