import React from 'react';
import DayView from './DayViewContent';
import type {CalendarEvent} from '../../../shared/types';

interface DayViewPortraitProps {
    currentYear: number;
    currentMonthIdx: number;
    selectedDay: number;
    onBack: () => void;
    onEventClick: (event: CalendarEvent) => void;
    onDayChange?: (day: number, monthIdx: number, year: number) => void;
}

const DayViewPortrait: React.FC<DayViewPortraitProps> = (props) => (
    <DayView
        currentYear={props.currentYear}
        currentMonthIdx={props.currentMonthIdx}
        selectedDay={props.selectedDay}
        onBack={props.onBack}
        onEventClick={props.onEventClick}
        onDayChange={props.onDayChange}
        horizontalMode={false}
    />
);

export default DayViewPortrait;
