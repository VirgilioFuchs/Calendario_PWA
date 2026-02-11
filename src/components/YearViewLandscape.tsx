import {forwardRef} from 'react';
import YearView, {type YearViewHandle} from './YearView';

interface YearViewLandscapeProps {
    currentYear: number;
    onMonthClick: (monthIdx: number, coords: { x: number, y: number }) => void;
    isFirstLoad: boolean;
}

const YearViewLandscape = forwardRef<YearViewHandle, YearViewLandscapeProps>((props, ref) => (
    <YearView
        ref={ref}
        currentYear={props.currentYear}
        onMonthClick={props.onMonthClick}
        isFirstLoad={props.isFirstLoad}
        layoutMode="landscape"
    />
));

YearViewLandscape.displayName = 'YearViewLandscape';

export default YearViewLandscape;
