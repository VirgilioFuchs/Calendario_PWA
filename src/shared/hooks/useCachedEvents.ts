// hooks/useCachedEvents.ts
import { useState, useEffect, useCallback } from 'react';
import { eventsApi } from '../services/apiCache';
import type { CalendarEvent } from '../types';

export function useCachedEvents(year: number, monthIdx: number) {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const loadEvents = useCallback(async (force = false) => {
        setLoading(true);
        setError(null);

        try {
            const month = String(monthIdx + 1).padStart(2, '0');
            const startDate = `${year}-${month}-01`;
            const lastDay = new Date(year, monthIdx + 1, 0).getDate();
            const endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;

            const data = force
                ? await eventsApi.forceRefresh(startDate, endDate)
                : await eventsApi.getEventsByRange(startDate, endDate);

            setEvents(data);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [year, monthIdx]);

    useEffect(() => {
        loadEvents();
    }, [loadEvents]);

    const refresh = useCallback(() => {
        loadEvents(true);
    }, [loadEvents]);

    return { events, loading, error, refresh };
}
