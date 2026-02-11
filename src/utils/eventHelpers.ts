import type { CalendarEvent } from '../types';

// ============================================
// EVENT TYPE NORMALIZATION
// ============================================

const KNOWN_EVENT_TYPES = ['trabalho', 'férias', 'feriado', 'festa'] as const;
const DEFAULT_EVENT_TYPE = 'outros';

type EventTypeConfig = {
    style: string;
    ring: string;
    dot: string;
};

const DEFAULT_EVENT_CONFIG: EventTypeConfig = {
    style: 'bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-950/45 dark:text-blue-200 dark:border-blue-800',
    ring: 'ring-blue-500 dark:ring-blue-500',
    dot: 'bg-blue-800 dark:bg-blue-500',
};

const EVENT_TYPE_CONFIG: Record<string, EventTypeConfig> = {
    trabalho: {
        style: 'bg-gray-100 text-gray-700 border border-gray-200 dark:bg-zinc-800/70 dark:text-zinc-100 dark:border-zinc-700',
        ring: 'ring-gray-500 dark:ring-zinc-500',
        dot: 'bg-gray-800 dark:bg-zinc-500',
    },
    férias: {
        style: 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-950/45 dark:text-green-200 dark:border-green-800',
        ring: 'ring-green-600 dark:ring-green-500',
        dot: 'bg-green-800 dark:bg-green-500',
    },
    feriado: {
        style: 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-950/45 dark:text-red-200 dark:border-red-800',
        ring: 'ring-red-500 dark:ring-red-500',
        dot: DEFAULT_EVENT_CONFIG.dot,
    },
    festa: {
        style: 'bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-950/45 dark:text-purple-200 dark:border-purple-800',
        ring: 'ring-purple-500 dark:ring-purple-500',
        dot: 'bg-purple-800 dark:bg-purple-500',
    },
    [DEFAULT_EVENT_TYPE]: DEFAULT_EVENT_CONFIG,
};

/**
 * Normalizes an event type string to a known category.
 * Returns 'outros' if the type is invalid or unrecognized.
 */
const normalizeEventType = (type: string | boolean | null | undefined): string => {
    if (!type || typeof type !== 'string') {
        return DEFAULT_EVENT_TYPE;
    }

    const tipoLower = type.toLowerCase();

    if ((KNOWN_EVENT_TYPES as readonly string[]).includes(tipoLower)) {
        return tipoLower;
    }
    return DEFAULT_EVENT_TYPE;
};

const getEventTypeConfig = (type: string): EventTypeConfig => {
    const tipoLower = normalizeEventType(type);
    return EVENT_TYPE_CONFIG[tipoLower] ?? DEFAULT_EVENT_CONFIG;
};

// ============================================
// EVENT STYLE HELPERS
// ============================================

/**
 * Returns Tailwind classes for event card styling based on type.
 * Used in MonthView, DayView (calendar cells, event cards).
 */
export const getEventStyle = (type: string): string => {
    return getEventTypeConfig(type).style;
};

/**
 * Returns Tailwind ring color classes for selected event highlighting.
 */
export const getEventRingColor = (type: string): string => {
    return getEventTypeConfig(type).ring;
};

/**
 * Returns dot color for mini calendar indicators.
 */
export const getDotColor = (type: string): string => {
    return getEventTypeConfig(type).dot;
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
