import React, {useRef, useState, useCallback, useEffect} from "react";
import Calendar from '@toast-ui/react-calendar';
import {TuiDate, TuiDateMatrix } from '@toast-ui/calendar';
import '@toast-ui/calendar/dist/toastui-calendar.min.css';
import {EventImageText} from "./EventImageText.tsx";
import styles from './MyCalendar.module.css'
import {useSwipeable} from "react-swipeable";

interface MySchedule {
    id: string;
    calendarId: string;
    title: string;
    category: 'time' | 'allday';
    start: TuiDate;
    end?: TuiDate | null;
    isFavorite?: boolean;
    originalStart: string;
    allDay: boolean;
}

const MyCalendar: React.FC = () => {
    const calendarRef = useRef<Calendar>(null);

    const [schedules] = useState<MySchedule[]>([
        {
            id: '1',
            calendarId: '1',
            title: 'Ir trabalhar!',
            start: '2025-11-04T09:00:00',
            end: '2025-11-04T10:00:00',
            category: 'time',
            originalStart: '2025-11-04T09:00:00',
            allDay: false
        },
        {
            id: '2',
            calendarId: '1',
            title: 'Ir trabalhar!',
            start: '2025-11-05T10:00:00',
            end: '2025-11-05T11:00:00',
            category: 'time',
            originalStart: '2025-11-05T10:00:00',
            allDay: false
        },
        {
            id: '3',
            calendarId: '1',
            title: 'Ir trabalhar!',
            start: '2025-11-06T09:30:00',
            end: '2025-11-06T10:30:00',
            category: 'time',
            originalStart: '2025-11-06T09:30:00',
            allDay: false
        },
        {
            id: '4',
            calendarId: '1',
            title: 'Encontrar Amigos!',
            start: '2025-11-07T14:45:00',
            end: '2025-11-07T15:45:00',
            category: 'time',
            originalStart: '2025-11-07T14:45:00',
            allDay: false
        },
        {
            id: '5',
            calendarId: '1',
            title: 'Encontrar Amigos!',
            start: '2025-11-07',
            end: '2025-11-07',
            category: 'allday',
            originalStart: '2025-11-07',
            allDay: true
        },
    ]);

    const [selectedDayEvents, setSelectedDateEvents] = useState<MySchedule[]>([]);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date()); // titulo - header toolbar (mes/ano)

    const handlePrev = useCallback(() => {
        calendarRef.current?.getInstance().prev();
        const newDate = calendarRef.current?.getInstance().getDate().toDate();
        if (newDate) setCurrentDate(newDate);
    }, []);

    const handleNext = useCallback(() => {
        calendarRef.current?.getInstance().next();
        const newDate = calendarRef.current?.getInstance().getDate().toDate();
        if (newDate) setCurrentDate(newDate);
    }, []);

    // Arrastar para trocar de mês
    const swipeHandlers = useSwipeable({
        onSwipedLeft: () => handleNext(), // chama o mês posterior
        onSwipedRight: () => handlePrev(), // chama o mês anterior
        trackMouse: true,
        // Impede da página rolar junto
        preventScrollOnSwipe: true
    });

    const handleSelectDateTime = (event: { start: Date, end: Date }) => {
        const clickedDateStr = event.start.toISOString().split('T')[0];

        // Lógia de Desselecionar o dia
        if (selectedDate === clickedDateStr) {
            setSelectedDateEvents(schedules);
            setSelectedDate(null);
            document.documentElement.classList.remove('calendar-selection-active');
            calendarRef.current?.getInstance().clearGridSelections();
            return;
        }

        // Seleciona o dia
        calendarRef.current?.getInstance().clearGridSelections();
        calendarRef.current?.getInstance().select(event.start, event.end);

        // Atualiza a lista Eventos do dia
        const eventsOnThisDay = schedules.filter(schedule => {
            return schedule.start.toString().split('T')[0] === clickedDateStr;
        });
        setSelectedDateEvents(eventsOnThisDay);
        setSelectedDate(clickedDateStr);
        document.documentElement.classList.add('calendar-selection-active');
    };
    // atualiza a lista Eventos do mês
    useEffect(() => {
        setSelectedDateEvents(schedules);
    }, [schedules]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const calendarElement = document.querySelector(('.App'));
            if (calendarElement && !calendarElement.contains(event.target as Node)) {
                calendarRef.current?.getInstance().clearGridSelections();
                setSelectedDate(null);
                setSelectedDateEvents(schedules);
                document.documentElement.classList.remove('calendar-selection-active');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [schedules]);

    const formatEventTime = (event: MySchedule) => {
        const startDate = new Date(event.originalStart);
        if (event.allDay) {
            return 'Dia Inteiro';
        }

        const timeOptions: Intl.DateTimeFormatOptions = {hour: "2-digit", minute: "2-digit"};
        return startDate.toLocaleTimeString('pt-BR', timeOptions);
    };

    const formatEventDate = (event: MySchedule) => {
        const startDate = new Date(event.originalStart);
        const dateOptions: Intl.DateTimeFormatOptions = {day: "2-digit", month: "2-digit", year: "numeric"};
        return startDate.toLocaleDateString('pt-BR', dateOptions);
    };

    const templates = {
        monthDaycell(day: TuiDateMatrix) {
            const dateStr = day.date.toISOString().split('T')[0];
            const hasEvent = schedules.some(
                (s) => s.start.toString().split('T')[0] === dateStr
            );

            return (
                <div className={styles.customDayCell}>
                    <span className={styles.customDayNumber}>{day.date.getDate()}</span>
                    <div className={styles.customMarkersContainer}>
                        {hasEvent && (
                            <img
                                src="/star-icon.png"
                                alt="evento"
                                style={{width: '12px', height: '12px'}}
                            />
                        )}
                    </div>
                </div>
            );
        },
        monthMoreClose() {
            return '';
        },
        monthGridHeaderExceed() {
            return '';
        },
    };
    return (
        <>
            <header>
                <h1>Calendário Anglo</h1>
                <div className={styles.calendarControls}>
                    <span className={styles.calendarTitle}>
                        {currentDate.toLocaleDateString('pt-BR', {
                            month: 'long',
                            year: 'numeric',
                        })}
                    </span>
                </div>
            </header>

            <div className="content-wrapper">
                <main className={styles.calendarContainer} {...swipeHandlers}>
                    <Calendar
                        ref={calendarRef}
                        view="month"
                        schedules={schedules}
                        useDetailPopup={false}
                        useFormPopup={false}

                        // Conecta as funções
                        templates={templates}
                        onSelectDateTime={handleSelectDateTime}

                        month={{
                            dayNames: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
                            startDayOfWeek: 0,
                            isAlways6Weeks: false,
                        }}
                    />
                </main>

                <section className="event-list-container">
                    <div className="event-list">
                        {selectedDayEvents.length > 0 ? (
                            selectedDayEvents.map((event, index) => (
                                <EventImageText
                                    key={event.id + index}
                                    imageUrl={"/star-icon.png"}
                                    altText="favoritos"
                                    text={event.title}
                                    date={formatEventDate(event)}
                                    time={formatEventTime(event)}
                                />
                            ))
                        ) : (
                            <p className="no-events-message">
                                {selectedDate ? "Nenhum evento para este dia." : "Selecione um dia para ver os eventos."}
                            </p>
                        )}
                    </div>
                </section>
            </div>
        </>
    );
}

export default MyCalendar;