import React from 'react';
import MonthViewPortrait from '../components/MonthViewPortrait';
import MonthViewLandscape from '../components/MonthViewLandscape';

interface MonthControllerProps {
    year: number;
    monthIdx: number;
    onBack: () => void;
    onDayClick: (monthIdx: number, day: number, react?: DOMRect) => void;
    zoomOrigin?: { x: number; y: number };
    orientation: 'portrait' | 'landscape';
}

const MonthController: React.FC<MonthControllerProps> = (props) => {
    if (props.orientation === 'landscape') {
        return (
            <MonthViewLandscape
                year={props.year}
                monthIdx={props.monthIdx}
                onBack={props.onBack}
                onDayClick={props.onDayClick}
                zoomOrigin={props.zoomOrigin}
            />
        );
    }

    return (
        <MonthViewPortrait
            year={props.year}
            monthIdx={props.monthIdx}
            onBack={props.onBack}
            onDayClick={props.onDayClick}
            zoomOrigin={props.zoomOrigin}
        />
    );
};

export default MonthController;
