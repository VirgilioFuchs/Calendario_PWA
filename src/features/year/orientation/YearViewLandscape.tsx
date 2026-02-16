import React, { useMemo} from 'react';
import {
    getDaysArray,
    getFirstDayOfMonth,
    getLeadingBlanks,
    getTrailingBlanks
} from "../../../shared/utils/dateHelpers.ts";
import {MONTH_NAMES, WEEK_DAYS} from "../../../shared/types";
import clsx from "clsx";

interface YearViewLandscapeProps {
    mIdx: number;
    currentYear: number;
    isFirstLoad: boolean;
    cardStyle?: React.CSSProperties;
    onCardClick: (e: React.MouseEvent<HTMLDivElement>, mIdx: number) => void;
    setCardRef: (el: HTMLDivElement | null, idx: number) => void;
}


const YearViewLandscape = React.memo<YearViewLandscapeProps>(({
                                                          mIdx,
                                                          currentYear,
                                                          isFirstLoad,
                                                          cardStyle,
                                                          onCardClick,
                                                          setCardRef
                                                      }) => {
    // ✅ Cache dos cálculos pesados com useMemo
    const monthData = useMemo(() => {
        const firstDayIdx = getFirstDayOfMonth(currentYear, mIdx);
        const days = getDaysArray(currentYear, mIdx)
        const blanks = getLeadingBlanks(currentYear, mIdx)
        const totalSlots = 42;
        const trailingBlanks =getTrailingBlanks(currentYear, mIdx, totalSlots)

        return {days, blanks, trailingBlanks, firstDayIdx};
    }, [currentYear, mIdx]);

    // ✅ Data atual calculada uma vez
    const today = useMemo(() => new Date(), []);
    const isCurrent = mIdx === today.getMonth() && currentYear === today.getFullYear();
    const currentDay = today.getDate();

    // ✅ Headers memorizados
    const weekDayHeaders = useMemo(() =>
            WEEK_DAYS.map((d, i) => ({
                char: d.charAt(0),
                isWeekend: i === 0 || i === 6
            })),
        []);

    return (
        <div
            ref={(el) => setCardRef(el, mIdx)}
            id={`month-card-${mIdx}`}
            data-month-name={`${MONTH_NAMES[mIdx]} ${currentYear}`}
            onClick={(e) => onCardClick(e, mIdx)}
            className={clsx(
                'rounded-xl shadow-sm active:scale-[0.98] transition-transform cursor-pointer flex flex-shrink-0 flex-col p-4',
                'bg-white border border-gray-200 hover:border-black/20',
                'dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-600',
                isFirstLoad && `animate-fade-in-scale stagger-${mIdx + 1}`,
                isCurrent && 'ring-2 ring-gray-900 dark:ring-blue-50'

            )}
            style={{
                ...(isFirstLoad ? { opacity: 0, animationFillMode: 'forwards' } : {}),
                ...cardStyle
            }}
        >
            {/* Título do Mês Centralizado */}
            <div className="text-center mb-2">
                <span className={clsx(
                    'text-xs font-bold uppercase tracking-wide',
                    'text-gray-800 dark:text-gray-200'
                )}>
                    {MONTH_NAMES[mIdx]}
                </span>
            </div>

            {/* Grid de Dias Compacto (Sempre 6 linhas visuais) */}
            <div
                className={clsx(
                    "grid grid-cols-7 pointer-events-none flex-1 min-h-0 gap-x-2"
                )}
                style={{
                    // ✅ Force exactly 7 rows that distribute evenly
                    gridTemplateRows: 'repeat(7, 1fr)'
                }}
            >
                {/* Headers da Semana */}
                {weekDayHeaders.map((day, i) => (
                    <div
                        key={i}
                        className={clsx(
                            'text-center font-bold text-xs',
                            day.isWeekend
                                ? 'text-gray-300 dark:text-zinc-600'
                                : 'text-gray-400 dark:text-zinc-500',
                        )}
                    >
                        {day.char}
                    </div>
                ))}

                {/* Dias em branco antes do início do mês */}
                {monthData.blanks.map(b => (
                    <div key={`blank-${b}`} className="h-5"/>
                ))}

                {/* Dias do mês */}
                {monthData.days.map(d => {
                    const dayOfWeek = (monthData.firstDayIdx + d - 1) % 7;
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                    const isToday = isCurrent && d === currentDay;

                    return (
                        <div
                            key={d}
                            className={clsx(
                                'flex items-center justify-center text-sm'
                            )}
                        >
                            <span
                                className={clsx(
                                    'rounded-full flex items-center justify-center aspect-square w-7 h-7 text-sm',
                                    isToday && 'bg-black text-white dark:bg-white dark:text-black font-bold shadow-md',
                                    !isToday && isWeekend && 'text-gray-300 font-normal dark:text-zinc-600',
                                    !isToday && !isWeekend && 'text-gray-900 font-bold dark:text-zinc-300'
                                )}
                            >
                                {d}
                            </span>
                        </div>
                    );
                })}
                {monthData.trailingBlanks.map(b => (
                    <div key={`trail-${b}`} className="h-5"/>
                ))}
            </div>
        </div>
    );
});

export default YearViewLandscape;
