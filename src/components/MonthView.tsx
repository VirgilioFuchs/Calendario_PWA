import React, {useEffect, useState, useRef, useMemo} from 'react';
import {WEEK_DAYS_ABREVIATED, MONTH_NAMES, type CalendarEvent} from '../types';
import {useDragScroll} from '../hooks/useDragScroll';
import {eventsApi} from "../services/apiCache";
import {useOrientation} from "../hooks/useOrientation.ts";
import {
    getEventStyle,
    getUniqueTypesForDay,
    hasHoliday,
    groupEventsByMonthAndDay
} from '../utils/eventHelpers';
import {
    getTodayInfo,
    getCalendarGridData,
    isWeekend,
    getDayOfWeekInGrid,
} from '../utils/dateHelpers';


interface MonthDetailProps {
    year: number;
    monthIdx: number;
    onBack: () => void;
    onDayClick: (monthIdx: number, day: number, react?: DOMRect) => void;
    zoomOrigin?: { x: number, y: number };
}

const WeekDaysHeader: React.FC<{ className?: string }> = ({className = ''}) => (
    <div className={`grid grid-cols-7 gap-0 px-0 pb-1 ${className}`}>
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
);

const MonthView: React.FC<MonthDetailProps> = ({year, monthIdx, onBack, onDayClick, zoomOrigin}) => {
    const containerRef = useDragScroll<HTMLDivElement>();
    const orientation = useOrientation();
    const isLandscape = orientation === 'landscape';

    const [visibleMonthIdx, setVisibleMonthIdx] = useState(monthIdx);
    const months = Array.from({length: 12}, (_, i) => i);
    const headerOffset = 110;
    const isInitialScroll = useRef(true);
    const todayInfo = useMemo(() => getTodayInfo(), []);
    const [yearEvents, setYearEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchYearEvents = async () => {
            setLoading(true);
            try {
                const data = await eventsApi.getEventsByYear(year);
                setYearEvents(data);
            } catch (error) {
                console.error('Erro ao carregar eventos:', error);
                setYearEvents([]);
            } finally {
                setLoading(false);
            }
        };

        fetchYearEvents();
    }, [year]);

    const eventsByMonthAndDay = useMemo(
        () => groupEventsByMonthAndDay(yearEvents),
        [yearEvents]
    );

    // Scroll Spy
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            if (isInitialScroll.current) return;

            const sections = container.querySelectorAll('.month-grid-section');
            const containerRect = container.getBoundingClientRect();

            // ✅ Different detection point for landscape vs portrait
            const detectionPoint = isLandscape
                ? containerRect.top + containerRect.height * 0.2  // 20% from top in landscape
                : containerRect.top + containerRect.height * 0.3; // 30% from top in portrait

            let closestIdx = 0;
            let closestDistance = Infinity;

            sections.forEach((section) => {
                const rect = section.getBoundingClientRect();
                const sectionMiddle = rect.top + rect.height / 2;
                const distance = Math.abs(detectionPoint - sectionMiddle);

                if (distance < closestDistance) {
                    closestDistance = distance;
                    const idx = Number(section.getAttribute('data-month-index'));
                    if (!Number.isNaN(idx)) closestIdx = idx;
                }
            });

            setVisibleMonthIdx(closestIdx);
        };

        container.addEventListener('scroll', handleScroll, {passive: true});

        const checkAfterInit = setTimeout(() => {
            if (!isInitialScroll.current) {
                handleScroll();
            }
        }, 200);

        return () => {
            container.removeEventListener('scroll', handleScroll);
            clearTimeout(checkAfterInit);
        };
    }, [isLandscape, containerRef]);

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

        return () => clearTimeout(timeoutId);
    }, [containerRef, monthIdx]);

    const handleDayClick = (e: React.MouseEvent<HTMLDivElement>, mIdx: number, d: number) => {
        const rect = e.currentTarget.getBoundingClientRect();
        onDayClick(mIdx, d, rect);
    };

    const CalendarContent = () => (
        <div
            ref={containerRef}
            className="flex-1 overflow-y-auto overflow-x-hidden cursor-grab active:cursor-grabbing select-none
            scroll-smooth gpu-accelerated bg-white dark:bg-zinc-950"
            style={{
                transformOrigin: zoomOrigin ? `${zoomOrigin.x}px ${Math.max(0, zoomOrigin.y - headerOffset)}px` : 'center'
            }}
        >
            {months.map((mIdx) => {
                const gridData = getCalendarGridData(year, mIdx, 42);
                const isDecember = mIdx === 11;

                return (
                    <div
                        key={mIdx}
                        id={`month-detail-section-${mIdx}`}
                        data-month-index={mIdx}
                        className={`month-grid-section ${isDecember ? 'mb-0' : 'mb-12'}`}
                    >
                        <div className="grid grid-cols-7 gap-0">
                            {gridData.leadingBlanks.map(b => (
                                <div key={`b-${mIdx}-${b}`}/>
                            ))}

                            {gridData.days.map((d) => {
                                const dayOfWeek = getDayOfWeekInGrid(gridData.firstDayIdx, d);
                                const isDayWeekend = isWeekend(dayOfWeek);
                                const isFirstDay = d === 1;
                                const isTodayDay = d === todayInfo.day && mIdx === todayInfo.month && year === todayInfo.year;
                                const allEvents: CalendarEvent[] = eventsByMonthAndDay[mIdx]?.[d] || [];
                                const visibleEvents = allEvents.slice(0, 2);
                                const remainingEvents = allEvents.length - 2;

                                const uniqueTypes = getUniqueTypesForDay(allEvents);
                                const dayHasFeriado = hasHoliday(allEvents);

                                return (
                                    <div
                                        key={d}
                                        onClick={(e) => handleDayClick(e, mIdx, d)}
                                        className={`${isLandscape ? 'min-h-[45px] py-1' : 'min-h-[125px] pt-2'} flex flex-col items-center justify-start px-1 border-t relative transition-colors cursor-pointer active:scale-[0.98]
                                        border-gray-100 dark:border-zinc-800
                                        hover:bg-gray-50 dark:hover:bg-zinc-900
                                        ${isDayWeekend ? 'bg-gray-50/50 dark:bg-zinc-900/30' : 'bg-white dark:bg-zinc-950'}`}
                                    >
                                        {isFirstDay && (
                                            <div
                                                className={`absolute items-center z-10 ${isLandscape ? '-top-[1.2rem]' : '-top-[1.6rem]'}`}>
                                                <span
                                                    className={`font-black text-black dark:text-white capitalize tracking-tight leading-none ${isLandscape ? 'text-[12px]' : 'text-[15px]'}`}>
                                                    {MONTH_NAMES[mIdx].substring(0, 3)}
                                                </span>
                                            </div>
                                        )}

                                        <div className={isLandscape ? 'mb-0.5' : 'mb-2 mt-0.5'}>
                                            <span className={`
                                                font-sans leading-none flex items-center justify-center rounded-full
                                                ${isLandscape ? 'w-5 h-5 text-xs' : 'w-7 h-7 text-sm'}
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

                                        {/* ✅ LANDSCAPE: One dot per unique event type */}
                                        {isLandscape && uniqueTypes.length > 0 && (
                                            <div className="flex flex-row gap-1 justify-center flex-wrap max-w-full">
                                                {uniqueTypes.slice(0, 3).map((type, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={`w-1.5 h-1.5 rounded-full ${getEventStyle(type)}`}
                                                        title={type}
                                                    />
                                                ))}
                                                {uniqueTypes.length > 3 && (
                                                    <span
                                                        className="text-[6px] font-bold text-gray-400 dark:text-zinc-500 leading-none">
                                                        +{uniqueTypes.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* PORTRAIT: Event cards */}
                                        {!isLandscape && (
                                            <div className="mt-auto w-full px-0.5 pb-3.5 flex flex-col gap-[1px]">
                                                <div className="flex flex-col gap-[2px] w-full">
                                                    {visibleEvents.map((evt, idx) => (
                                                        <div
                                                            key={`${evt.feriado_id}-${idx}`}
                                                            className={`block w-auto max-w-full truncate rounded-[2px] px-1 py-0 text-[8.5px] leading-[11px] font-semibold border-l-[3px] text-left mx-0.5
                                                            ${getEventStyle(evt.feriado_tipo)}`}
                                                            title={evt.feriado_titulo}
                                                        >
                                                            {evt.feriado_tipo}
                                                        </div>
                                                    ))}
                                                </div>

                                                {remainingEvents > 0 && (
                                                    <div className="w-full text-center">
                                                        <span
                                                            className="text-[8px] font-bold text-gray-400 dark:text-zinc-400">
                                                            +{remainingEvents}
                                                        </span>
                                                    </div>
                                                )}
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
    );

    return (
        <div className="flex-1 flex flex-col bg-white h-full relative z-50 dark:bg-zinc-950 transition-colors">
            {/* HEADER */}
            <div
                className="z-30 shadow-sm relative transition-all duration-300
                bg-white/95 backdrop-blur-sm border-b border-gray-300
                dark:bg-zinc-950/95 dark:border-zinc-800">
                <div className="flex items-center justify-between px-4 py-2">
                    <button onClick={onBack}
                            className="flex items-center gap-1 hover:opacity-70 transition-opacity text-black dark:text-white">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 19L8 12L15 5"/>
                        </svg>
                        <span className="text-base font-semibold leading-none pb-0.5">{year}</span>
                    </button>

                    <button
                        className="p-2 -mr-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-black dark:text-white">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </button>
                </div>

                {!isLandscape && (
                    <div className="px-4 pb-1">
                        <h1 className="text-3xl font-extrabold text-black dark:text-white tracking-tight">
                            {MONTH_NAMES[visibleMonthIdx]}
                        </h1>
                    </div>
                )}
                {!isLandscape && <WeekDaysHeader/>}
            </div>

            {/* Loading */}
            {loading && (
                <div
                    className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg text-sm">
                    📦 Carregando eventos...
                </div>
            )}

            {/* Error */}
            {error && (
                <div
                    className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
                    ⚠️ {error}
                </div>
            )}

            {/* MAIN LAYOUT */}
            {isLandscape ? (
                <div className="flex-1 flex flex-row overflow-hidden">
                    {/* 60% - Calendar */}
                    <div
                        className="w-[60%] flex flex-col overflow-hidden border-r border-gray-200 dark:border-zinc-800">
                        <WeekDaysHeader className="border-b border-gray-200 dark:border-zinc-800"/>
                        <CalendarContent/>
                    </div>

                    {/* 40% - Side Panel */}
                    <div className="w-[40%] flex flex-col overflow-hidden bg-gray-50 dark:bg-zinc-900">
                        {/* ✅ Title at TOP of side panel */}
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-zinc-800 text-center">
                            <h1 className="text-2xl font-extrabold text-black dark:text-white tracking-tight transition-all duration-300">
                                {MONTH_NAMES[visibleMonthIdx]}
                            </h1>
                        </div>

                        {/* ✅ Content area */}
                        <div className="flex-1 overflow-y-auto p-4">
                            <p className="text-gray-400 dark:text-zinc-500 text-sm text-center">
                                Painel lateral
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <CalendarContent/>
            )}
        </div>
    );
};

export default MonthView;