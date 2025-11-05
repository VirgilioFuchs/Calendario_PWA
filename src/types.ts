export interface DayMarkers {
    [dateKey: string]: {
        isFavorite?: boolean;
        isBirthday?: boolean;
        isWork?: boolean;
    }
}