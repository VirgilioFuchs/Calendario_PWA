import React from 'react';
import MonthViewPortrait from '../orientation/MonthViewPortrait.tsx';
import MonthViewLandscape from '../orientation/MonthViewLandscape.tsx';
import type {CalendarEvent} from "../../../shared/types";

interface MonthViewProps {
    year: number;
    monthIdx: number;
    onBack: () => void;
    selectedDay: number;
    onDayClick: (monthIdx: number, day: number, react?: DOMRect) => void;
    orientation: 'portrait' | 'landscape';
    onEventClick?: (event: CalendarEvent, monthIdx: number, day: number) => void;
}

const MonthView: React.FC<MonthViewProps> = ({
                                                 year,
                                                 monthIdx,
                                                 onBack,
                                                 onDayClick,
                                                 orientation,
                                                 onEventClick,
                                                 selectedDay,
                                             }) => {
    const horizontalMode = orientation === 'landscape';

    if (horizontalMode) {
        return (
            <
                MonthViewLandscape
                year={year}
                monthIdx={monthIdx}
                selectedDay={selectedDay}
                onBack={onBack}
                onDayClick={onDayClick}
                onEventClick={onEventClick}
            />
        );
    }

    return (
        <
            MonthViewPortrait
            year={year}
            monthIdx={monthIdx}
            onBack={onBack}
            onDayClick={onDayClick}
        />
    );

};

export default MonthView;
