import React, {useCallback, useMemo, useRef} from 'react';
import {useDragScroll} from "../../../shared/hooks/useDragScroll.ts";
import clsx from "clsx";
import YearViewLandscape from '../orientation/YearViewLandscape.tsx';
import YearViewPortrait from '../orientation/YearViewPortrait.tsx';

interface YearViewProps {
    currentYear: number;
    isFirstLoad: boolean;
    onMonthClick: (mIdx: number, coords: {x: number, y: number}) => void;
    orientation: 'portrait' | 'landscape';
}

const YearView: React.FC<YearViewProps> = ({
                                               currentYear,
                                               isFirstLoad,
                                               onMonthClick,
                                               orientation,
                                           }) => {
    const containerRef = useDragScroll() as React.RefObject<HTMLDivElement>;
    const monthCardsRef = useRef<(HTMLDivElement | null)[]>([]);
    const months = useMemo(() => Array.from({length: 12}, (_, i) => i), []);

    const isLandscape = orientation === 'landscape';

    // Função de clique no card
    const handleCardClick = useCallback((e: React.MouseEvent, mIdx: number) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const containerRect = containerRef.current?.getBoundingClientRect();

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
        isLandscape
            ? 'overflow-x-auto overflow-y-hidden p-2'
            : 'overflow-y-auto overflow-x-hidden pt-4 px-2 pb-4'
    );

    const landscapeCardStyle: React.CSSProperties = {
        minWidth: 'calc((100% - 2rem) / 3)',
        width: 'calc((100% - 2rem) / 3)',
        height: '100%',
        minHeight: 0
    };

    return (
        <div ref={containerRef} className={containerClasses}>
            {isLandscape ? (
                <div className="flex gap-2 h-full">
                    {months.map((mIdx) => (
                        <YearViewLandscape
                            key={mIdx}
                            mIdx={mIdx}
                            currentYear={currentYear}
                            isFirstLoad={isFirstLoad}
                            cardStyle={landscapeCardStyle}
                            onCardClick={handleCardClick}
                            setCardRef={setMonthCardRef}
                        />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-2">
                    {months.map((mIdx) => (
                        <YearViewPortrait
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
};

export default YearView;
