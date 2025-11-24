import React, {useEffect} from 'react';
import {MONTH_NAMES, WEEK_DAYS, getDaysInMonth} from '../types';
import {useDragScroll} from '../hooks/useDragScroll';

// Propriedaes do componente MonthView
interface MonthViewProps {
    currentYear: number;
    initialMonthIdx: number;
    onMonthClick: (monthIdx: number) => void;
}

// Vizualização mensal
const MonthView: React.FC<MonthViewProps> = ({ currentYear, initialMonthIdx, onMonthClick }) => {
    const containerRef = useDragScroll<HTMLDivElement>();

    // Auto-scroll inicial apenas para centralizar o mês selecionado
    useEffect(() => {
        setTimeout(() => {
            const card = document.getElementById(`month-card-${initialMonthIdx}`);
            if (card) card.scrollIntoView({ block: 'center' });
        }, 100);
    }, [initialMonthIdx]);

    const months = Array.from({ length: 12 }, (_, i) => i);

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

                    return (
                        <div
                            key={mIdx}
                            id={`month-card-${mIdx}`}
                            data-month-name={`${MONTH_NAMES[mIdx]} ${currentYear}`}
                            onClick={() => onMonthClick(mIdx)}
                            className="month-card-section bg-white rounded-xl p-3 border border-gray-200 shadow-sm active:scale-[0.98] transition-transform cursor-pointer h-fit hover:border-black/20"
                        >
                            {/* Título do Mês Centralizado */}
                            <div className="text-center mb-2">
                                <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                                    {MONTH_NAMES[mIdx]}
                                </span>
                            </div>

                            {/* Grid de Dias Compacto (Miniatura) */}
                            <div className="grid grid-cols-7 gap-y-1 gap-x-0.5 pointer-events-none">
                                {/* Headers da Semana */}
                                {WEEK_DAYS.map(d => (
                                    <div key={d} className="text-center text-[8px] font-bold text-gray-400">
                                        {d.charAt(0)}
                                    </div>
                                ))}
                                {blanks.map(b => <div key={`blank-${b}`}/>)}
                                {days.map(d => (
                                    <div
                                        key={d}
                                        className={`h-5 w-5 mx-auto rounded-full flex flex-col items-center justify-center text-[9px] relative
                                        ${d % 5 === 0 ? 'font-bold text-gray-900' : 'text-gray-500'}`}
                                    >
                                        {d}
                                        {d % 5 === 0 && (
                                            <div className="absolute bottom-0.5 w-0.5 h-0.5 bg-black rounded-full"/>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MonthView;