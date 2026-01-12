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
}

const DayCarousel: React.FC<DayCarouselProps> = ({
                                                     currentYear,
                                                     currentMonthIdx,
                                                     selectedDay,
                                                     onBack,
                                                     onChangeDate,
                                                     onEventClick,
                                                 }) => {
    const [dragX, setDragX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isHorizontalSwipe, setIsHorizontalSwipe] =
        useState<boolean | null>(null);

    const touchStartX = useRef<number | null>(null);
    const touchStartY = useRef<number | null>(null);

    const baseDate = new Date(currentYear, currentMonthIdx, selectedDay);
    const prevDate = new Date(currentYear, currentMonthIdx, selectedDay - 1);
    const nextDate = new Date(currentYear, currentMonthIdx, selectedDay + 1);

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        const touch = e.touches[0];
        touchStartX.current = touch.clientX;
        touchStartY.current = touch.clientY;
        setIsDragging(true);
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
                e.preventDefault();
            } else {
                setIsHorizontalSwipe(false);
            }
        }

        if (isHorizontalSwipe === false) return;

        setDragX(deltaX);
        e.preventDefault();
    };

    const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
        if (
            touchStartX.current == null ||
            touchStartY.current == null ||
            isHorizontalSwipe !== true
        ) {
            setDragX(0);
            setIsDragging(false);
            setIsHorizontalSwipe(null);
            touchStartX.current = null;
            touchStartY.current = null;
            return;
        }

        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - touchStartX.current;

        const screenWidth = window.innerWidth || 1;
        const threshold = screenWidth * 0.3;

        let diff = 0;
        if (deltaX <= -threshold) {
            diff = 1;
        } else if (deltaX >= threshold) {
            diff = -1;
        }

        if (diff !== 0) {
            const newDate = new Date(currentYear, currentMonthIdx, selectedDay + diff);
            onChangeDate(
                newDate.getDate(),
                newDate.getMonth(),
                newDate.getFullYear()
            );
        }

        setDragX(0);
        setIsDragging(false);
        setIsHorizontalSwipe(null);
        touchStartX.current = null;
        touchStartY.current = null;
    };

    return (
        <div
            className="absolute inset-0 overflow-hidden bg-white dark:bg-zinc-950"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div
                className="flex h-full"
                style={{
                    width: "300%",
                    transform: `translateX(calc(${dragX}px - 100%))`,
                    transition: isDragging ? "none" : "transform 0.2s ease-out",
                }}
            >
                {/* Dia anterior */}
                <div className="w-full h-full shrink-0">
                    <DayView
                        currentYear={prevDate.getFullYear()}
                        currentMonthIdx={prevDate.getMonth()}
                        selectedDay={prevDate.getDate()}
                        onBack={onBack}
                        onChangeDate={onChangeDate}
                        onEventClick={onEventClick}
                    />
                </div>

                {/* Dia atual */}
                <div className="w-full h-full shrink-0">
                    <DayView
                        currentYear={baseDate.getFullYear()}
                        currentMonthIdx={baseDate.getMonth()}
                        selectedDay={baseDate.getDate()}
                        onBack={onBack}
                        onChangeDate={onChangeDate}
                        onEventClick={onEventClick}
                    />
                </div>

                {/* Dia seguinte */}
                <div className="w-full h-full shrink-0">
                    <DayView
                        currentYear={nextDate.getFullYear()}
                        currentMonthIdx={nextDate.getMonth()}
                        selectedDay={nextDate.getDate()}
                        onBack={onBack}
                        onChangeDate={onChangeDate}
                        onEventClick={onEventClick}
                    />
                </div>
            </div>
        </div>
    );
};

export default DayCarousel;
