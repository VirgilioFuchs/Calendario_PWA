import type { CalendarEvent } from '../types';

const API_URL = "http://192.168.70.163:8000";

const parseDateLocal = (dateString: string): Date => {
    const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
    return new Date(year, month - 1, day);
};

export const eventsApi = {

    async getAllEvents(): Promise<CalendarEvent[]> {
        const response = await fetch(`${API_URL}/events_list`);
        if (!response.ok) throw new Error('Erro ao buscar eventos');
        return await response.json();
    },

    async getEventsByYear(year: number): Promise<CalendarEvent[]> {
        const allEvents = await this.getAllEvents();
        return allEvents.filter(event => {
            const [y, m, d] = event.feriado_data.split('T')[0].split('-').map(Number);
            const eventDate = new Date(y, m -1, d);
            return eventDate.getFullYear() === year;
        });
    },

    async getEventsByMonth(year: number, monthIdx: number): Promise<CalendarEvent[]> {
        const allEvents = await this.getAllEvents();
        return allEvents.filter(event => {
            const eventDate = parseDateLocal(event.feriado_data);
            return eventDate.getFullYear() === year && eventDate.getMonth() === monthIdx;
        });
    },

    async getEventsByDay(year: number, monthIdx: number, day: number): Promise<CalendarEvent[]> {
        const allEvents = await this.getAllEvents();
        return allEvents.filter(event => {
            const eventDate = parseDateLocal(event.feriado_data);
            return (
                eventDate.getFullYear() === year &&
                eventDate.getMonth() === monthIdx &&
                eventDate.getDate() === day
            );
        });
    },

    async createEvent(event: Omit<CalendarEvent, 'feriado_id'>): Promise<CalendarEvent> {
        const response = await fetch(`${API_URL}/events_create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(event),
        });

        if (!response.ok) throw new Error('Erro ao criar evento');
        return await response.json();
    }
};
