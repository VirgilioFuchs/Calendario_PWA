import React, {useMemo} from 'react';
import {WEEK_DAYS, MONTH_NAMES, generateMockEvents, type CalendarEvent} from '../types';
import {useDragScroll} from '../hooks/useDragScroll';
import '../App.css';

interface DayViewProps {
    currentYear: number;
    currentMonthIdx: number;
    selectedDay: number;
    onBack: () => void;
    onChangeDate: (day: number, monthIdx: number, year: number) => void;
    onEventClick: (event: CalendarEvent) => void;
}

const HOUR_HEIGHT = 60;

//Campo de vizualização de dias
const DayView: React.FC<DayViewProps> = ({
                                             currentYear,
                                             currentMonthIdx,
                                             selectedDay,
                                             onBack,
                                             onEventClick,
                                             onChangeDate,
                                         }) => {
    const containerRef = useDragScroll<HTMLDivElement>(); // Hook para arrastar e rolar pelo mouse do computador
    const hours = useMemo(() => Array.from({length: 17}, (_, i) => i + 7), []);
    const events = useMemo(() => generateMockEvents(selectedDay), [selectedDay]);
    const headerDate = new Date(currentYear, currentMonthIdx, selectedDay);
    const dayTitle = `${WEEK_DAYS[headerDate.getDay()]}, ${selectedDay} de ${MONTH_NAMES[currentMonthIdx]} de ${currentYear}`;

    const getEventStyle = (type: string) => {
        switch (type) {
            case 'Trabalho':
                return 'bg-gray-100 text-gray-700 border-gray-500 dark:bg-zinc-800/70 dark:text-zinc-100 dark:border-zinc-500';
            case 'Férias':
                return 'bg-green-100 text-green-800 border-green-600 dark:bg-green-950/55 dark:text-green-200 dark:border-green-500';
            case 'Feriado':
                return 'bg-red-100 text-red-800 border-red-500 dark:bg-red-950/55 dark:text-red-200 dark:border-red-500';
            case 'Festa':
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
            className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 h-full relative z-50"
        >
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
                <button
                    className='p-2 -mr-2 dark:text-white text-black'
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         strokeWidth="2.5"
                         strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </button>
            </div>

            <div
                key={`${currentMonthIdx}-${selectedDay}`}
                className={`flex-1 flex flex-col relative overflow-hidden`}
            >
                {/* TÍTULO DO DIA */}
                <div className="p-3 px-4 text-lg font-semibold border-b text-gray-900 bg-gray-50 border-gray-200
                dark:text-zinc-100 dark:bg-zinc-900/60 dark:border-zinc-800
                z-10 shadow-sm flex justify-center items-center shrink-0">
                    <span>{dayTitle}</span>
                </div>

                {/* TIMELINE DOS EVENTOS */}
                <div
                    ref={containerRef}
                    className={`flex-1 overflow-y-auto relative cursor-grab active:cursor-grabbing select-none bg-white dark:bg-zinc-950 dark:accent-indigo-500 px-4`}
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
                                    style={{left: '52px'}}
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
                        {events.map(evt => {
                            const startHourIndex = evt.startHour - hours[0];
                            const topPosition = startHourIndex * HOUR_HEIGHT + (evt.startHour % 1) * HOUR_HEIGHT;
                            const eventHeight = evt.duration * HOUR_HEIGHT;

                            const isShortEvent = evt.duration <= 1;
                            const isTinyEvent = evt.duration <= 0.5;

                            const startTime = formatTime(evt.startHour);
                            const endTime = formatTime(evt.startHour + evt.duration);

                            return (
                                <div
                                    key={evt.id}
                                    onClick={() => onEventClick(evt)}
                                    className={`absolute left-14 right-0 rounded-xl border-l-4 shadow-sm overflow-hidden cursor-pointer 
                                        hover:brightness-95 active:scale-[0.98] transition-transform z-10
                                        ${getEventStyle(evt.type)}
                                        ${isShortEvent
                                        ? 'flex flex-row items-center justify-between p-2 px-3'
                                        : 'flex flex-col justify-center p-3'}
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
                                                    {evt.title}
                                                </span>
                                                {!isTinyEvent && (
                                                    <span
                                                        className="text-[10px] font-bold opacity-60 uppercase leading-none mt-0.5">
                                                        {evt.type}
                                                    </span>
                                                )}
                                            </div>
                                            <div
                                                className="text-xs opacity-90 whitespace-nowrap font-medium shrink-0">
                                                {startTime}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <span
                                                className="text-[10px] font-bold opacity-70 uppercase leading-none mb-1">
                                                {evt.type}
                                            </span>
                                            <span className="font-bold text-base leading-tight truncate">
                                                {evt.title}
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
        </div>
    );
};

export default DayView;