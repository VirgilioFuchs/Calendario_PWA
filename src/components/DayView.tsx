import React, {useEffect, useMemo, useState} from 'react';
import {WEEK_DAYS, MONTH_NAMES, type CalendarEvent} from '../types';
import {eventsApi} from "../services/api.ts";
import {useDragScroll} from '../hooks/useDragScroll';
import '../App.css';

interface DayViewProps {
    currentYear: number;
    currentMonthIdx: number;
    selectedDay: number;
    onBack: () => void;
    onEventClick: (event: CalendarEvent) => void;
    horizontalMode?: boolean;
}

const HOUR_HEIGHT = 60;

const timeStringToDecimal = (timeStr: string | null): number => {
    if (!timeStr) return 8;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + (minutes / 60);
};

//Campo de vizualização de dias
const DayView: React.FC<DayViewProps> = ({
                                             currentYear,
                                             currentMonthIdx,
                                             selectedDay,
                                             onBack,
                                             onEventClick,
                                             horizontalMode = false,
                                         }) => {
    const containerRef = useDragScroll<HTMLDivElement>(); // Hook para arrastar e rolar pelo mouse do computador
    const hours = useMemo(() => Array.from({length: 17}, (_, i) => i + 7), []);
    const headerDate = new Date(currentYear, currentMonthIdx, selectedDay);
    const dayTitle = `${WEEK_DAYS[headerDate.getDay()]}, ${selectedDay} de ${MONTH_NAMES[currentMonthIdx]} de ${currentYear}`;
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [isLoading, setIsLoading] = useState(false); // Desenvolver a tela de carregamento
    const [activeTab, setActiveTab] = useState<'legendas' | 'eventos'>('eventos');

    const allDayEvents = useMemo(() =>
            events.filter(evt => evt.feriado_dia_inteiro),
        [events]
    );

    const timedEvents = useMemo(() =>
            events.filter(evt => !evt.feriado_dia_inteiro),
        [events]
    );

    useEffect(() => {
        const fetchDayEvents = async () => {
            setIsLoading(true);
            try {
                console.log('Buscando eventos:', {currentYear, currentMonthIdx, selectedDay});
                const data = await eventsApi.getEventsByDay(currentYear, currentMonthIdx, selectedDay);
                console.log('Eventos retornados:', data);
                setEvents(data);
            } catch (error) {
                console.error('Erro ao carregar eventos:', error);
                setEvents([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDayEvents();
    }, [currentYear, currentMonthIdx, selectedDay]);

    const getCalendarEventStyle = (type: string) => {
        const tipoLower = type.toLowerCase();
        switch (tipoLower) {
            case 'trabalho':
                return 'bg-gray-100 text-gray-700 border-gray-500 dark:bg-zinc-800/70 dark:text-zinc-100 dark:border-zinc-500';
            case 'férias':
                return 'bg-green-100 text-green-800 border-green-600 dark:bg-green-950/55 dark:text-green-200 dark:border-green-500';
            case 'feriado':
                return 'bg-red-100 text-red-800 border-red-500 dark:bg-red-950/55 dark:text-red-200 dark:border-red-500';
            case 'festa':
                return 'bg-purple-100 text-purple-800 border-purple-500 dark:bg-purple-950/55 dark:text-purple-200 dark:border-purple-500';
            default:
                return 'bg-blue-50 text-blue-800 border-blue-500 dark:bg-blue-950/55 dark:text-blue-200 dark:border-blue-500';
        }
    };

    const formatTime = (decimalTime: number) => {
        const h = Math.floor(decimalTime);
        const m = Math.round((decimalTime - h) * 60);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };


    return (
        <div
            className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 h-full relative z-50 max-w-[100vw]"
        >
            {/* HEADER */}
            <div className="flex items-center justify-between px-4 py-2 border-b shrink-0 sticky top-0 z-20 backdrop-blur-sm
                bg-white/90 border-gray-200 hover:bg-gray-50
                dark:bg-zinc-950/80 dark:border-zinc-800 dark:hover:bg-zinc-900/40">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 p-2 rounded-full transition-colors text-gray-900 dark:text-zinc-100
                        hover:bg-gray-100 dark:hover:bg-zinc-900/50"
                >
                    {/* Botão voltar */}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                              strokeLinejoin="round"/>
                    </svg>
                    {/* Mês ao lado do voltar (Mês Atual) */}
                    <span className="text-base font-semibold leading-none pb-0.5">
                        {MONTH_NAMES[currentMonthIdx]}
                    </span>
                </button>

                {/* Lupa - desenvolver a pesquisa de eventos*/}
                <button className='p-2 -mr-2 dark:text-white text-black'>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         strokeWidth="2.5"
                         strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </button>
            </div>

            {/* TÍTULO DO DIA */}
            {!horizontalMode && (
                <div className="text-center py-3 px-4 border-b border-gray-200 dark:border-zinc-800">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-zinc-100">
                        {dayTitle}
                    </h2>
                    {allDayEvents.length > 0 && (
                        <div className="mt-2 justify-center">
                        <span className="text-xs font-semibold text-gray-600 dark:text-zinc-400">
                            Dia inteiro:{' '}
                        </span>
                            <div className="mt-1 flex flex-wrap gap-2 justify-center">
                                {allDayEvents.map((evt) => (
                                    <span
                                        key={evt.feriado_id}
                                        onClick={() => onEventClick(evt)}
                                        className={`
                                        px-2 py-1 rounded text-xs font-medium cursor-pointer
                                        hover:brightness-95 transition-all
                                        ${getCalendarEventStyle(evt.feriado_tipo)}
                                    `}
                                    >
                                    {evt.feriado_titulo}
                                </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* TIMELINE DOS EVENTOS */}
            <div
                className={horizontalMode ? 'flex flex-row flex-1 overflow-hidden' : 'flex flex-col flex-1 overflow-hidden'}>
                {/* TIMELINE - 60% no horizontal, 100% no vertical */}
                <div
                    ref={containerRef}
                    className={`overflow-y-auto relative cursor-grab active:cursor-grabbing select-none bg-white dark:bg-zinc-950 dark:accent-indigo-500 px-4
                    ${horizontalMode ? 'w-[60%] border-r border-gray-200 dark:border-zinc-800' : 'flex-1'}
                `}
                >
                    <div className={`relative pt-6 max-w-full overflow-hidden ${horizontalMode ? 'pb-0.5' : 'pb-14'}`}>
                        {/* Linhas de hora */}
                        {hours.map((hour) => (
                            <div
                                key={hour}
                                className="relative"
                                style={{height: `${HOUR_HEIGHT}px`}}
                            >
                                <div
                                    className="absolute top-0 right-0 border-t border-gray-100 dark:border-zinc-800"
                                    style={{left: '56px'}}
                                />
                                <span
                                    className="absolute left-0 text-xs font-medium text-gray-400 dark:text-zinc-500 bg-white dark:bg-zinc-950 pr-3"
                                    style={{top: '-8px'}}
                                >
                                {hour.toString().padStart(2, '0')}:00
                            </span>
                            </div>
                        ))}

                        {/* EVENTOS */}
                        {timedEvents.map(evt => {
                            const startHour = timeStringToDecimal(evt.feriado_inicio);
                            let duration = 1;

                            if (evt.feriado_inicio && evt.feriado_fim) {
                                const endHour = timeStringToDecimal(evt.feriado_fim);
                                duration = endHour - startHour;
                            } else if (evt.feriado_dia_inteiro) {
                                duration = 8;
                            }

                            const startHourIndex = startHour - hours[0];
                            const topPosition = startHourIndex * HOUR_HEIGHT + (startHour % 1) * HOUR_HEIGHT;
                            const eventHeight = duration * HOUR_HEIGHT;
                            const isShortEvent = duration <= 1;
                            const startTime = formatTime(startHour);
                            const endTime = formatTime(startHour + duration);

                            return (
                                <div
                                    key={evt.feriado_id}
                                    onClick={() => onEventClick(evt)}
                                    className={`absolute left-14 right-0 rounded-xl border-l-4 shadow-sm overflow-hidden cursor-pointer 
                                    hover:brightness-95 active:scale-[0.98] transition-transform z-10
                                    ${getCalendarEventStyle(evt.feriado_tipo)}
                                    ${isShortEvent
                                        ? 'flex flex-row items-start justify-between p-2 px-3'
                                        : 'flex flex-col justify-start p-3'}
                                `}
                                    style={{
                                        top: `${topPosition}px`,
                                        height: `${Math.max(eventHeight, 40)}px`,
                                    }}
                                >
                                    {isShortEvent ? (
                                        <>
                                            <div className="flex flex-col min-w-0 pr-2">
                                            <span className="font-bold text-sm leading-tight truncate">
                                                {evt.feriado_titulo}
                                            </span>
                                            </div>
                                            <div className="text-xs opacity-90 whitespace-nowrap font-medium shrink-0">
                                                {startTime}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                        <span className="font-bold text-base leading-tight truncate">
                                            {evt.feriado_titulo}
                                        </span>
                                            <div className="mt-1.5 text-xs opacity-80 flex items-center gap-1">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                                                     stroke="currentColor" strokeWidth="3">
                                                    <circle cx="12" cy="12" r="10"></circle>
                                                    <polyline points="12 6 12 12 16 14"></polyline>
                                                </svg>
                                                {startTime} - {endTime}
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* PAINEL DIREITO - 40% */}
                {horizontalMode && (
                    <div
                        className="w-[40%] flex flex-col overflow-hidden border-b border-gray-200 dark:border-zinc-700">
                        <div className="flex-1 overflow-y-auto p-4">
                            <h2 className="text-lg text-center font-semibold text-gray-800 dark:text-zinc-100">
                                {dayTitle}
                            </h2>
                        </div>
                        {/* Navigation Bottom */}
                        <div className="px-6 pb-1.5">
                            <div className="bg-white dark:bg-zinc-800 rounded-md shadow-sm border border-gray-200 dark:border-zinc-700 overflow-hidden">
                                <div className="flex">
                                    <button
                                        onClick={() => setActiveTab('legendas')}
                                        className={`flex-1 py-1.5 text-xs font-medium transition-colors
                    border-r border-gray-200 dark:border-zinc-700
                    ${activeTab === 'legendas'
                                            ? 'bg-black text-white dark:bg-white dark:text-black font-bold shadow-md'
                                            : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-700/50'
                                        }`}
                                    >
                                        Legendas
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('eventos')}
                                        className={`flex-1 py-1.5 text-xs font-medium transition-colors
                    ${activeTab === 'eventos'
                                            ? 'bg-black text-white dark:bg-white dark:text-black font-bold shadow-md'
                                            : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-700/50'
                                        }`}
                                    >
                                        Eventos
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );

};

export default DayView;


