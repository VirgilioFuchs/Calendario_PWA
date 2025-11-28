import React, {useEffect} from 'react';
import {MONTH_NAMES, WEEK_DAYS, getDaysInMonth} from '../types';
import {useDragScroll} from '../hooks/useDragScroll';
import { motion } from 'framer-motion';

// Propriedaes do componente YearView
interface YearViewProps {
    currentYear: number;
    initialMonthIdx: number;
    onMonthClick: (monthIdx: number, coords: { x: number, y: number }) => void;
}

// Vizualização mensal
const YearView: React.FC<YearViewProps> = ({currentYear, initialMonthIdx, onMonthClick}) => {
    const containerRef = useDragScroll<HTMLDivElement>();
    const months = Array.from({length: 12}, (_, i) => i);

    // Auto-scroll inicial apenas para centralizar o mês selecionado
    useEffect(() => {
        setTimeout(() => {
            const card = document.getElementById(`month-card-${initialMonthIdx}`);
            if (card) card.scrollIntoView({block: 'center', behavior: 'smooth'});
        }, 100);
    }, [initialMonthIdx]);

    const handleCardClick = (e: React.MouseEvent<HTMLDivElement>, mIdx: number) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const container = containerRef.current?.getBoundingClientRect();

        let x = rect.left + rect.width / 2;
        let y = rect.top + rect.height / 2;

        if (container) {
            x = x - container.left;
            y = y - container.top;
        }

        onMonthClick(mIdx, { x, y });
    };

    return (
        <div
            ref={containerRef}
            className="flex-1 overflow-y-auto pt-16 px-3 pb-5 scroll-smooth cursor-grab active:cursor-grabbing select-none bg-gray-50"
        >
            <div className="grid grid-cols-2 gap-3">
                {months.map((mIdx) => {
                    const daysInMonth = getDaysInMonth(currentYear, mIdx);
                    const firstDayIdx = new Date(currentYear, mIdx, 1).getDay();
                    const days = Array.from({length: daysInMonth}, (_, i) => i + 1);
                    const blanks = Array.from({length: firstDayIdx}, (_, i) => i);
                    const totalSlots = 42;
                    const usedSlots =blanks.length + days.length;
                    const trailingBlanks =Array.from({ length: totalSlots - usedSlots}, (_, i) => i);

                    return (
                        <motion.div
                            key={mIdx}
                            id={`month-card-${mIdx}`}
                            layoutId={`month-card-${mIdx}`}
                            data-month-name={`${MONTH_NAMES[mIdx]} ${currentYear}`}
                            onClick={(e) => handleCardClick(e, mIdx)}

                            className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm active:scale-[0.98] transition-transform cursor-pointer hover:border-black/20 flex flex-col"
                        >
                            {/* Título do Mês Centralizado */}
                            <div className="text-center mb-2">
                                <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                                    {MONTH_NAMES[mIdx]}
                                </span>
                            </div>

                            {/* Grid de Dias Compacto (Sempre 6 linhas visuais) */}
                            <div className="grid grid-cols-7 gap-y-1 gap-x-0.5 pointer-events-none flex-1 content-start">
                                {/* Headers da Semana */}
                                {WEEK_DAYS.map((d, i) => (
                                    <div key={d} className={`text-center text-[8px] font-bold ${(i === 0 || i === 6) ? 'text-gray-300' : 'text-gray-400'}`}>
                                        {d.charAt(0)}
                                    </div>
                                ))}
                                {blanks.map(b => <div key={`blank-${b}`} className="h-5"/>)}
                                {days.map(d => {
                                    const currentDate = new Date(currentYear, mIdx, d);
                                    const dayOfWeek = currentDate.getDay();
                                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                                    return (
                                        <div
                                            key={d}
                                            className={`h-5 w-5 mx-auto rounded-full flex flex-col items-center justify-center text-[9px] relative
                                            ${isWeekend
                                                ? 'text-gray-300 font-normal'
                                                : 'text-gray-900 font-bold'}`}
                                        >
                                            {d} {/* Dias números dos meses */}
                                        </div>
                                    );
                                })}
                                {trailingBlanks.map(b => <div key={`trail-${b}`} className="h-5" />)}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default YearView;