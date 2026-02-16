import React, {useEffect, useState, useRef, useMemo} from 'react';
import {WEEK_DAYS_ABREVIATED, MONTH_NAMES, type CalendarEvent} from '../../../shared/types';
import { eventsApi } from '../../../shared/services/apiCache.ts';
import {
    getCalendarGridData,
    isToday,
    getDayOfWeekInGrid,
    isWeekend,
    parseLocalDate
} from '../../../shared/utils/dateHelpers.ts';
import {
    getEventStyle,
    hasHoliday
} from '../../../shared/utils/eventHelpers.ts';

interface MonthDetailProps {
    year: number;
    monthIdx: number;
    onBack: () => void;
    onDayClick: (monthIdx: number, day: number, react?: DOMRect) => void;
}

type EventsByMonthAndDay = {
    [month: number]: {
        [day: number]: CalendarEvent[];
    };
};

const MonthViewLandscape: React.FC<MonthDetailProps> = ({year, monthIdx, onBack, onDayClick}) => {
    // Estado para o título fixo (Scroll Spy)
    const [visibleMonthIdx, setVisibleMonthIdx] = useState(monthIdx);
    const months = Array.from({length: 12}, (_, i) => i);
    const isInitialScroll = useRef(true);
    const [yearEvents, setYearEvents] = useState<CalendarEvent[]>([]);
    const scrollTimeoutRef = useRef<number | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const fetchYearEvents = async () => {
            try {
                const allPromises = Array.from({length: 12}, (_, i) =>
                    eventsApi.getEventsByMonth(year, i)
                );
                const allData = await Promise.all(allPromises);
                const flatData = allData.flat();
                setYearEvents(flatData);
            } catch (error) {
                console.error('Erro ao carregar eventos:', error);
                setYearEvents([]);
            }
        };
        fetchYearEvents();
    }, [year]);

    // Agrupar eventos por dia
    const eventsByMonthAndDay = useMemo(() => {
        const grouped: EventsByMonthAndDay = {};
        yearEvents.forEach((evt) => {
            const eventDate = parseLocalDate(evt.feriado_data);
            const month = eventDate.getMonth();
            const day = eventDate.getDate();

            if (!grouped[month]) {
                grouped[month] = {};
            }

            if (!grouped[month][day]) {
                grouped[month][day] = [];
            }

            grouped[month][day].push(evt);
        });
        return grouped;
    }, [yearEvents]);

    useEffect(() => {
        const handleScroll = () => {
            if (isInitialScroll.current) return;

            // Limpa o timeout anterior
            if (scrollTimeoutRef.current) {
                window.clearTimeout(scrollTimeoutRef.current);
            }

            // ✅ Delay para atualizar apenas quando o scroll parar
            scrollTimeoutRef.current = window.setTimeout(() => {
                const container = containerRef.current;
                if (!container) return;

                const sections = container.querySelectorAll<HTMLElement>('.month-grid-section'); // ✅ Tipar o querySelectorAll
                const containerRect = container.getBoundingClientRect();

                let closestIdx = 0;
                let minDistance = Infinity;

                sections.forEach((section) => {
                    const rect = section.getBoundingClientRect();
                    // Calcula a distância do topo da seção até o topo do container
                    const distance = Math.abs(rect.top - containerRect.top);

                    if (distance < minDistance) {
                        minDistance = distance;
                        const idx = Number(section.dataset.monthIndex); // ✅ Usar dataset
                        if (!Number.isNaN(idx)) {
                            closestIdx = idx;
                        }
                    }
                });

                setVisibleMonthIdx(closestIdx);
            }, 300) as unknown as number;
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (container) {
                container.removeEventListener('scroll', handleScroll);
            }
            if (scrollTimeoutRef.current) {
                window.clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, []);


    // Scroll inicial para o mês selecionado
    useEffect(() => {
        setVisibleMonthIdx(monthIdx);
        isInitialScroll.current = true;

        const timeoutId = setTimeout(() => {
            const section = document.getElementById(`month-detail-section-${monthIdx}`);
            if (section && containerRef.current) {
                containerRef.current.scrollTop = section.offsetTop;
                setTimeout(() => {
                    isInitialScroll.current = false;
                }, 100);
            }
        }, 50);

        return () => clearTimeout(timeoutId)
    }, [containerRef, monthIdx]);

    const handleDayClick = (e: React.MouseEvent, mIdx: number, d: number) => {
        const rect = e.currentTarget.getBoundingClientRect();
        onDayClick(mIdx, d, rect);
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-950/95">
            {/* HEADER FIXO - Original mantido */}
            <div
                className="z-30 shadow-sm relative transition-all duration-300
                bg-white/95 backdrop-blur-sm border-b border-gray-300
                dark:bg-zinc-950/95 dark:border-zinc-800">
                <div className="flex items-center justify-between px-4 py-2">
                    <button onClick={onBack} className="flex items-center gap-1 hover:opacity-70 transition-opacity text-black dark:text-white">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 19L8 12L15 5"/>
                        </svg>
                        <span className="text-base font-semibold leading-none pb-0.5">{year}</span>
                    </button>

                    {/* Desenvolver a pesquisa de eventos da LUPA - Esperando pela API */}
                    <button className="p-2 -mr-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-black dark:text-white">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </button>
                </div>
            </div>

            {/* LAYOUT 60/40 - Abaixo do header */}
            <div className="flex flex-1 overflow-hidden">
                {/* ✅ LADO ESQUERDO - 60% - Calendário */}
                <div className="w-[50%] flex flex-col border-r border-gray-200 dark:border-zinc-800">
                    {/* Dias da Semana */}
                    <div className="flex-shrink-0 grid grid-cols-7 bg-gray-100 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800">
                        {WEEK_DAYS_ABREVIATED.map((d, idx) => (
                            <div
                                key={idx}
                                className="text-center py-0.5 text-[0.6rem] font-semibold text-gray-600 dark:text-zinc-400"
                            >
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* ÁREA DE ROLAGEM DOS MESES */}
                    <div
                        ref={containerRef}
                        className="flex-1 overflow-y-auto scroll-smooth bg-white dark:bg-zinc-950"
                        style={{
                            scrollSnapAlign: 'start',
                        }}
                    >
                        {months.map((mIdx) => {
                            const gridData = getCalendarGridData(year, mIdx);
                            const isDecember = mIdx === 11;

                            return (
                                <div
                                    key={mIdx}
                                    id={`month-detail-section-${mIdx}`}
                                    data-month-index={mIdx}
                                    className="month-grid-section"
                                    style={{
                                        scrollSnapAlign: 'start',
                                        scrollSnapStop: 'always',
                                    }}
                                >
                                    <div className={`grid grid-cols-7 ${!isDecember ? 'border-b-4 border-gray-300 dark:border-zinc-800' : ''}`}>
                                        {gridData.leadingBlanks.map((b) => (
                                            <div
                                                key={`blank-${b}`}
                                                className="min-h-[4.5rem] border-t border-gray-100 dark:border-zinc-800 bg-gray-50/30 dark:bg-zinc-900/20"
                                            />
                                        ))}

                                        {/* Dias */}
                                        {gridData.days.map((d) => {
                                            const dayOfWeek = getDayOfWeekInGrid(gridData.firstDayIdx, d);
                                            const isDayWeekend = isWeekend(dayOfWeek);
                                            const isFirstDay = d === 1;
                                            const isTodayDay = isToday(year, mIdx, d);
                                            const allEvents = eventsByMonthAndDay[mIdx]?.[d] || []
                                            const visibleEvents = allEvents.slice(0, 2);
                                            const remainingEvents = allEvents.length - 2;
                                            const dayHasFeriado = hasHoliday(allEvents);

                                            return (
                                                <div
                                                    key={d}
                                                    onClick={(e) => handleDayClick(e, mIdx, d)}
                                                    className={`min-h-[4.5rem] flex flex-col items-center justify-start px-1 pt-2 border-t relative transition-colors cursor-pointer active:scale-[0.98]
                                                        border-gray-100 dark:border-zinc-800
                                                        hover:bg-gray-50 dark:hover:bg-zinc-900
                                                        ${isDayWeekend ? 'bg-gray-50/50 dark:bg-zinc-900/30' : 'bg-white dark:bg-zinc-950'}`}
                                                >
                                                    {/*Destaque do dia de hoje*/}
                                                    <div
                                                        className={`
                                                            flex items-center justify-center text-xs font-medium transition-all
                                                            ${isTodayDay
                                                            ? 'w-5 h-5 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold ring-2 ring-black dark:ring-white'
                                                            : dayHasFeriado
                                                                ? 'text-red-500 dark:text-red-400 font-semibold'
                                                                : isDayWeekend
                                                                    ? 'text-gray-400 dark:text-zinc-500'
                                                                    : 'text-gray-700 dark:text-zinc-300'
                                                        }
                                                        `}
                                                    >
                                                        {d}
                                                    </div>

                                                    {/* Lista de Eventos */}
                                                    {visibleEvents.map((evt) => (
                                                        <div
                                                            key={evt.feriado_id}
                                                            className={`w-full px-1 py-0.5 mb-0.5 text-[10px] font-medium truncate rounded ${getEventStyle(evt.feriado_tipo)}`}
                                                        >
                                                            {evt.feriado_tipo}
                                                        </div>
                                                    ))}

                                                    {/* Contador */}
                                                    {remainingEvents > 0 && (
                                                        <div className="text-[10px] text-gray-500 dark:text-zinc-500 font-medium mt-auto">
                                                            +{remainingEvents}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ✅ LADO DIREITO - 40% - Título do Mês */}
                <div className="w-[50%] flex flex-col items-center justify-center bg-white dark:bg-zinc-900">
                    <div className="text-center px-4">
                        <h1 className="text-7xl font-bold text-gray-900 dark:text-white tracking-tight transition-all duration-300">
                            {MONTH_NAMES[visibleMonthIdx]}
                        </h1>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MonthViewLandscape;
