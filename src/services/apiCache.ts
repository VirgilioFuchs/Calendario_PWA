import type { CalendarEvent } from '../types';
import { eventCache } from './eventCacheIDB';

// const API_URL = "http://192.168.70.163:8000"; Windows
const API_URL = "http://192.168.15.4:8000"; // MAC

const parseDateLocal = (dateString: string): Date => {
    const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
    return new Date(year, month - 1, day);
};

export const eventsApi = {
    /**
     * Busca eventos por range de datas com cache IndexedDB + ETag
     */
    async getEventsByRange(startDate: string, endDate: string): Promise<CalendarEvent[]> {
        // 1. Tenta buscar do cache
        const cached = await eventCache.get(startDate, endDate);

        if (cached) {
            console.log('Cache hit:', startDate, endDate);

            try {
                const isValid = await this.revalidateCache(startDate, endDate, cached.etag);
                if (isValid) {
                    console.log('Cache ainda válido (304)');
                    return cached.events;
                }
            } catch (error) {
                console.warn('Erro na revalidação, usando cache:', error);
                return cached.events;
            }
        }

        // 2. Cache miss ou expirado: busca da API
        console.log('Buscando da API:', startDate, endDate);
        return this.fetchFromAPI(startDate, endDate);
    },

    /**
     * Revalida cache com ETag
     */
    async revalidateCache(startDate: string, endDate: string, etag: string | null): Promise<boolean> {
        const headers: HeadersInit = {};
        if (etag) {
            headers['If-None-Match'] = etag;
        }

        const response = await fetch(
            `${API_URL}/api/events_list_cache?startDate=${startDate}&endDate=${endDate}`,
            { headers }
        );

        // 304 = dados não mudaram
        if (response.status === 304) {
            return true;
        }

        // 200 = dados novos, atualiza cache
        if (response.ok) {
            const events: CalendarEvent[] = await response.json();
            const newETag = response.headers.get('ETag');

            await eventCache.set({
                startDate,
                endDate,
                events,
                etag: newETag
            });

            return false;
        }

        throw new Error(`Erro na revalidação: ${response.status}`);
    },

    /**
     * Busca da API e salva no cache
     */
    async fetchFromAPI(startDate: string, endDate: string): Promise<CalendarEvent[]> {
        const response = await fetch(
            `${API_URL}/api/events_list_cache?startDate=${startDate}&endDate=${endDate}`
        );

        if (!response.ok) {
            throw new Error(`Erro ao buscar eventos: ${response.status}`);
        }

        const events: CalendarEvent[] = await response.json();
        const etag = response.headers.get('ETag');

        // Salva no cache
        await eventCache.set({
            startDate,
            endDate,
            events,
            etag
        });

        return events;
    },

    /**
     * Busca todos os eventos (usa cache do ano inteiro)
     */
    async getAllEvents(): Promise<CalendarEvent[]> {
        const currentYear = new Date().getFullYear();
        const startDate = `${currentYear}-01-01`;
        const endDate = `${currentYear}-12-31`;

        return this.getEventsByRange(startDate, endDate);
    },

    /**
     * Busca eventos de um ano específico
     */
    async getEventsByYear(year: number): Promise<CalendarEvent[]> {
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;

        return this.getEventsByRange(startDate, endDate);
    },

    /**
     * Busca eventos de um mês específico
     */
    async getEventsByMonth(year: number, monthIdx: number): Promise<CalendarEvent[]> {
        const month = String(monthIdx + 1).padStart(2, '0');
        const startDate = `${year}-${month}-01`;

        // Último dia do mês
        const lastDay = new Date(year, monthIdx + 1, 0).getDate();
        const endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;

        return this.getEventsByRange(startDate, endDate);
    },

    /**
     * Busca eventos de um dia específico
     */
    async getEventsByDay(year: number, monthIdx: number, day: number): Promise<CalendarEvent[]> {
        const month = String(monthIdx + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        const date = `${year}-${month}-${dayStr}`;

        return this.getEventsByRange(date, date);
    },

    /**
     * Cria novo evento e invalida cache
     */
    async createEvent(event: Omit<CalendarEvent, 'feriado_id'>): Promise<CalendarEvent> {
        const response = await fetch(`${API_URL}/events_create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(event),
        });

        if (!response.ok) {
            throw new Error('Erro ao criar evento');
        }

        const newEvent = await response.json();

        // Invalida cache do mês do evento criado
        const eventDate = parseDateLocal(event.feriado_data);
        const year = eventDate.getFullYear();
        const month = String(eventDate.getMonth() + 1).padStart(2, '0');
        const startDate = `${year}-${month}-01`;
        const lastDay = new Date(year, eventDate.getMonth() + 1, 0).getDate();
        const endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;

        await eventCache.delete(startDate, endDate);
        console.log('🗑️ Cache invalidado:', startDate, endDate);

        return newEvent;
    },

    /**
     * Limpa cache expirado
     */
    async clearExpiredCache() {
        await eventCache.clearExpired();
    },

    /**
     * Força atualização ignorando cache
     */
    async forceRefresh(startDate: string, endDate: string): Promise<CalendarEvent[]> {
        await eventCache.delete(startDate, endDate);
        return this.fetchFromAPI(startDate, endDate);
    }
};