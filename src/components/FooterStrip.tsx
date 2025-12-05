import React, {useMemo, useEffect, useState} from 'react';
import { WEEK_DAYS_ABREVIATED } from '../types';
import { useDragScroll } from '../hooks/useDragScroll';

interface FooterStripProps {
    currentYear: number;
    currentMonthIdx: number;
    selectedDay: number;
    onSelectDay: (day: number, monthIdx: number, year: number) => void;
    className?: string;
    animStartY?: number;
    isExiting?: boolean;
}

//Barra de dias abaixo do calendário na aba dias
const FooterStrip: React.FC<FooterStripProps> = ({
                                                     currentYear,
                                                     currentMonthIdx,
                                                     selectedDay,
                                                     onSelectDay,
                                                     className = 'bottom-0',
                                                     animStartY,
                                                     isExiting
                                                 }) => {
    const scrollRef = useDragScroll<HTMLDivElement>();

    const [offsetY, setOffSetY] = useState(0);

    // Logica animação E/S
    useEffect(() => {
        if (animStartY !== undefined) {
            // Posição final do footer
            const footerHeight = 80;
            const bottomSpace = className.includes('bottom-12') ? 48 : 0;
            const footerFinalY = window.innerHeight - footerHeight - bottomSpace;

            // Distaância que a animação tem que percorrer
            const delta = animStartY - footerFinalY;

            if (isExiting) {
                setOffSetY(delta);
            } else {
                setOffSetY(delta);
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        setOffSetY(0);
                    });
                });
            }
        }
    }, [animStartY, isExiting, className]);

    const today = new Date();
    const todayDay = today.getDate();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();

    const weeks = useMemo(() => {
        const allDays = [];
        const startMonthIdx = currentMonthIdx - 1;
        const startDate = new Date(currentYear, startMonthIdx, 1);
        const dayOfWeek = startDate.getDay();
        startDate.setDate(startDate.getDate() - dayOfWeek);
        const endMonthIdx = currentMonthIdx + 2;
        const endDate = new Date(currentYear, endMonthIdx, 0);
        const endDayOfWeek = endDate.getDay();
        endDate.setDate(endDate.getDate() + (6 - endDayOfWeek));

        // Loop gerador dia a dia
        const loopDate = new Date(startDate);

        while (loopDate <= endDate) {
            const y = loopDate.getFullYear();
            const isHidden = y !== 2025;

            allDays.push({
                day: loopDate.getDate(),
                monthIdx: loopDate.getMonth(),
                year: y,
                weekDay: loopDate.getDay(),
                fullDate: new Date(loopDate), // Clone
                isHidden: isHidden,
                uniqueId: `${y}-${loopDate.getMonth()}-${loopDate.getDate()}`
            });
            loopDate.setDate(loopDate.getDate() + 1);
        }

        const chunks = [];
        for (let i = 0; i < allDays.length; i += 7) {
            chunks.push(allDays.slice(i, i + 7));
        }
        return chunks;

    }, [currentYear, currentMonthIdx]);

    // Auto-scroll semanal (dom até sab)
    useEffect(() => {
        if (scrollRef.current) {
            const weekIndex = weeks.findIndex(week =>
                week.some(d => d.day === selectedDay && d.monthIdx === currentMonthIdx && d.year === currentYear)
            );

            if (weekIndex !== -1) {
                const containerWidth = scrollRef.current.clientWidth;
                scrollRef.current.scrollTo({
                    left: containerWidth * weekIndex,
                    behavior: 'smooth'
                });
            }
        }
    }, [selectedDay, currentMonthIdx, currentYear, scrollRef, weeks]);

    return (
        <div style={{ transform: `translateY(${offsetY}px)` }}
             className={`
                h-20 bg-white/95 backdrop-blur-md border-t border-gray-200 fixed left-0 right-0 z-[60] flex items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] 
                transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1)
                ${className}
            `}
        >
            <div
                ref={scrollRef}
                className="flex items-center w-full h-full overflow-x-auto scrollbar-hide snap-x snap-mandatory"
            >
                {weeks.map((week, wIdx) => (
                    <div
                        key={`week-${wIdx}`}
                        className="flex-none min-w-full w-full grid grid-cols-7 snap-center h-full"
                    >
                        {week.map((item) => {
                            if (item.isHidden) {
                                return <div key={item.uniqueId} className="flex-1" />;
                            }

                            const isSelected = item.day === selectedDay && item.monthIdx === currentMonthIdx;
                            const isWeekend = item.weekDay === 0 || item.weekDay === 6;
                            const isToday = item.day === todayDay && item.monthIdx === todayMonth && item.year === todayYear;

                            return (
                                <button
                                    key={item.uniqueId}
                                    onClick={() => onSelectDay(item.day, item.monthIdx, item.year)}
                                    className="flex flex-col items-center justify-center h-full transition-all duration-200 group active:scale-95"
                                >
                                    <span className={`text-[9px] font-bold uppercase mb-1 transition-colors
                                        ${isSelected ? 'text-black' : 'text-gray-400 group-hover:text-gray-600'}
                                    `}>
                                        {WEEK_DAYS_ABREVIATED[item.weekDay]}
                                    </span>

                                    <div className={`
                                        w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 shadow-sm
                                        ${isSelected
                                        ? 'bg-black text-white scale-110 shadow-md'
                                        : isToday
                                            ? 'bg-gray-200 text-black border border-gray-300' // HOJE (Destaque Secundário, verificar como quer deixar depois)
                                            : ` ${isWeekend ? 'text-gray-400' : ''}`
                                        }
                                    `}>
                                        {item.day}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FooterStrip;