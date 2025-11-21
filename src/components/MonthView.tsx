import React, { useEffect } from 'react';
import { MONTH_NAMES, WEEK_DAYS, getDaysInMonth } from '../types';
import { useDragScroll } from '../hooks/useDragScroll';

interface MonthViewProps {
    currentYear: number;
    onMonthVisible: (monthName: string) => void;
    initialMonthIdx: number;
}
// Vizualização mensal com scroll arrastável e spy de mês visível
const MonthView: React.FC<MonthViewProps> = ({ currentYear, onMonthVisible, initialMonthIdx }) => {
    const containerRef = useDragScroll<HTMLDivElement>();

    // Scroll Spy Logic
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const name = entry.target.getAttribute('data-month-name');
                        if (name) onMonthVisible(name);
                    }
                });
            },
            { root: containerRef.current, threshold: 0.55 }
        );

        const cards = containerRef.current?.querySelectorAll('.month-card-section');
        cards?.forEach(c => observer.observe(c));

        return () => observer.disconnect();
    }, [containerRef, onMonthVisible]);

    // Auto-scroll inicial
    useEffect(() => {
        setTimeout(() => {
            const card = document.getElementById(`month-card-${initialMonthIdx}`);
            if (card) card.scrollIntoView({ block: 'start' });
        }, 100);
    }, [initialMonthIdx]);

    const months = Array.from({ length: 12 }, (_, i) => i);

    return (
        <div
            ref={containerRef}
            className="flex-1 overflow-y-auto pt-14 px-4 pb-5 scroll-smooth cursor-grab active:cursor-grabbing select-none bg-gray-50"
        >
            {months.map((mIdx) => {
                const daysInMonth = getDaysInMonth(currentYear, mIdx);
                const firstDayIdx = new Date(currentYear, mIdx, 1).getDay();
                const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
                const blanks = Array.from({ length: firstDayIdx }, (_, i) => i);

                return (
                    <div
                        key={mIdx}
                        id={`month-card-${mIdx}`}
                        data-month-name={`${MONTH_NAMES[mIdx]} ${currentYear}`}
                        className="month-card-section bg-white rounded-2xl p-4 mb-6 border border-gray-200 shadow-sm"
                    >
                        <div className="text-xs font-bold text-gray-400 uppercase mb-2.5">
                            {MONTH_NAMES[mIdx]}
                        </div>

                        <div className="grid grid-cols-7 gap-2 mb-5">
                            {WEEK_DAYS.map(d => (
                                <div key={d} className="text-center text-[10px] font-bold text-gray-400">{d.charAt(0)}</div>
                            ))}
                            {blanks.map(b => <div key={`blank-${b}`} />)}
                            {days.map(d => (
                                <div
                                    key={d}
                                    className={`h-9 rounded-lg border border-transparent flex flex-col items-center justify-center text-sm relative
                    ${d % 5 === 0 ? 'font-semibold' : ''}`}
                                >
                                    {d}
                                    {d % 5 === 0 && (
                                        <div className="absolute bottom-1 w-1 h-1 bg-black rounded-full" />
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="h-px bg-gray-100 -mx-4 mb-4" />
                        <div className="text-xs font-bold text-gray-400 uppercase mb-2.5">Destaques</div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-2 h-2 rounded-full bg-black" />
                                <div className="flex-1 text-sm text-gray-800">Entrega de Projeto</div>
                                <div className="text-[11px] text-gray-400">Dia 14</div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default MonthView;