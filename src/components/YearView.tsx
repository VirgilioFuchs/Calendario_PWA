import React, {useEffect} from 'react';
import {MONTH_NAMES, WEEK_DAYS, getDaysInMonth} from '../types';
import {useDragScroll} from '../hooks/useDragScroll';

// Propriedaes do componente YearView
interface YearViewProps {
    currentYear: number;
    initialMonthIdx: number;
    onMonthClick: (monthIdx: number, coords: { x: number, y: number }) => void;
    animation?: string;
    style?: React.CSSProperties;
}

// Vizualização mensal
const YearView: React.FC<YearViewProps> = ({currentYear, initialMonthIdx, onMonthClick, animation = '', style}) => {
    const containerRef = useDragScroll<HTMLDivElement>();
    const months = Array.from({length: 12}, (_, i) => i);

    // Vai direto para o mês atual quando o componente for montado
    useEffect(() => {
        setTimeout(() => {
            const card = document.getElementById(`month-card-${initialMonthIdx}`);
            if (card) card.scrollIntoView({block: 'center', behavior: 'smooth'});
        }, 100);
    }, [initialMonthIdx]);

    const handleCardClick = (e: React.MouseEvent<HTMLDivElement>, mIdx: number) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const containerRect = containerRef.current?.getBoundingClientRect();

        const containerLeft = containerRect ? containerRect.left : 0;
        const containerTop = containerRect ? containerRect.top : 0;

        const x = rect.left - containerLeft;
        const y = rect.top - containerTop;

        onMonthClick(mIdx, {x, y});
    };

    return (
        <div
            ref={containerRef}
            style={style}
            className={`flex-1 overflow-y-auto pt-16 px-3 pb-5 scroll-smooth h-full origin-top-left ${animation}
            bg-gray-50 dark:bg-zinc-950`}
        >
            <div className="grid grid-cols-2 gap-3">
                {months.map((mIdx) => {
                    const daysInMonth = getDaysInMonth(currentYear, mIdx);
                    const firstDayIdx = new Date(currentYear, mIdx, 1).getDay();
                    const days = Array.from({length: daysInMonth}, (_, i) => i + 1);
                    const blanks = Array.from({length: firstDayIdx}, (_, i) => i);
                    const totalSlots = 42;
                    const usedSlots = blanks.length + days.length;
                    const trailingBlanks = Array.from({length: totalSlots - usedSlots}, (_, i) => i);

                    return (
                        <div
                            key={mIdx}
                            id={`month-card-${mIdx}`}
                            data-month-name={`${MONTH_NAMES[mIdx]} ${currentYear}`}
                            onClick={(e) => handleCardClick(e, mIdx)}
                            className="rounded-xl p-3 shadow-sm active:scale-[0.98] transition-transform cursor-pointer flex flex-col
                            bg-white border border-gray-200 hover:border-black/20
                            dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-600"
                            style={{
                                opacity: 0,
                                animationFillMode: 'forwards'
                            }}
                        >
                            {/* Título do Mês Centralizado */}
                            <div className="text-center mb-2">
                                <span className="text-xs font-bold uppercase tracking-wide text-gray-800 dark:text-gray-200">
                                    {MONTH_NAMES[mIdx]}
                                </span>
                            </div>

                            {/* Grid de Dias Compacto (Sempre 6 linhas visuais) */}
                            <div
                                className="grid grid-cols-7 gap-y-1 gap-x-0.5 pointer-events-none flex-1 content-start">
                                {/* Headers da Semana */}
                                {WEEK_DAYS.map((d, i) => (
                                    <div key={d}
                                         className={`text-center text-[8px] font-bold ${(i === 0 || i === 6) ? 'text-gray-300 dark:text-zinc-600' : 'text-gray-400 dark:text-zinc-500'}`}>
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
                                                ? 'text-gray-300 font-normal dark:text-zinc-600'
                                                : 'text-gray-900 font-bold dark:text-zinc-300'}`}
                                        >
                                            {d} {/* Dias números dos meses */}
                                        </div>
                                    );
                                })}
                                {trailingBlanks.map(b => <div key={`trail-${b}`} className="h-5"/>)}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default YearView;