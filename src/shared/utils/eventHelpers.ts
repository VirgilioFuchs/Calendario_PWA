import type { CalendarEvent } from '../types';

// ============================================
// EVENT TYPE NORMALIZATION
// ============================================

const KNOWN_EVENT_TYPES = ['trabalho', 'férias', 'feriado', 'festa'] as const;

/**
 * Normalizes an event type string to a known category.
 * Returns 'outros' if the type is invalid or unrecognized.
 */
export const normalizeEventType = (type: string | boolean | null | undefined): string => {
    if (!type || typeof type !== 'string') return 'outros';
    const tipoLower = type.toLowerCase().trim();
    return (KNOWN_EVENT_TYPES as readonly string[]).includes(tipoLower)
        ? tipoLower
        : 'outros';
};

// ============================================
// EVENT STYLE HELPERS
// ============================================

/**
 * Returns Tailwind classes for event card styling based on type.
 * Used in MonthView, DayView (calendar cells, event cards).
 */
export const getEventStyle = (type: string): string => {
    const tipoLower = normalizeEventType(type);
    switch (tipoLower) {
        case 'trabalho':
            return 'bg-gray-100 text-gray-700 border border-gray-200 dark:bg-zinc-800/70 dark:text-zinc-100 dark:border-zinc-700';
        case 'férias':
            return 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-950/45 dark:text-green-200 dark:border-green-800';
        case 'feriado':
            return 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-950/45 dark:text-red-200 dark:border-red-800';
        case 'festa':
            return 'bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-950/45 dark:text-purple-200 dark:border-purple-800';
        default:
            return 'bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-950/45 dark:text-blue-200 dark:border-blue-800';
    }
};

/**
 * Returns Tailwind ring color classes for selected event highlighting.
 */
export const getEventRingColor = (type: string): string => {
    const tipoLower = normalizeEventType(type);
    switch (tipoLower) {
        case 'trabalho':
            return 'ring-gray-500 dark:ring-zinc-500';
        case 'férias':
            return 'ring-green-600 dark:ring-green-500';
        case 'feriado':
            return 'ring-red-500 dark:ring-red-500';
        case 'festa':
            return 'ring-purple-500 dark:ring-purple-500';
        default:
            return 'ring-blue-500 dark:ring-blue-500';
    }
};

/**
 * Returns dot color for mini calendar indicators.
 */
export const getDotColor = (type: string): string => {
    switch (normalizeEventType(type)) {
        case 'trabalho': return 'bg-gray-500 dark:bg-zinc-400';
        case 'festa':    return 'bg-purple-500 dark:bg-purple-400';
        case 'outros':   return 'bg-blue-500 dark:bg-blue-400';
        default:         return '';
    }
};

/**
 * Returns number color to indicate feriado and férias.
 */
export const getDayNumberColor = (type: string): string => {
    switch (normalizeEventType(type)) {
        case 'feriado': return 'text-red-500 dark:text-red-400 font-semibold';
        case 'férias':  return 'text-green-500 dark:text-green-400 font-semibold';
        default:        return '';
    }
};

/**
 * Others types change color number to blue, but only if there are no feriado or férias events on the same day.
 */
export const isDateMarkerType = (type: string): boolean => {
    const t = normalizeEventType(type);
    return t === 'feriado' || t === 'férias';
};

// ============================================
// EVENT DAY HELPERS
// ============================================

/**
 * Gets unique event types for a given day (excluding 'feriado').
 */
export const getUniqueTypesForDay = (events: CalendarEvent[]): string[] => {
    const types = events.map(evt => normalizeEventType(evt.feriado_tipo));
    return [...new Set(types)].filter(type => type !== 'feriado');
};

/**
 * Checks if any event on a given day is a holiday (feriado).
 */
export const hasHoliday = (events: CalendarEvent[]): boolean => {
    return events.some(evt => normalizeEventType(evt.feriado_tipo) === 'feriado');
};

// ============================================
// EVENT DATA GROUPING
// ============================================

/**
 * Groups events by month and day for efficient lookup.
 */
export const groupEventsByMonthAndDay = (
    events: CalendarEvent[]
): Record<number, Record<number, CalendarEvent[]>> => {
    const grouped: Record<number, Record<number, CalendarEvent[]>> = {};

    events.forEach((evt) => {
        const [evtYear, month, day] = evt.feriado_data.split('T')[0].split('-').map(Number);
        const eventDate = new Date(evtYear, month - 1, day);
        const monthNum = eventDate.getMonth();
        const dayNum = eventDate.getDate();

        if (!grouped[monthNum]) {
            grouped[monthNum] = {};
        }
        if (!grouped[monthNum][dayNum]) {
            grouped[monthNum][dayNum] = [];
        }
        grouped[monthNum][dayNum].push(evt);
    });

    return grouped;
};