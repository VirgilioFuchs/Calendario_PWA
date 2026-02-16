import React from 'react';
import MonthViewPortrait from '../orientation/MonthViewPortrait.tsx';
import MonthViewLandscape from '../orientation/MonthViewLandscape.tsx';

interface MonthViewProps {
    year: number;
    monthIdx: number;
    onBack: () => void;
    onDayClick: (monthIdx: number, day: number, react?: DOMRect) => void;
    orientation: 'portrait' | 'landscape';
}

const MonthView: React.FC<MonthViewProps> = ({
                                                 year,
                                                 monthIdx,
                                                 onBack,
                                                 onDayClick,
                                                 orientation
                                             }) => {
    const horizontalMode = orientation === 'landscape';

    if (horizontalMode) {
        return (
            <
                MonthViewLandscape
                year={year}
                monthIdx={monthIdx}
                onBack={onBack}
                onDayClick={onDayClick}
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
