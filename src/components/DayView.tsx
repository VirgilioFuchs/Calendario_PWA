import React, {useEffect, useMemo, useRef, useState} from 'react';
import { WEEK_DAYS, MONTH_NAMES, generateMockEvents, type CalendarEvent } from '../types';
import { useDragScroll } from '../hooks/useDragScroll';

interface DayViewProps {
    currentYear: number;
    currentMonthIdx: number;
    selectedDay: number;
    onBack: () => void;
    onChangeDate: (day: number, monthIdx:number, year:number) => void;
    onEventClick: (event:CalendarEvent) => void;
    slideDir: 'right' | 'left' | null;
}

//Campo de vizualização de dias
const DayView: React.FC<DayViewProps> = ({ currentYear, currentMonthIdx, selectedDay, onBack, onEventClick, onChangeDate }) => {
    const containerRef = useDragScroll<HTMLDivElement>(); // Hook para arrastar e rolar pelo mouse do computador
    const hours = useMemo(() => Array.from({ length: 17 }, (_, i) => i + 7 ), []);
    const events = useMemo(() => generateMockEvents(selectedDay), [selectedDay]);
    const headerDate = new Date(currentYear, currentMonthIdx, selectedDay);
    const dayTitle =`${WEEK_DAYS[headerDate.getDay()]}, ${selectedDay} de ${MONTH_NAMES[currentMonthIdx]} de ${currentYear}`;

    const touchStartX = useRef<number | null>(null)
    const minSwipeDistance = 50;
    const onTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.targetTouches[0].clientX;
    };

    const onTouchEnd = (e: React.TouchEvent) => {
        if(!touchStartX.current) return;

        const touchEndX = e.changedTouches[0].clientX;
        const distance = touchStartX.current - touchEndX;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe || isRightSwipe) {
            const diff = isLeftSwipe ? 1 : -1;

            const newDate = new Date(currentYear, currentMonthIdx, selectedDay + diff);
            onChangeDate(newDate.getDate(), newDate.getMonth(), newDate.getFullYear());
        }
        touchStartX.current = null;
    }

    const getEventStyle = (type: string) => {
        switch (type) {
            case 'Trabalho': return 'bg-gray-100 text-gray-700 border-black';
            case 'Férias':   return 'bg-green-100 text-green-800 border-green-600';
            case 'Feriado':  return 'bg-red-100 text-red-800 border-red-500';
            case 'Festa':    return 'bg-purple-100 text-purple-800 border-purple-500';
            default:         return 'bg-blue-50 text-blue-800 border-blue-500';
        }
    };

    const [darkMode, setDarkMode] = useState(false);

    // Salva o tema mesmo quando recarrega a página (dark mode ou light mode)
    useEffect(() => {
        const storedTheme = localStorage.getItem('theme') === 'dark';
        setDarkMode(storedTheme)
    }, []);

    // Deixar o tema em modo Dark mode
    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
    }, [darkMode]);

    return (
        <div
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            className="flex-1 flex flex-col overflow-hidden animate-fade-in dark:bg-slate-900 h-full relative z-50"
        >
            <div className={`flex items-center justify-between px-4 py-2 border-b ${darkMode ? `dark:bg-gray-800 border-gray-700` : `hover:bg-gray-100 border-gray-400`}  shrink-0 sticky top-0 z-20`}>
                <button
                    onClick={onBack}
                    className={`flex items-center gap-1 hover:opacity-70 transition-opacity ${darkMode ? `text-white` : `text-black`}`}
                >
                    {/* Botão voltar */}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {/* Mês ao lado do voltar (Mês Atual) */}
                    <span className="text-base font-semibold leading-none pb-0.5">
                        {MONTH_NAMES[currentMonthIdx]}
                    </span>
                </button>

                {/* Lupa - desenvolver a pesquisa de eventos*/}
                <button
                    className={`p-2 -mr-2 ${darkMode ? `text-white` : `text-black`}`}
                    onClick={() => setDarkMode(!darkMode)}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </button>
            </div>

            {/* TÍTULO DO DIA */}
            <div className={`p-3 px-4 text-lg font-semibold border-b ${darkMode ? `text-white bg-gray-800 border-gray-700` : `text-black bg-gray-50 border-gray-400`}  z-10 sticky top-[45px] shadow-sm flex justify-center items-center`}>
                <span>{dayTitle}</span>
            </div>

            {/* TIMELINE DOS EVENTOS */}
            <div
                key={selectedDay}
                ref={containerRef}
                className={`flex-1 overflow-y-auto relative cursor-grab active:cursor-grabbing select-none ${darkMode ? `dark:accent-indigo-900` : `bg-white`}`}
            >
                <div className="grid grid-cols-[50px_1fr] auto-rows-[60px] pb-20">
                    {hours.map((hour) => (
                        <React.Fragment key={hour}>
                            <div className={`sticky left-0 ${darkMode ? `bg-gray-800 text-white border-gray-700` : `bg-gray-100 text-gray-400 border-gray-200`} border-r border-b text-[11px] text-center pt-1.5 z-10`}>
                                {hour.toString().padStart(2, '0')}:00
                            </div>

                            <div className={`border-b ${darkMode ? `border-gray-700 relative` : `border-gray-200 relative`}`}>
                                {events.filter(e => Math.floor(e.startHour) === hour).map(evt => (
                                    <div
                                        key={evt.id}
                                        onClick={() => onEventClick(evt)}
                                        className={`absolute left-1 right-1 rounded-md p-2 text-xs border-l-4 shadow-sm overflow-hidden cursor-pointer hover:brightness-95 active:scale-[0.98] transition-all
                                        ${getEventStyle(evt.type)}`}
                                        style={{
                                            top: `${(evt.startHour % 1) * 100}%`,
                                            height: `${evt.duration * 100}%`,
                                            zIndex: 5
                                        }}
                                    >
                                        <div className="font-semibold">{evt.title}</div>
                                        {evt.duration > 0.5 && <div className="opacity-70 text-[10px] uppercase m-1">{evt.type}</div> }
                                    </div>
                                ))}
                            </div>
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DayView;