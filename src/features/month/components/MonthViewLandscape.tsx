import React from 'react';
import MonthView from './MonthViewContent';

interface MonthViewLandscapeProps {
    year: number;
    monthIdx: number;
    onBack: () => void;
    onDayClick: (monthIdx: number, day: number, react?: DOMRect) => void;
    zoomOrigin?: { x: number; y: number };
}

const MonthViewLandscape: React.FC<MonthViewLandscapeProps> = ({year, monthIdx, onBack, onDayClick}) => (
    <MonthView
        year={year}
        monthIdx={monthIdx}
        onBack={onBack}
        onDayClick={onDayClick}
        horizontalMode={true}
    />
);

export default MonthViewLandscape;
