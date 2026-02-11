// ============================================
// TIME CONVERSION, FORMATTING & PARSING
// ============================================

/**
 * Converts a time string "HH:MM:SS" or "HH:MM" to a decimal number.
 * Returns 8 (8:00) as default if null.
 */
export const timeStringToDecimal = (timeStr: string | null): number => {
    if (!timeStr) return 8;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + (minutes / 60);
};

/**
 * Formats a time string "HH:MM:SS" to "HH:MM".
 */
export const formatTimeString = (timeStr: string | null): string => {
    if (!timeStr) return '--:--';
    return timeStr.substring(0, 5);
};

/**
 * Formats a decimal time (e.g., 14.5) to "HH:MM" string.
 */
export const formatDecimalTime = (decimalTime: number): string => {
    const h = Math.floor(decimalTime);
    const m = Math.round((decimalTime - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

/**
 * Formats a Date to ISO string "YYYY-MM-DD".
 */
export const formatDateToISO = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Parses a date string and returns a Date object in local timezone.
 * Prevents timezone offset issues that cause day-1 bugs.
 */
export const parseLocalDate = (dateStr: string): Date => {
    if (!dateStr) return new Date();
    const datePart = dateStr.split('T')[0];
    const [year, month, day] = datePart.split('-').map(Number);
    return new Date(year, month - 1, day);
};

// ============================================
// DATE CALCULATIONS
// ============================================

/**
 * Gets today's date info (cached per render cycle).
 */
export const getTodayInfo = () => {
    const today = new Date();
    return {
        date: today,
        day: today.getDate(),
        month: today.getMonth(),
        year: today.getFullYear(),
    };
};

/**
 * Returns the number of days in a given month.
 */
export const getDaysInMonth = (year: number, monthIdx: number): number => {
    return new Date(year, monthIdx + 1, 0).getDate();
};

/**
 * Returns an array of day numbers [1, 2, 3, ...] for a month.
 */
export const getDaysArray = (year: number, monthIdx: number): number[] => {
    const totalDays = getDaysInMonth(year, monthIdx);
    return Array.from({ length: totalDays }, (_, i) => i + 1);
};

/**
 * Gets the day of week index (0=Sunday) for the first day of a month.
 */
export const getFirstDayOfMonth = (year: number, monthIdx: number): number => {
    return new Date(year, monthIdx, 1).getDay();
};

/**
 * Generates blank slots for calendar grid before the first day.
 */
export const getLeadingBlanks = (year: number, monthIdx: number): number[] => {
    const firstDayIdx = getFirstDayOfMonth(year, monthIdx);
    return Array.from({ length: firstDayIdx }, (_, i) => i);
};

/**
 * Generates trailing blank slots to complete a calendar grid.
 */
export const getTrailingBlanks = (
    year: number,
    monthIdx: number,
    totalSlots: number = 42
): number[] => {
    const firstDayIdx = getFirstDayOfMonth(year, monthIdx);
    const daysInMonth = getDaysInMonth(year, monthIdx);
    const usedSlots = firstDayIdx + daysInMonth;
    const remaining = Math.max(0, totalSlots - usedSlots);
    return Array.from({ length: remaining }, (_, i) => i);
};

// ============================================
// DAY TYPE CHECKS
// ============================================

/**
 * Checks if a day index (0-6) is a weekend (Sunday=0 or Saturday=6).
 */
export const isWeekend = (dayOfWeek: number): boolean => {
    return dayOfWeek === 0 || dayOfWeek === 6;
};

/**
 * Gets the day of week for a specific date.
 */
export const getDayOfWeek = (year: number, monthIdx: number, day: number): number => {
    return new Date(year, monthIdx, day).getDay();
};

/**
 * Checks if a day is a weekend given year, month, and day.
 */
export const isDayWeekend = (year: number, monthIdx: number, day: number): boolean => {
    return isWeekend(getDayOfWeek(year, monthIdx, day));
};

/**
 * Checks if a given date is today.
 */
export const isToday = (year: number, monthIdx: number, day: number): boolean => {
    const today = getTodayInfo();
    return day === today.day && monthIdx === today.month && year === today.year;
};

/**
 * Checks if the given month/year is the current month.
 */
export const isCurrentMonth = (year: number, monthIdx: number): boolean => {
    const today = getTodayInfo();
    return monthIdx === today.month && year === today.year;
};

// ============================================
// CALENDAR GRID HELPERS
// ============================================

/**
 * Calculates the day of week for any day in a month grid.
 * Useful when iterating through days.
 */
export const getDayOfWeekInGrid = (firstDayIdx: number, dayNumber: number): number => {
    return (firstDayIdx + dayNumber - 1) % 7;
};

/**
 * Complete calendar grid data for a month.
 */
export interface CalendarGridData {
    daysInMonth: number;
    firstDayIdx: number;
    days: number[];
    leadingBlanks: number[];
    trailingBlanks: number[];
}

export const getCalendarGridData = (
    year: number,
    monthIdx: number,
    totalSlots: number = 42
): CalendarGridData => {
    return {
        daysInMonth: getDaysInMonth(year, monthIdx),
        firstDayIdx: getFirstDayOfMonth(year, monthIdx),
        days: getDaysArray(year, monthIdx),
        leadingBlanks: getLeadingBlanks(year, monthIdx),
        trailingBlanks: getTrailingBlanks(year, monthIdx, totalSlots),
    };
};