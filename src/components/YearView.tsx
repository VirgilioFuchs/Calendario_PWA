import React, {forwardRef, useCallback, useImperativeHandle, useMemo, useRef} from 'react';
import {MONTH_NAMES, WEEK_DAYS, getDaysInMonth} from '../types';
import {useDragScroll} from '../hooks/useDragScroll';
import {useOrientation} from "../hooks/useOrientation.ts";
import clsx from 'clsx';

// Propriedaes do componente YearView
interface YearViewProps {
    currentYear: number;
    onMonthClick: (monthIdx: number, coords: { x: number, y: number }) => void;
    isFirstLoad: boolean;
}

interface MonthCardProps {
    mIdx: number;
    currentYear: number;
    isFirstLoad: boolean;
    onCardClick: (e: React.MouseEvent<HTMLDivElement>, mIdx: number) => void;
    setCardRef: (el: HTMLDivElement | null, idx: number) => void;
}

// ===== COMPONENTE MONTHCARD (MEMOIZADO) =====
const MonthCard = React.memo<MonthCardProps>(({
                                                  mIdx,
                                                  currentYear,
                                                  isFirstLoad,
                                                  onCardClick,
                                                  setCardRef
                                              }) => {
    // ✅ Cache dos cálculos pesados com useMemo
    const monthData = useMemo(() => {
        const daysInMonth = getDaysInMonth(currentYear, mIdx);
        const firstDayIdx = new Date(currentYear, mIdx, 1).getDay();
        const days = Array.from({length: daysInMonth}, (_, i) => i + 1);
        const blanks = Array.from({length: firstDayIdx}, (_, i) => i);
        const totalSlots = 42;
        const usedSlots = blanks.length + days.length;
        const trailingBlanks = Array.from({length: totalSlots - usedSlots}, (_, i) => i);

        return {days, blanks, trailingBlanks, firstDayIdx};
    }, [currentYear, mIdx]);

    // ✅ Data atual calculada uma vez
    const today = useMemo(() => new Date(), []);
    const isCurrent = mIdx === today.getMonth() && currentYear === today.getFullYear();
    const currentDay = today.getDate();

    // ✅ Headers memoizados
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
                'rounded-xl p-3 shadow-sm active:scale-[0.98] transition-transform cursor-pointer flex flex-col',
                'bg-white border border-gray-200 hover:border-black/20',
                'dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-600',
                isFirstLoad && `animate-fade-in-scale stagger-${mIdx + 1}`,
                isCurrent && 'ring-2 ring-gray-900 dark:ring-blue-50'
            )}
            style={isFirstLoad ? {
                opacity: 0,
                animationFillMode: 'forwards'
            } : undefined}
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
            <div className="grid grid-cols-7 gap-y-1 gap-x-0.5 pointer-events-none flex-1 content-start">
                {/* Headers da Semana */}
                {weekDayHeaders.map((day, i) => (
                    <div
                        key={i}
                        className={clsx(
                            'text-center text-[8px] font-bold',
                            day.isWeekend
                                ? 'text-gray-300 dark:text-zinc-600'
                                : 'text-gray-400 dark:text-zinc-500'
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
                                'h-5 w-5 mx-auto rounded-full flex items-center justify-center text-[9px] relative',
                                isToday && 'bg-black text-white dark:bg-white dark:text-black font-bold shadow-md',
                                !isToday && isWeekend && 'text-gray-300 font-normal dark:text-zinc-600',
                                !isToday && !isWeekend && 'text-gray-900 font-bold dark:text-zinc-300'
                            )}
                        >
                            {d}
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

MonthCard.displayName = 'MonthCard';

export interface YearViewHandle {
    getScrollTop: () => number;
    setScrollTop: (value: number) => void;
}

// COMPONENTE PRINCIPAL YEARVIEW
const YearView = forwardRef<YearViewHandle, YearViewProps>((
    {
        currentYear,
        onMonthClick,
        isFirstLoad
    },
    ref
) => {
    const containerRef = useDragScroll() as React.RefObject<HTMLDivElement>;
    const orientation = useOrientation();

    const monthCardsRef = useRef<(HTMLDivElement | null)[]>([]);
    const months = useMemo(() => Array.from({length: 12}, (_, i) => i), []);

    useImperativeHandle(ref, () => ({
        getScrollTop: () => {
            const element = containerRef.current;
            return element?.scrollTop || 0;
        },
        setScrollTop: (value: number) => {
            const element = containerRef.current;
            if (element) {
                element.scrollTop = value;
            }
        }
    }), [containerRef]);

    // Função de clique no card
    const handleCardClick = useCallback((e: React.MouseEvent<HTMLDivElement>, mIdx: number) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const containerRect = containerRef.current?.getBoundingClientRect();

        // Calcular coordenadas relativas
        const x = rect.left - (containerRect?.left ?? 0);
        const y = rect.top - (containerRect?.top ?? 0);

        onMonthClick(mIdx, {x, y});
    }, [onMonthClick, containerRef]);

    // Função para definir ref do card
    const setMonthCardRef = useCallback((el: HTMLDivElement | null, idx: number) => {
        monthCardsRef.current[idx] = el;
    }, []);

    const containerClasses = clsx(
        'flex-1 overflow-y-auto scroll-smooth h-full origin-top-left gpu-accelerated',
        'bg-gray-50 dark:bg-zinc-950',
        orientation === 'portrait' ? 'pt-6 px-3 pb-5' : 'pt-4 px-6 pb-4'
    );

    const gridClasses = clsx(
        'grid gap-3',
        orientation === 'portrait' ? 'grid-cols-2' : 'grid-cols-3'
    );

    return (
        <div ref={containerRef} className={containerClasses}>
            {/* Grid com linhas divisórias a cada 3 meses */}
            {orientation === 'landscape' ? (
                <div className="space-y-8">
                    {[0, 3, 6, 9].map(startIdx => (
                        <div className={gridClasses}>
                            {months.slice(startIdx, startIdx + 3).map((mIdx) => (
                                <MonthCard
                                    key={mIdx}
                                    mIdx={mIdx}
                                    currentYear={currentYear}
                                    isFirstLoad={isFirstLoad}
                                    onCardClick={handleCardClick}
                                    setCardRef={setMonthCardRef}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            ) : (
                /* ✅ PORTRAIT: Grid tradicional 2 colunas */
                <div className={gridClasses}>
                    {months.map((mIdx) => (
                        <MonthCard
                            key={mIdx}
                            mIdx={mIdx}
                            currentYear={currentYear}
                            isFirstLoad={isFirstLoad}
                            onCardClick={handleCardClick}
                            setCardRef={setMonthCardRef}
                        />
                    ))}
                </div>
            )}
        </div>
    );
});

export default React.memo(YearView);

