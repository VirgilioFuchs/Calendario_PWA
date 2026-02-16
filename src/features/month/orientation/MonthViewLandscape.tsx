import React, {useEffect, useState, useRef, useMemo} from 'react';
import {WEEK_DAYS_ABREVIATED, MONTH_NAMES, type CalendarEvent} from '../../../shared/types';
import {useDragScroll} from '../../../shared/hooks/useDragScroll.ts';
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
    const containerRef = useDragScroll<HTMLDivElement>();

    // Estado para o título fixo (Scroll Spy)
    const [visibleMonthIdx, setVisibleMonthIdx] = useState(monthIdx);
    const months = Array.from({length: 12}, (_, i) => i);
    const isInitialScroll = useRef(true);
    const [yearEvents, setYearEvents] = useState<CalendarEvent[]>([]);

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
    const eventsByMonthAndDay = useMemo<EventsByMonthAndDay>(() => {
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

    // Lógica do Spy Scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {

                if (isInitialScroll.current) return;

                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const idx = Number(entry.target.getAttribute('data-month-index'));
                        if (!Number.isNaN(idx)) setVisibleMonthIdx(idx);
                    }
                });
            },
            {
                root: containerRef.current,
                threshold: 0.75
            }
        );

        const sections = containerRef.current?.querySelectorAll('.month-grid-section');
        sections?.forEach(s => observer.observe(s));

        return () => observer.disconnect();
    }, [containerRef]);

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

    const handleDayClick = (e: React.MouseEvent<HTMLDivElement>, mIdx: number, d: number) => {
        const rect = e.currentTarget.getBoundingClientRect();
        onDayClick(mIdx, d, rect);
    };

    return (
        <div className="flex-1 flex flex-col bg-white h-full relative z-50 dark:bg-zinc-950 transition-colors">

            {/* HEADER FIXO */}
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

                {/* Título do Mês */}
                <div className="px-4 pb-1">
                    <h1 className="text-3xl font-extrabold text-black dark:text-white tracking-tight">
                        {MONTH_NAMES[visibleMonthIdx]}
                    </h1>
                </div>

                {/* Dias da Semana */}
                <div className="grid grid-cols-7 gap-0 px-0 pb-1">
                    {WEEK_DAYS_ABREVIATED.map((d, idx) => (
                        <div
                            key={d}
                            className={`text-center text-[10px] font-bold uppercase
                            ${isWeekend(idx) ? 'text-gray-300 dark:text-zinc-600' : 'text-gray-900 dark:text-zinc-400'}`}
                        >
                            {d}
                        </div>
                    ))}
                </div>
            </div>

            {/* ÁREA DE ROLAGEM DOS MESES */}
            <div
                ref={containerRef}
                className={`flex-1 cursor-grab active:cursor-grabbing select-none scroll-smooth gpu-accelerated
                bg-white dark:bg-zinc-950 overflow-y-auto overflow-x-hidden`}
            >
                <div>
                    {months.map((mIdx) => {
                        const gridData = getCalendarGridData(year, mIdx);
                        const isDecember = mIdx === 11;

                        return (
                            <div
                                key={mIdx}
                                id={`month-detail-section-${mIdx}`}
                                data-month-index={mIdx}
                                className={`month-grid-section ${isDecember ? 'mb-0' : 'mb-12'}`}
                            >
                                <div className="grid grid-cols-7 gap-0">
                                    {gridData.leadingBlanks.map((b) => (
                                        <div key={`b-${mIdx}-${b}`} />
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
                                                className={`min-h-[115px] flex flex-col items-center justify-start px-1 pt-2 border-t relative transition-colors cursor-pointer active:scale-[0.98]
                                            border-gray-100 dark:border-zinc-800
                                            hover:bg-gray-50 dark:hover:bg-zinc-900
                                            ${isDayWeekend ? 'bg-gray-50/50 dark:bg-zinc-900/30' : 'bg-white dark:bg-zinc-950'}`}
                                            >
                                                {/* Nome do Mês no Dia 1 */}
                                                {isFirstDay && (
                                                    <div className="absolute -top-[1.6rem] items-center z-10">
                                                    <span className="text-[15px] font-black text-black dark:text-white captalize tracking-tight leading-none">
                                                        {MONTH_NAMES[mIdx].substring(0,3)}
                                                    </span>
                                                    </div>
                                                )}

                                                {/*Destaque do dia de hoje*/}
                                                <div className="mb-2 mt-0.5">
                                                <span className={`
                                                    text-sm font-sans leading-none flex items-center justify-center w-7 h-7 rounded-full
                                                    ${isTodayDay
                                                    ? 'bg-black text-white dark:bg-white dark:text-black font-bold shadow-md'
                                                    : dayHasFeriado
                                                        ? 'text-red-500 dark:text-red-400 font-semibold'
                                                        : isDayWeekend
                                                            ? 'text-gray-300 dark:text-zinc-600'
                                                            : 'text-gray-900 dark:text-zinc-300'
                                                }`}>
                                                    {d}
                                                </span>
                                                </div>

                                                <div className="mt-auto w-full px-0.5 pb-3.5 flex flex-col gap-[1px]">

                                                    {/* Lista de Eventos */}
                                                    <div className="flex flex-col gap-[2px] w-full">
                                                        {visibleEvents.map((evt) => (
                                                            <div
                                                                key={evt.feriado_id}
                                                                className={`
                                                                block w-auto max-w-full truncate rounded-[2px] px-1 py-0 text-[8.5px] leading-[11px] font-semibold border-l-[3px] text-left mx-0.5
                                                                ${getEventStyle(evt.feriado_tipo)}
                                                            `}
                                                                title={evt.feriado_titulo}
                                                            >
                                                                {evt.feriado_tipo}
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Contador */}
                                                    {remainingEvents > 0 && (
                                                        <div className="w-full text-center">
                                                        <span className="text-[8px] font-bold text-gray-400 dark:text-zinc-400 ">
                                                            +{remainingEvents}
                                                        </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
export default MonthViewLandscape;
