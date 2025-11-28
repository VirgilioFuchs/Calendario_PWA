import React, { useEffect, useState } from 'react';
import { MONTH_NAMES, WEEK_DAYS_ABREVIATED, getDaysInMonth, generateMockEvents } from '../types';
import { useDragScroll } from '../hooks/useDragScroll';
import {motion} from 'framer-motion';

interface MonthDetailProps {
    year: number;
    monthIdx: number;
    onBack: () => void;
    onDayClick: (monthIdx:number, day: number) => void;
}

const MonthView: React.FC<MonthDetailProps> = ({ year, monthIdx, onBack, onDayClick }) => {
    const containerRef = useDragScroll<HTMLDivElement>();

    // Estado para o título fixo (Scroll Spy)
    const [visibleMonthIdx, setVisibleMonthIdx] = useState(monthIdx);
    const months = Array.from({ length: 12 }, (_, i) => i);

    // Cores do evento
    const getEventStyle = (type: string) => {
        switch (type) {
            case 'Trabalho': return 'bg-gray-100 text-gray-700 border border-gray-200';
            case 'Férias':   return 'bg-green-100 text-green-700 border border-green-200';
            case 'Feriado':  return 'bg-red-100 text-red-700 border border-red-200';
            case 'Festa':    return 'bg-purple-100 text-purple-700 border border-purple-200';
            default:         return 'bg-blue-50 text-blue-700 border border-blue-100';
        }
    };

    // Lógica do Spy Scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    // isIntersecting: true quando o elemento entra na "zona ativa" definida pelo rootMargin
                    if (entry.isIntersecting) {
                        const idx = Number(entry.target.getAttribute('data-month-index'));
                        if (!isNaN(idx)) setVisibleMonthIdx(idx);
                    }
                });
            },
            {
                root: containerRef.current,
                threshold: 0.7
            }
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
                containerRef.current.scrollTop = section.offsetTop - 180;
            }
        }, 100);
    }, [containerRef, monthIdx]);

    return (
        <motion.div
            initial={{opacity: 0, y: -20}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: 0.5}}
            className="flex-1 flex flex-col bg-white h-full animate-fade-in relative z-50"
        >

            {/* HEADER FIXO */}
            <div className="bg-white/95 backdrop-blur-sm z-30 shadow-sm relative transition-all duration-300 border-b border-gray-300">
                <div className="flex items-center justify-between px-4 py-2">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-1  hover:opacity-70 transition-opacity"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="text-base font-semibold leading-none pb-0.5">{year}</span>
                    </button>

                    {/* Lupa para pesquisa de eventos - desenvolver a pesquisa ainda*/}
                    <button className="p-2 -mr-2 hover:bg-gray-100 rounded-full transition-colors text-black">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </button>
                </div>

                {/* Título do Mês  */}
                <div className="px-4 pb-2">
                    <h1 className="text-3xl font-extrabold text-black tracking-tight">
                        {MONTH_NAMES[visibleMonthIdx]}
                    </h1>
                </div>

                {/* Dias da Semana */}
                <div className="grid grid-cols-7 gap-0 px-0 pb-2">
                    {WEEK_DAYS_ABREVIATED.map((d, idx) => (
                        <div
                            key={d}
                            className={`text-center text-[10px] font-bold uppercase
                            ${(idx === 0 || idx === 6) ? 'text-gray-300' : 'text-gray-900'}`}
                        >
                            {d}
                        </div>
                    ))}
                </div>
            </div>

            {/* ÁREA DE ROLAGEM DOS MESES */}
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
                            <div className="grid grid-cols-7 gap-0">

                                {/* Espaços em branco (início do mês) */}
                                {blanks.map(b => (
                                    <div
                                        key={`b-${mIdx}-${b}`}
                                    />
                                ))}

                                {/* Dias */}
                                {days.map(d => {
                                    const dateObj = new Date(year, mIdx, d);
                                    const dayOfWeek = dateObj.getDay();
                                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // 0=Domingo e 6=Sábado
                                    const isFirstDay = d === 1;
                                    const allEvents = generateMockEvents(d);
                                    const visibleEvents = allEvents.slice(0, 2);
                                    const remainingEvents = allEvents.length - 2;

                                    return (
                                        <div
                                            key={d}
                                            onClick={() => onDayClick(mIdx,d)}
                                            className={`min-h-[110px] flex flex-col items-center justify-start p-1 pt-2 border-t border-r border-gray-100 relative transition-colors cursor-pointer hover:bg-gray-50 active:scale-[0.99]
                                            ${isWeekend ? 'bg-gray-50/50' : 'bg-white'}`}
                                        >
                                            {/* Nome do Mês no Dia 1 */}
                                            {isFirstDay && (
                                                <span className="text-[9px] font-semibold uppercase text-black absolute -top-5 left-1/2 -translate-x-1/2 bg-white px-2 z-10">
                                                    {MONTH_NAMES[mIdx]}
                                                </span>
                                            )}

                                            {/* Número do Dia */}
                                            <span className={`text-sm mb-3 leading-none
                                            ${isWeekend 
                                                ? 'text-gray-400 font-normal' 
                                                : 'text-gray-900 font-extrabold'}
                                            `}>
                                                {d}
                                            </span>

                                            <div className="mt-auto w-full px-0.5 pb-0.5 flex flex-col gap-[1px]">

                                                {/* Lista de Eventos */}
                                                <div className="flex flex-col gap-[2px] w-full">
                                                    {visibleEvents.map((evt) => (
                                                        <div
                                                            key={evt.id}
                                                            className={`
                                                                block w-full max-w-full truncate rounded-[2px] px-1 py-0 text-[8.5px] leading-[11px] font-semibold border-l-[3px] text-left
                                                                ${getEventStyle(evt.type)}
                                                            `}
                                                            title={evt.title}
                                                        >
                                                            {evt.title}
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Contador */}
                                                {remainingEvents > 0 && (
                                                    <div className="w-full text-center">
                                                        <span className="text-[8px] font-bold text-gray-400">
                                                            +{remainingEvents}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}

                {/* Espaço final */}
                <div className="h-12"/>
            </div>
        </motion.div>
    );
};
export default MonthView;