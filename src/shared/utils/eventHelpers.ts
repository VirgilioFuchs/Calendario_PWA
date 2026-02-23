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
            // Base: blue-300 (light) / blue-900 (dark)
            // Fundo claro com texto escuro no Light | Fundo escuro com texto claro no Dark
            return 'bg-[#eff6ff] text-[#1e3a8a] border border-[#93c5fd] dark:bg-[#1e3a8a]/40 dark:text-[#93c5fd] dark:border-[#1e3a8a]';

        case 'festa':
            // Base: purple-300 (light) / purple-900 (dark)
            return 'bg-[#faf5ff] text-[#581c87] border border-[#d8b4fe] dark:bg-[#581c87]/40 dark:text-[#d8b4fe] dark:border-[#581c87]';

        case 'feriado':
            // Base: red-300 (light) / red-900 (dark)
            return 'bg-[#fef2f2] text-[#7f1d1d] border border-[#fca5a5] dark:bg-[#7f1d1d]/40 dark:text-[#fca5a5] dark:border-[#7f1d1d]';

        case 'férias':
            // Base: green-300 (light) / green-900 (dark)
            return 'bg-[#f0fdf4] text-[#14532d] border border-[#86efac] dark:bg-[#14532d]/40 dark:text-[#86efac] dark:border-[#14532d]';

        case 'outros':
            // Base: yellow-300 (light) / yellow-900 (dark)
            return 'bg-[#fefce8] text-[#713f12] border border-[#fde047] dark:bg-[#713f12]/40 dark:text-[#fde047] dark:border-[#713f12]';

        default:
            // Base neutra (slate/gray)
            return 'bg-[#f8fafc] text-[#334155] border border-[#cbd5e1] dark:bg-[#334155]/40 dark:text-[#cbd5e1] dark:border-[#334155]';
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
            return 'ring-[#fde047] dark:ring-[#713f12]';
    }
};

/**
 * Returns dot color for mini calendar indicators.
 */
export const getDotColor = (type: string): string => {
    switch (normalizeEventType(type)) {
        case 'trabalho': return 'bg-[#93c5fd] dark:bg-[#1e3a8a]';
        case 'festa':    return 'bg-[#d8b4fe] dark:bg-[#581c87]';
        case 'outros':   return 'bg-[#fde047] dark:bg-[#713f12]';
        default:         return '';
    }
};

/**
 * Returns number color to indicate feriado and férias.
 */
export const getDayNumberColor = (type: string): string => {
    switch (normalizeEventType(type)) {
        case 'feriado': return 'text-[#fca5a5] dark:text-[#7f1d1d] font-semibold';
        case 'férias':  return 'text-[#86efac] dark:text-[#14532d] font-semibold';
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