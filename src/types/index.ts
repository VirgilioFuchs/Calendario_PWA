export type ViewMode = 'day' | 'month';

export interface CalendarEvent {
    id: string;
    title: string;
    startHour: number; // 0-23
    duration: number; // em horas
    type: 'work' | 'personal';
    day: number; // dia do mês
}

export const MONTH_NAMES = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export const WEEK_DAYS_ABREVIATED = ["D", "S", "T", "Q", "Q", "S", "S"];

// Gera os dias do mês
export const getDaysInMonth = (year: number, monthIndex: number) => {
    return new Date(year, monthIndex + 1, 0).getDate();
};

export const getWeekDay = (year: number, monthIndex: number, day: number) => {
    return WEEK_DAYS[new Date(year, monthIndex, day).getDay()].charAt(0);
};

// Lista (mock) eventos
export const generateMockEvents = (day: number): CalendarEvent[] => {
    if (day % 2 !== 0) return [];
    return [
        { id: `evt-${day}-1`, title: 'Reunião Status', startHour: 9, duration: 1.5, type: 'work', day },
        { id: `evt-${day}-2`, title: 'Entrega Projeto', startHour: 14, duration: 1, type: 'personal', day }
    ];
};