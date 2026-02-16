import React, {useEffect, useMemo, useRef, useState} from 'react';
import {WEEK_DAYS, MONTH_NAMES, type CalendarEvent} from '../../../shared/types';
import {eventsApi} from '../../../shared/services/apiCache.ts';
import '../../../app/App.css';
import {
    getEventStyle,
    getEventRingColor,
} from '../../../shared/utils/eventHelpers.ts';
import {
    timeStringToDecimal,
    formatDecimalTime,
} from '../../../shared/utils/dateHelpers.ts';

interface DayViewPortraitProps {
    currentYear: number;
    currentMonthIdx: number;
    selectedDay: number;
    onBack: () => void;
    onEventClick: (event: CalendarEvent) => void;
    onDayChange?: (day: number, monthIdx: number, year: number) => void;
}

const HOUR_HEIGHT = 60;

const DayViewPortrait: React.FC<DayViewPortraitProps> = ({
                                                             currentYear,
                                                             currentMonthIdx,
                                                             selectedDay,
                                                             onBack,
                                                             onEventClick,
                                                         }) => {
    const hours = useMemo(() => Array.from({length: 17}, (_, i) => i + 7), []);
    const headerDate = new Date(currentYear, currentMonthIdx, selectedDay);
    const dayTitle = `${WEEK_DAYS[headerDate.getDay()]}, ${selectedDay} de ${MONTH_NAMES[currentMonthIdx]} de ${currentYear}`;
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const eventRefs = useRef<Map<number, HTMLDivElement>>(new Map());

    // Eventos dia inteiro
    const allDayEvents = useMemo(() =>
            events.filter(evt => evt.feriado_dia_inteiro),
        [events]
    );

    // Eventos com dia normal
    const timedEvents = useMemo(() =>
            events.filter(evt => !evt.feriado_dia_inteiro),
        [events]
    );

    // Eventos da timeline (do dia)
    useEffect(() => {
        const fetchDayEvents = async () => {
            try {
                console.log('Buscando eventos:', {currentYear, currentMonthIdx, selectedDay});
                const data = await eventsApi.getEventsByDay(currentYear, currentMonthIdx, selectedDay);
                console.log('Eventos retornados:', data);
                setEvents(data);
            } catch (error) {
                console.error('Erro ao carregar eventos:', error);
                setEvents([]);
            }
        };
        fetchDayEvents();
    }, [currentYear, currentMonthIdx, selectedDay]);

    const handleEventClickInternal = (evt: CalendarEvent) => {
        setSelectedEventId(evt.feriado_id);
        onEventClick(evt);
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

            {/* Título*/}
            <div className="text-center py-3 px-4 border-b border-gray-200 dark:border-zinc-800 shrink-0">
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
                                    onClick={() => handleEventClickInternal(evt)}
                                    className={`
                                        px-2 py-1 rounded text-xs font-medium cursor-pointer
                                        hover:brightness-95 transition-all
                                        ${getEventStyle(evt.feriado_tipo)}
                                    `}
                                >
                                    {evt.feriado_titulo}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Timeline*/}
            <div
                className="overflow-y-auto relative cursor-grab active:cursor-grabbing select-none bg-white dark:bg-zinc-950 dark:accent-indigo-500 px-4
                flex-1"
            >
                <div className="relative pt-6 pb-14">
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

                        const topPosition = (startHour - hours[0]) * HOUR_HEIGHT;
                        const eventHeight = duration * HOUR_HEIGHT;
                        const isShortEvent = duration <= 1;
                        const startTime = formatDecimalTime(startHour);
                        const endTime = formatDecimalTime(startHour + duration);

                        return (
                            <div
                                key={evt.feriado_id}
                                ref={(el) => {
                                    if (el) {
                                        eventRefs.current.set(evt.feriado_id, el);
                                    } else {
                                        eventRefs.current.delete(evt.feriado_id);
                                    }
                                }}
                                onClick={() => handleEventClickInternal(evt)}
                                className={`absolute left-14 right-0 rounded-xl border-l-4 shadow-sm overflow-hidden cursor-pointer 
                                        hover:brightness-95 active:scale-[0.98] transition-transform z-10
                                        ${getEventStyle(evt.feriado_tipo)}
                                        ${selectedEventId === evt.feriado_id ? `ring-2 ${getEventRingColor(evt.feriado_tipo)} brightness-110` : ''}
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
        </div>
    );
};

export default DayViewPortrait;
