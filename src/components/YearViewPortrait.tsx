import {forwardRef} from 'react';
import YearView, {type YearViewHandle} from './YearView';

interface YearViewPortraitProps {
    currentYear: number;
    onMonthClick: (monthIdx: number, coords: { x: number, y: number }) => void;
    isFirstLoad: boolean;
}

const YearViewPortrait = forwardRef<YearViewHandle, YearViewPortraitProps>((props, ref) => (
    <YearView
        ref={ref}
        currentYear={props.currentYear}
        onMonthClick={props.onMonthClick}
        isFirstLoad={props.isFirstLoad}
        layoutMode="portrait"
    />
));

YearViewPortrait.displayName = 'YearViewPortrait';

export default YearViewPortrait;
