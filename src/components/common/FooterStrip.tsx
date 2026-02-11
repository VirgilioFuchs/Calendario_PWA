import React, {useMemo, useEffect, useState, useRef, useCallback} from 'react';
import {WEEK_DAYS_ABREVIATED} from '../../shared/types';
import clsx from "clsx";

interface FooterStripProps {
    currentYear: number;
    currentMonthIdx: number;
    selectedDay: number;
    onSelectDay: (day: number, monthIdx: number, year: number) => void;
    className?: string;
    orientation?: 'horizontal' | 'vertical'
    animStartY?: number;
    isExiting?: boolean;
}

//Barra de dias abaixo do calendário na aba dias
const FooterStrip: React.FC<FooterStripProps> = ({
                                                     currentYear,
                                                     currentMonthIdx,
                                                     selectedDay,
                                                     onSelectDay,
                                                     className = 'bottom-0',
                                                     animStartY,
                                                     orientation,
                                                     isExiting
                                                 }) => {

    const scrollRef = useRef<HTMLDivElement>(null);
    const [offsetY, setOffSetY] = useState(0);

    // Refs para valores atuais
    const selectedDayRef = useRef(selectedDay);
    const currentMonthIdxRef = useRef(currentMonthIdx);
    const currentYearRef = useRef(currentYear);

    useEffect(() => {
        selectedDayRef.current = selectedDay;
        currentMonthIdxRef.current = currentMonthIdx;
        currentYearRef.current = currentYear;
    }, [selectedDay, currentMonthIdx, currentYear]);

    // Controle de scroll
    const isScrolling = useRef(false);
    const lastSelectedIndex = useRef(-1);

    // Dia da semana que vai manter
    const targetWeekDayRef = useRef(new Date(currentYear, currentMonthIdx, selectedDay).getDay());

    useEffect(() => {
        targetWeekDayRef.current = new Date(currentYear, currentMonthIdx, selectedDay).getDay();
    }, [currentYear, currentMonthIdx, selectedDay]);

    // Animação E/S
    useEffect(() => {
        if (animStartY !== undefined) {
            const footerHeight = 80;
            const bottomSpace = className.includes('bottom-12') ? 48 : 0;
            const footerFinalY = window.innerHeight - footerHeight - bottomSpace;
            const delta = animStartY - footerFinalY;

            if (isExiting) {
                setOffSetY(delta);
            } else {
                setOffSetY(delta);
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        setOffSetY(0);
                    });
                });
            }
        }
    }, [animStartY, isExiting, className]);

    const today = new Date();
    const todayDay = today.getDate();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();

    const weeks = useMemo(() => {
        const allDays = [];
        const startMonthIdx = currentMonthIdx - 1;
        const startDate = new Date(currentYear, startMonthIdx, 1);
        const dayOfWeek = startDate.getDay();
        startDate.setDate(startDate.getDate() - dayOfWeek);
        const endMonthIdx = currentMonthIdx + 2;
        const endDate = new Date(currentYear, endMonthIdx, 0);
        const endDayOfWeek = endDate.getDay();
        endDate.setDate(endDate.getDate() + (6 - endDayOfWeek));

        const loopDate = new Date(startDate);

        while (loopDate <= endDate) {
            const y = loopDate.getFullYear();
            const isHidden = y !== currentYear;

            allDays.push({
                day: loopDate.getDate(),
                monthIdx: loopDate.getMonth(),
                year: y,
                weekDay: loopDate.getDay(),
                fullDate: new Date(loopDate),
                isHidden: isHidden,
                uniqueId: `${y}-${loopDate.getMonth()}-${loopDate.getDate()}`
            });
            loopDate.setDate(loopDate.getDate() + 1);
        }

        const chunks = [];
        for (let i = 0; i < allDays.length; i += 7) {
            chunks.push(allDays.slice(i, i + 7));
        }
        return chunks;
    }, [currentYear, currentMonthIdx]);

    const weeksRef = useRef(weeks);
    useEffect(() => {
        weeksRef.current = weeks;
    }, [weeks]);

    // Função otimizada para selecionar dia
    const selectDayFromIndex = useCallback((index: number) => {
        const currentWeeks = weeksRef.current;
        if (index < 0 || index >= currentWeeks.length) return;

        // Evita re-seleção do mesmo índice
        if (index === lastSelectedIndex.current) return;
        lastSelectedIndex.current = index;

        const targetWeek = currentWeeks[index];
        const dayToSelect = targetWeek.find(d => d.weekDay === targetWeekDayRef.current);

        if (dayToSelect && !dayToSelect.isHidden) {
            const isSameSelection =
                dayToSelect.day === selectedDayRef.current &&
                dayToSelect.monthIdx === currentMonthIdxRef.current &&
                dayToSelect.year === currentYearRef.current;

            if (!isSameSelection) {
                onSelectDay(dayToSelect.day, dayToSelect.monthIdx, dayToSelect.year);
            }
        }
    }, [onSelectDay]);

    // Handler de scroll usando requestAnimationFrame
    const handleScroll = useCallback(() => {
        if (isScrolling.current) return;

        const container = scrollRef.current;
        if (!container) return;

        let index = 0;
        if (orientation === 'vertical') {
            const height = container.clientHeight;
            const scrollPos = container.scrollTop;
            index = Math.round(scrollPos / height);
        } else {
            const width = container.clientWidth;
            const scrollPos = container.scrollLeft;
            index = Math.round(scrollPos / width);
        }

        selectDayFromIndex(index);
    }, [selectDayFromIndex, orientation]);

    // Usa scrollend se disponível, senão usa scroll normal
    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;

        const onScrollEnd = () => {
            if (isScrolling.current) return;

            let index = 0;
            if (orientation === 'vertical') {
                index = Math.round(container.scrollTop / container.clientHeight);
            } else {
                index = Math.round(container.scrollLeft / container.clientWidth);
            }
            selectDayFromIndex(index);
        };

        const supportsScrollEnd = 'onscrollend' in window;
        if (supportsScrollEnd) {
            container.addEventListener('scrollend', onScrollEnd);
        } else {
            // Fallback para quando o scroll termina sem o evento oficial
            container.addEventListener('scroll', handleScroll);
        }

        return () => {
            container.removeEventListener('scrollend', onScrollEnd);
            container.removeEventListener('scroll', handleScroll);
        };
    }, [selectDayFromIndex, orientation, handleScroll]);

    // Auto-scroll para a semana do dia selecionado
    useEffect(() => {
        if (!scrollRef.current) return;

        const weekIndex = weeks.findIndex(week =>
            week.some(d => d.day === selectedDay && d.monthIdx === currentMonthIdx && d.year === currentYear)
        );

        if (weekIndex !== -1) {
            const containerSize = orientation === 'vertical'
                ? scrollRef.current.clientHeight
                : scrollRef.current.clientWidth;
            const targetScroll = containerSize * weekIndex;
            const currentScroll = orientation === 'vertical'
                ? scrollRef.current.scrollTop
                : scrollRef.current.scrollLeft;

            if (Math.abs(currentScroll - targetScroll) > 10) {
                isScrolling.current = true;
                lastSelectedIndex.current = weekIndex;

                if (orientation === 'vertical') {
                    scrollRef.current.scrollTo({
                        top: targetScroll,
                        behavior: 'smooth'
                    });
                } else {
                    scrollRef.current.scrollTo({
                        left: targetScroll,
                        behavior: 'smooth'
                    });
                }

                const checkScrollEnd = () => {
                    const current = orientation === 'vertical'
                        ? (scrollRef.current?.scrollTop ?? 0)
                        : (scrollRef.current?.scrollLeft ?? 0);
                    if (Math.abs(current - targetScroll) < 5) {
                        isScrolling.current = false;
                    } else {
                        requestAnimationFrame(checkScrollEnd);
                    }
                };
                requestAnimationFrame(checkScrollEnd);
            }
        }
    }, [selectedDay, currentMonthIdx, currentYear, weeks, orientation]);

    const handleDayClick = (day: number, monthIdx: number, year: number) => {
        if (isScrolling.current) return;
        onSelectDay(day, monthIdx, year);
    };

    // LAYOUT LANDSCAPE (VERTICAL)
    if (orientation === 'vertical') {
        return (
            <div className="h-full w-full bg-white/90 dark:bg-zinc-950/80 backdrop-blur-md border-l border-gray-200 dark:border-zinc-800 shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.05)] dark:shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.35)]">
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex flex-col items-center w-full h-full overflow-y-auto scrollbar-hide snap-y snap-mandatory"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                >
                    {weeks.map((week, wIdx) => (
                        <div
                            key={`week-${wIdx}`}
                            className="flex-none min-h-full h-full w-full flex flex-col justify-center items-center snap-center snap-always py-2"
                        >
                            {week.map((item) => {
                                if (item.isHidden) {
                                    return <div key={item.uniqueId} className="flex-1 w-full" />;
                                }

                                const isSelected = item.day === selectedDay && item.monthIdx === currentMonthIdx;
                                const isWeekend = item.weekDay === 0 || item.weekDay === 6;
                                const isToday = item.day === todayDay && item.monthIdx === todayMonth && item.year === todayYear;

                                return (
                                    <button
                                        key={item.uniqueId}
                                        onClick={() => handleDayClick(item.day, item.monthIdx, item.year)}
                                        className={clsx(
                                            'flex flex-col items-center justify-center w-full py-1.5 transition-all duration-200',
                                            !isSelected && 'active:scale-95'
                                        )}
                                    >
                                        <span className={clsx(
                                            'text-[9px] font-bold uppercase mb-0.5 transition-colors',
                                            isSelected
                                                ? 'text-gray-900 dark:text-zinc-100'
                                                : isWeekend
                                                    ? 'text-gray-400 dark:text-zinc-500'
                                                    : 'text-gray-800 dark:text-zinc-400'
                                        )}>
                                            {WEEK_DAYS_ABREVIATED[item.weekDay]}
                                        </span>

                                        <div className={clsx(
                                            'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300',
                                            isSelected
                                                ? 'bg-black text-white scale-110 shadow-md dark:bg-zinc-100 dark:text-zinc-950'
                                                : isToday
                                                    ? 'bg-gray-200 text-gray-900 border border-gray-300 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700'
                                                    : isWeekend
                                                        ? 'text-gray-400 dark:text-zinc-500'
                                                        : 'text-gray-800 dark:text-zinc-200'
                                        )}>
                                            {item.day}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // LAYOUT PORTRAIT (HORIZONTAL)
    return (
        <div
            style={{ transform: `translateY(${offsetY}px)` }}
            className={`
                h-20 bg-white/90 dark:bg-zinc-950/80 backdrop-blur-md
                border-t border-gray-200 dark:border-zinc-800
                fixed left-0 right-0 z-[60] flex items-center
                shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.35)]
                transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1)
                ${className}
            `}
        >
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex items-center w-full h-full overflow-x-auto scrollbar-hide snap-x snap-mandatory"
                style={{ WebkitOverflowScrolling: 'touch' }}
            >
                {weeks.map((week, wIdx) => (
                    <div
                        key={`week-${wIdx}`}
                        className="flex-none min-w-full w-full grid grid-cols-7 snap-center snap-always h-full"
                    >
                        {week.map((item) => {
                            if (item.isHidden) {
                                return <div key={item.uniqueId} className="flex-1"/>;
                            }

                            const isSelected = item.day === selectedDay && item.monthIdx === currentMonthIdx;
                            const isWeekend = item.weekDay === 0 || item.weekDay === 6;
                            const isToday = item.day === todayDay && item.monthIdx === todayMonth && item.year === todayYear;

                            return (
                                <button
                                    key={item.uniqueId}
                                    onClick={() => handleDayClick(item.day, item.monthIdx, item.year)}
                                    className={`flex flex-col items-center justify-center h-full transition-all duration-200
                                        ${!isSelected ? 'active:scale-95' : ''}`}
                                >
                                    <span
                                        className={`text-[9px] font-bold uppercase mb-1 transition-colors
                                        ${isSelected
                                            ? 'text-gray-900 dark:text-zinc-100'
                                            : isWeekend
                                                ? 'text-gray-400 dark:text-zinc-500'
                                                : 'text-gray-800 dark:text-zinc-400'}
                                        `}
                                    >
                                        {WEEK_DAYS_ABREVIATED[item.weekDay]}
                                    </span>

                                    <div className={`
                                        w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                                        ${isSelected
                                        ? 'bg-black text-white scale-110 shadow-md dark:bg-zinc-100 dark:text-zinc-950'
                                        : isToday
                                            ? 'bg-gray-200 text-gray-900 border border-gray-300 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700'
                                            : `${isWeekend ? 'text-gray-400 dark:text-zinc-500'
                                                : 'text-gray-800 dark:text-zinc-200'}
                                            `}
                                    `}>
                                        {item.day}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FooterStrip;