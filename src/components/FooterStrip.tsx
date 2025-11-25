import React, { useMemo, useEffect } from 'react';
import { getDaysInMonth, getWeekDay, MONTH_NAMES } from '../types';
import { useDragScroll } from '../hooks/useDragScroll';

interface FooterStripProps {
    currentYear: number;
    currentMonthIdx: number;
    selectedDay: number;
    onSelectDay: (day: number) => void;
}

//Barra de dias abaixo do calendário na aba dias

const FooterStrip: React.FC<FooterStripProps> = ({ currentYear, currentMonthIdx, selectedDay, onSelectDay }) => {
    const scrollRef = useDragScroll<HTMLDivElement>();

    const days = useMemo(() => {
        const count = getDaysInMonth(currentYear, currentMonthIdx);
        return Array.from({ length: count }, (_, i) => i + 1);
    }, [currentYear, currentMonthIdx]);

    useEffect(() => {
        const el = document.getElementById(`strip-day-${selectedDay}`);
        if (el && scrollRef.current) {
            setTimeout(() => {
                el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }, 100);
        }
    }, [scrollRef, selectedDay]);

    return (
        <footer className="h-[75px] bg-white border-t border-gray-200 shadow-[0_-4px_15px_rgba(0,0,0,0.05)] z-50 flex flex-col shrink-0">
            <div
                ref={scrollRef}
                className="flex overflow-x-auto px-2.5 py-2 gap-2 scrollbar-hide cursor-grab active:cursor-grabbing select-none"
            >
                {days.map(day => {
                    const isSelected = day === selectedDay;
                    const hasEvent = day % 2 === 0;
                    const weekLetter = getWeekDay(currentYear, currentMonthIdx, day);
                    const dateObj = new Date(currentYear, currentMonthIdx, day);
                    const dayOfWeek = dateObj.getDay();
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                    const baseTextColor = isWeekend ? 'text-gray-400' : 'text-gray-900 font-bold';

                    return (
                        <div
                            key={day}
                            id={`strip-day-${day}`}
                            onClick={() => onSelectDay(day)}
                            className={`min-w-[48px] h-14 border rounded-[10px] flex flex-col items-center justify-center shrink-0 transition-all duration-200 cursor-pointer
                            ${isSelected
                                ? 'bg-black text-white border-black -translate-y-0.5 shadow-md'
                                : `bg-white border-gray-200 hover:bg-gray-50 ${baseTextColor}`
                            }`}
                        >
                            <span className="text-[9px] uppercase mb-0.5">{weekLetter}</span>
                            <span className="text-lg font-bold leading-none">{day}</span>
                            <div className={`w-1 h-1 rounded-full mt-1 transition-opacity 
                                ${isSelected ? 'bg-white' : (isWeekend ? 'bg-gray-300' : 'bg-black')} 
                                ${hasEvent ? 'opacity-100' : 'opacity-0'}`}
                            />
                        </div>
                    );
                })}
            </div>
        </footer>
    );
};

export default FooterStrip;