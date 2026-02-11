import {forwardRef} from 'react';
import YearViewPortrait from '../components/YearViewPortrait';
import YearViewLandscape from '../components/YearViewLandscape';
import type {YearViewHandle} from '../components/YearViewLayout';

interface YearControllerProps {
    currentYear: number;
    onMonthClick: (monthIdx: number, coords: { x: number, y: number }) => void;
    isFirstLoad: boolean;
    orientation: 'portrait' | 'landscape';
}

const YearController = forwardRef<YearViewHandle, YearControllerProps>((props, ref) => {
    if (props.orientation === 'landscape') {
        return (
            <YearViewLandscape
                ref={ref}
                currentYear={props.currentYear}
                onMonthClick={props.onMonthClick}
                isFirstLoad={props.isFirstLoad}
            />
        );
    }

    return (
        <YearViewPortrait
            ref={ref}
            currentYear={props.currentYear}
            onMonthClick={props.onMonthClick}
            isFirstLoad={props.isFirstLoad}
        />
    );
});

YearController.displayName = 'YearController';

export default YearController;
export type {YearViewHandle};
