import React, { useMemo } from 'react';
import { WEEK_DAYS, MONTH_NAMES, generateMockEvents } from '../types';
import { useDragScroll } from '../hooks/useDragScroll';

interface DayViewProps {
    currentYear: number;
    currentMonthIdx: number;
    selectedDay: number;
    onBack: () => void;
}

//Campo de vizualização de dias
const DayView: React.FC<DayViewProps> = ({ currentYear, currentMonthIdx, selectedDay, onBack }) => {
    // Hook para arrastar e rolar pelo mouse do computador
    const containerRef = useDragScroll<HTMLDivElement>();

    const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
    const events = useMemo(() => generateMockEvents(selectedDay), [selectedDay]);

    const headerDate = new Date(currentYear, currentMonthIdx, selectedDay);
    const dayTitle =`${WEEK_DAYS[headerDate.getDay()]}, ${selectedDay}`

    return (
        <div className="flex-1 flex flex-col overflow-hidden animate-fade-in bg-white h-full relative z-50">

            {/* --- HEADER DE NAVEGAÇÃO (Estilo iOS) --- */}
            <div className="flex items-center px-4 py-2 bg-white border-b border-gray-100 shrink-0 sticky top-0 z-20">
                <button
                    onClick={onBack}
                    className="flex items-center gap-1 hover:opacity-70 transition-opacity"
                >
                    {/* Ícone Chevron */}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {/* Botão mostra o MÊS anterior para onde vai voltar */}
                    <span className="text-base font-semibold leading-none pb-0.5">{MONTH_NAMES[currentMonthIdx]}</span>
                </button>
            </div>

            {/* --- TÍTULO DO DIA (Sticky na Timeline) --- */}
            <div className="p-3 px-4 text-lg font-extrabold border-b border-gray-100 bg-gray-50 z-10 sticky top-[45px] shadow-sm flex justify-between items-center">
                <span>{dayTitle}</span>
                <span className="text-xs font-normal text-gray-500 uppercase tracking-wider">{currentYear}</span>
            </div>

            {/* --- TIMELINE --- */}
            <div
                ref={containerRef}
                className="flex-1 overflow-y-auto relative cursor-grab active:cursor-grabbing select-none"
            >
                <div className="grid grid-cols-[50px_1fr] auto-rows-[60px] pb-5">
                    {hours.map((hour) => (
                        <React.Fragment key={hour}>
                            <div className="sticky left-0 bg-white border-r border-gray-200 border-b border-gray-100 text-gray-400 text-[11px] text-center pt-1.5 z-10">
                                {hour.toString().padStart(2, '0')}:00
                            </div>

                            <div className="border-b border-gray-100 relative">
                                {events.filter(e => Math.floor(e.startHour) === hour).map(evt => (
                                    <div
                                        key={evt.id}
                                        className={`absolute left-1 right-1 rounded-md p-2 text-xs border-l-4 shadow-sm overflow-hidden pointer-events-none
                                        ${evt.type === 'work'
                                            ? 'bg-gray-100 text-black border-black'
                                            : 'bg-neutral-800 text-white border-gray-500'
                                        }`}
                                        style={{
                                            top: `${(evt.startHour % 1) * 100}%`,
                                            height: `${evt.duration * 100}%`,
                                            zIndex: 5
                                        }}
                                    >
                                        <div className="font-semibold">{evt.title}</div>
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