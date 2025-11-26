export type ViewMode = 'day' | 'month';

export interface CalendarEvent {
    id: string;
    title: string;
    description: string;
    startHour: number; // 0-23
    duration: number; // em horas
    type: 'Festa' | 'Feriado' | 'Férias' | 'Trabalho' | 'Pessoal';
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
        {
            id: `evt-${day}-1`,
            title: 'Reunião de Alinhamento',
            description: 'Discutir as metas do calendário e alinhar expectativas com a equipe de desenvolvimento PWA.',
            type: 'Trabalho',
            startHour: 9,
            duration: 1.5,
            day
        },
        {
            id: `evt-${day}-2`,
            title: 'Almoço com Equipe',
            description: 'Confraternização entre a equipe.',
            type: 'Festa',
            startHour: 12.5,
            duration: 1.5,
            day
        },
        {
            id: `evt-${day}-3`,
            title: 'Entrega Projeto',
            description: 'Finalizar documentação e subir para o repositório.',
            type: 'Pessoal',
            startHour: 15,
            duration: 1,
            day
        }
    ];
};