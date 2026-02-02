// components/DayCarousel.tsx

import React, { useRef, useState } from "react";
import DayView from "./DayView";
import type { CalendarEvent } from "../types";

interface DayCarouselProps {
    currentYear: number;
    currentMonthIdx: number;
    selectedDay: number;
    onBack: () => void;
    onChangeDate: (day: number, monthIdx: number, year: number) => void;
    onEventClick: (event: CalendarEvent) => void;
    horizontalMode?: boolean;
}

const DayCarousel: React.FC<DayCarouselProps> = ({
                                                     currentYear,
                                                     currentMonthIdx,
                                                     selectedDay,
                                                     onBack,
                                                     onChangeDate,
                                                     onEventClick,
                                                     horizontalMode = false,
                                                 }) => {
    const touchStartX = useRef<number | null>(null);
    const touchStartY = useRef<number | null>(null);
    const [isHorizontalSwipe, setIsHorizontalSwipe] = useState<boolean | null>(null);

    const baseDate = new Date(currentYear, currentMonthIdx, selectedDay);

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        const touch = e.touches[0];
        touchStartX.current = touch.clientX;
        touchStartY.current = touch.clientY;
        setIsHorizontalSwipe(null);
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (touchStartX.current == null || touchStartY.current == null) return;

        const touch = e.touches[0];
        const deltaX = touch.clientX - touchStartX.current;
        const deltaY = touch.clientY - touchStartY.current;

        if (isHorizontalSwipe === null) {
            const absX = Math.abs(deltaX);
            const absY = Math.abs(deltaY);
            const minDetect = 10;

            if (absX < minDetect && absY < minDetect) return;

            if (absX > absY) {
                setIsHorizontalSwipe(true);
            } else {
                setIsHorizontalSwipe(false);
            }
        }
        // Não precisa movimentar nada visualmente
    };

    const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
        if (
            touchStartX.current == null ||
            touchStartY.current == null ||
            isHorizontalSwipe !== true
        ) {
            touchStartX.current = null;
            touchStartY.current = null;
            setIsHorizontalSwipe(null);
            return;
        }

        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - touchStartX.current;
        const screenWidth = window.innerWidth || 1;
        const threshold = screenWidth * 0.3;

        let diff = 0;
        if (deltaX <= -threshold) {
            diff = 1;   // próximo dia
        } else if (deltaX >= threshold) {
            diff = -1;  // dia anterior
        }

        if (diff !== 0) {
            const newDate = new Date(currentYear, currentMonthIdx, selectedDay + diff);
            onChangeDate(
                newDate.getDate(),
                newDate.getMonth(),
                newDate.getFullYear(),
            );
        }

        touchStartX.current = null;
        touchStartY.current = null;
        setIsHorizontalSwipe(null);
    };

    const handleDayClick = (monthIdx: number, day:number) => {
        if (monthIdx === currentMonthIdx && day === selectedDay) {
            return;
        }
        onChangeDate(day, monthIdx, currentYear);
    }

    return (
        <div
            className="absolute inset-0 overflow-hidden bg-white dark:bg-zinc-950"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <DayView
                currentYear={baseDate.getFullYear()}
                currentMonthIdx={baseDate.getMonth()}
                selectedDay={baseDate.getDate()}
                onBack={onBack}
                onEventClick={onEventClick}
                horizontalMode={horizontalMode}
                onDayClick={handleDayClick}
            />
        </div>
    );
};

export default DayCarousel;
