import {forwardRef} from 'react';
import YearViewPortrait from './YearViewPortrait';
import YearViewLandscape from './YearViewLandscape';
import type {YearViewHandle} from './YearViewContent';

interface YearViewProps {
    currentYear: number;
    onMonthClick: (monthIdx: number, coords: { x: number, y: number }) => void;
    isFirstLoad: boolean;
    orientation: 'portrait' | 'landscape';
}

const YearView = forwardRef<YearViewHandle, YearViewProps>((props, ref) => {
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

YearView.displayName = 'YearView';

export default YearView;
export type {YearViewHandle};
