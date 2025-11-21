import React, { useMemo } from 'react';
import { WEEK_DAYS, MONTH_NAMES, generateMockEvents } from '../types';
import { useDragScroll } from '../hooks/useDragScroll';

interface DayViewProps {
    currentYear: number;
    currentMonthIdx: number;
    selectedDay: number;
}
//Campo de vizualização de dias
const DayView: React.FC<DayViewProps> = ({ currentYear, currentMonthIdx, selectedDay }) => {
    // Hook para arrastar e rolar pelo mouse do computador
    const containerRef = useDragScroll<HTMLDivElement>();

    const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
    const events = useMemo(() => generateMockEvents(selectedDay), [selectedDay]);

    const headerDate = new Date(currentYear, currentMonthIdx, selectedDay);
    const headerText = `${WEEK_DAYS[headerDate.getDay()]}, ${selectedDay} de ${MONTH_NAMES[currentMonthIdx]}`;

    return (
        <div className="flex-1 flex flex-col overflow-hidden animate-fade-in">
            <div className="p-3 px-4 text-sm font-bold border-b border-gray-100 bg-white z-10 sticky top-0 shadow-sm">
                {headerText}
            </div>

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