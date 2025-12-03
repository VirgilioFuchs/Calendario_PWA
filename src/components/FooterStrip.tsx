import React, { useMemo, useEffect } from 'react';
import { getDaysInMonth, WEEK_DAYS_ABREVIATED } from '../types';
import { useDragScroll } from '../hooks/useDragScroll';

interface FooterStripProps {
    currentYear: number;
    currentMonthIdx: number;
    selectedDay: number;
    onSelectDay: (day: number) => void;
    className?: string;
}

//Barra de dias abaixo do calendário na aba dias
const FooterStrip: React.FC<FooterStripProps> = ({ currentYear, currentMonthIdx, selectedDay, onSelectDay, className }) => {
    const scrollRef = useDragScroll<HTMLDivElement>();

    const days = useMemo(() => {
        const count = getDaysInMonth(currentYear, currentMonthIdx);
        return Array.from({ length: count }, (_, i) => i + 1);
    }, [currentYear, currentMonthIdx]);

    // Auto-scroll para centralizar o dia selecionado
    useEffect(() => {
        const el = document.getElementById(`strip-day-${selectedDay}`);
        if (el && scrollRef.current) {
            setTimeout(() => {
                el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }, 100);
        }
    }, [scrollRef, selectedDay]);

    return (
        <div className={`h-20 bg-white/95 backdrop-blur-md border-t border-gray-200 fixed left-0 right-0 z-[60] flex items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] ${className}`}>
            <div
                ref={scrollRef}
                className="flex items-center gap-2 overflow-x-auto px-4 w-full h-full scrollbar-hide snap-x snap-mandatory"
            >
                {days.map((d) => {
                    const date = new Date(currentYear, currentMonthIdx, d);
                    const weekDayIndex = date.getDay(); // 0 (Dom) a 6 (Sab)
                    const isSelected = d === selectedDay;
                    const isWeekend = weekDayIndex === 0 || weekDayIndex === 6;

                    return (
                        <button
                            key={d}
                            id={`footer-day-${d}`}
                            onClick={() => onSelectDay(d)}
                            className="flex flex-col items-center justify-center min-w-[3.5rem] snap-center transition-all duration-200 group"
                        >
                            {/* Dia da Semana (SEG, TER...) */}
                            <span className={`text-[10px] font-bold uppercase mb-1 transition-colors
                                ${isSelected ? 'text-black' : 'text-gray-400 group-hover:text-gray-600'}
                            `}>
                                {WEEK_DAYS_ABREVIATED[weekDayIndex]}
                            </span>

                            {/* BOLINHA DO DIA */}
                            <div className={`
                                w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 shadow-sm
                                ${isSelected
                                ? 'bg-black text-white scale-110 shadow-md' // Selecionado: Bolinha Preta
                                : `bg-gray-50 text-gray-700 border border-gray-100 group-hover:bg-gray-200 ${isWeekend ? 'text-gray-400' : ''}` // Normal
                            }
                            `}>
                                {d}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default FooterStrip;