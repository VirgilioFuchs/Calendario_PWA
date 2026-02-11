import React from 'react';
import DayView from './DayViewLayout';
import type {CalendarEvent} from '../../../shared/types';

interface DayViewLandscapeProps {
    currentYear: number;
    currentMonthIdx: number;
    selectedDay: number;
    onBack: () => void;
    onEventClick: (event: CalendarEvent) => void;
    onDayChange?: (day: number, monthIdx: number, year: number) => void;
}

const DayViewLandscape: React.FC<DayViewLandscapeProps> = (props) => (
    <DayView
        currentYear={props.currentYear}
        currentMonthIdx={props.currentMonthIdx}
        selectedDay={props.selectedDay}
        onBack={props.onBack}
        onEventClick={props.onEventClick}
        onDayChange={props.onDayChange}
        horizontalMode
    />
);

export default DayViewLandscape;
