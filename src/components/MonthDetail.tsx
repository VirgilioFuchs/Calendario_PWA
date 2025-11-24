import React, { useEffect, useState } from 'react';
import { MONTH_NAMES, WEEK_DAYS, getDaysInMonth } from '../types';
import { useDragScroll } from '../hooks/useDragScroll';

interface MonthDetailProps {
    year: number;
    monthIdx: number;
    onBack: () => void;
    onDayClick: (day: number) => void;
}

const MonthDetail: React.FC<MonthDetailProps> = ({ year, monthIdx, onBack, onDayClick }) => {
    const containerRef = useDragScroll<HTMLDivElement>();

    // Estado para o título fixo (Scroll Spy)
    const [visibleMonthIdx, setVisibleMonthIdx] = useState(monthIdx);
    const months = Array.from({ length: 12 }, (_, i) => i);

    // Lógica do Spy Scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const idx = Number(entry.target.getAttribute('data-month-index'));
                        if (!isNaN(idx)) setVisibleMonthIdx(idx);
                    }
                });
            },
            { root: containerRef.current, threshold: 0.55 }
        );
        const sections = containerRef.current?.querySelectorAll('.month-grid-section');
        sections?.forEach(s => observer.observe(s));
        return () => observer.disconnect();
    }, []);

    // Scroll inicial para o mês selecionado
    useEffect(() => {
        setTimeout(() => {
            const section = document.getElementById(`month-detail-section-${monthIdx}`);
            if (section && containerRef.current) {
                // Ajuste para não esconder o topo do mês atrás do header
                containerRef.current.scrollTop = section.offsetTop - 180;
            }
        }, 100);
    }, [containerRef, monthIdx]);

    return (
        <div className="flex-1 flex flex-col bg-white h-full animate-fade-in relative z-50">

            {/* --- HEADER FIXO --- */}
            <div className="bg-white/95 backdrop-blur-sm z-30 shadow-sm relative transition-all duration-300 border-b border-gray-200">
                <div className="flex items-center px-4 py-2">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-1  hover:opacity-70 transition-opacity"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="text-base font-semibold leading-none pb-0.5">{year}</span>
                    </button>
                </div>

                {/* Título do Mês (Scroll Spy) */}
                <div className="px-4 pb-2">
                    <h1 className="text-3xl font-extrabold text-black tracking-tight">
                        {MONTH_NAMES[visibleMonthIdx]}
                    </h1>
                </div>

                {/* Dias da Semana */}
                <div className="grid grid-cols-7 gap-0 px-0 pb-2">
                    {WEEK_DAYS.map(d => (
                        <div key={d} className="text-center text-[10px] font-bold text-gray-400 uppercase">
                            {d}
                        </div>
                    ))}
                </div>
            </div>

            {/* --- ÁREA DE ROLAGEM (GRADE TOTAL) --- */}
            <div
                ref={containerRef}
                className="flex-1 overflow-y-auto cursor-grab active:cursor-grabbing select-none scroll-smooth bg-white"
            >
                {months.map((mIdx) => {
                    const daysInMonth = getDaysInMonth(year, mIdx);
                    const firstDayIdx = new Date(year, mIdx, 1).getDay();
                    const blanks = Array.from({ length: firstDayIdx }, (_, i) => i);
                    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

                    return (
                        <div
                            key={mIdx}
                            id={`month-detail-section-${mIdx}`}
                            data-month-index={mIdx}
                            className="month-grid-section mb-6" // Pequena margem entre meses
                        >
                            {/* Grade Edge-to-Edge (Sem gap, com bordas) */}
                            <div className="grid grid-cols-7 gap-0 border-t border-gray-100">

                                {/* Espaços em branco (início do mês) */}
                                {blanks.map(b => (
                                    <div
                                        key={`b-${mIdx}-${b}`}
                                        className="min-h-[80px] border-b border-gray-100 bg-gray-50/30"
                                    />
                                ))}

                                {/* Dias */}
                                {days.map(d => {
                                    const hasEvent = d % 2 === 0; // Mock visual
                                    const isFirstDay = d === 1;

                                    return (
                                        <div
                                            key={d}
                                            onClick={() => onDayClick(d)}
                                            className={`min-h-[80px] flex flex-col items-center justify-start pt-2 border-b border-gray-100 relative transition-colors cursor-pointer active:bg-gray-100
                                            ${hasEvent ? 'bg-white' : 'bg-white'}`}
                                        >
                                            {/* Nome do Mês no Dia 1 */}
                                            {isFirstDay && (
                                                <span className="text-[10px] font-bold uppercase absolute top-1.5 left-1/2 -translate-x-1/2 w-full text-center">
                                                    {MONTH_NAMES[mIdx].substring(0, 3)}
                                                </span>
                                            )}

                                            {/* Número do Dia */}
                                            <span className={`text-lg leading-none ${hasEvent ? 'font-medium text-black' : 'text-gray-800'} ${isFirstDay ? 'mt-3' : ''}`}>
                                                {d}
                                            </span>

                                            {/* Bolinha de Evento */}
                                            {hasEvent && (
                                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2" />
                                            )}

                                            {/* Borda direita simulada */}
                                            <div className="absolute right-0 top-0 bottom-0 w-px bg-gray-100" />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}

                {/* Espaço final */}
                <div className="h-32" />
            </div>
        </div>
    );
};

export default MonthDetail;