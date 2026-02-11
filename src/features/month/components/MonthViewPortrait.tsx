import React from 'react';
import MonthView from './MonthViewLayout';

interface MonthViewPortraitProps {
    year: number;
    monthIdx: number;
    onBack: () => void;
    onDayClick: (monthIdx: number, day: number, react?: DOMRect) => void;
    zoomOrigin?: { x: number; y: number };
}

const MonthViewPortrait: React.FC<MonthViewPortraitProps> = ({year, monthIdx, onBack, onDayClick}) => (
    <MonthView
        year={year}
        monthIdx={monthIdx}
        onBack={onBack}
        onDayClick={onDayClick}
        horizontalMode={false}
    />
);

export default MonthViewPortrait;
