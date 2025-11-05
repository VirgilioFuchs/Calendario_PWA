import React, { useState} from "react";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { DayCellContentArg} from "@fullcalendar/core";
import { DayMarkers} from "../types.tsx";

import './MyCalendar.css';

const renderFavoriteIcon = () => {
    return (
        <img
            src="/star-icon.png"
            alt="favorito"
            className="dayMarker"
        />
    );
};

const formatDateKey = (date: Date): string => {
    return date.toISOString().split('T')[0];
}

const [mockDayMarkers, setMockDayMarkers] = useState<DayMarkers>({
    '2025-11-03': { isFavorite: true },
    '2025-11-04': { isFavorite: true },
    '2025-11-05': { isFavorite: true },
});

const MyCalendar: React.FC = () => {
    const renderCustomDayCell = (cellInfo: DayCellContentArg) => {
        const dateKey = formatDateKey(cellInfo.date);
        const markers = mockDayMarkers[dateKey];
        const renderFavoriteIcon = () => (
            <div className="dayMarker dot-favorite" title="favorito"></div>
        );

        const renderBirthdayIcon = () => (
            <div className="dayMarker dot-birthday" title="aniversario"></div>
        );

        const renderWorkIcon = () => (
            <div className="dayMarker dot-work" title="trabalho"></div>
        );
        return (
            <div className="customDayCellContainer">
                <div className="dayNumber">{cellInfo.dayNumberText}</div>

                <div className="dayMarkersContainer">
                    {markers?.isFavorite && renderFavoriteIcon()}
                    {markers?.isBirthday && renderBirthdayIcon()}
                    {markers?.isWork && renderWorkIcon()}
                </div>
            </div>
        );
    };

    const handleDateClick = (clickInfo: any) => {

    }
};