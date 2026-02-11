export interface CalendarEvent {
    feriado_id: number;
    feriado_titulo: string;
    feriado_descricao: string;
    feriado_tipo: string;
    feriado_dia_inteiro: boolean;
    feriado_inicio: string | null; // "HH:MM:SS"
    feriado_fim: string | null; // "HH:MM:SS"
    feriado_data: string; // "YYYY-MM-DD"
    feriado_duracao_dias: number;
}

// Constantes (mantém)
export const WEEK_DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
export const MONTH_NAMES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];
export const WEEK_DAYS_ABREVIATED = ["D", "S", "T", "Q", "Q", "S", "S"];

// Gera os dias do mês
export const getDaysInMonth = (year: number, monthIndex: number) => {
    return new Date(year, monthIndex + 1, 0).getDate();
};

export const getWeekDay = (year: number, monthIndex: number, day: number) => {
    return WEEK_DAYS[new Date(year, monthIndex, day).getDay()].charAt(0);
};