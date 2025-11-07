import React, {useEffect, useState, useRef } from "react";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, {type DateClickArg} from "@fullcalendar/interaction";
import ptbrLocale from '@fullcalendar/core/locales/pt-br';
import {EventImageText} from "./EventImageText.tsx";
import styles from './MyCalendar.module.css';

interface MyEvent {
    title: string;
    start: string;
    allDay: boolean;
}

const MyCalendar: React.FC = () => {
    const [events] = useState<MyEvent[]>([
        {title: 'Ir trabalhar!', start: '2025-11-04T09:00:00', allDay: false},
        {title: 'Ir trabalhar!', start: '2025-11-05T10:00:00', allDay: false},
        {title: 'Ir trabalhar!', start: '2025-11-06T09:30:00', allDay: false},
        {title: 'Encontrar Amigos!', start: '2025-11-07T14:45:00', allDay: false},
        {title: 'Encontrar Amigos!', start: '2025-11-07', allDay: true},
    ]);
    const [selectedDayEvents, setSelectedDayEvents] = useState<MyEvent[]>([]);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const calendarWrapperRef = useRef<HTMLDivElement>(null);

    const handleDateClick = (info: DateClickArg) => {
        document.querySelectorAll('.fc-day').forEach(day => {
            day.classList.remove('fc-day-selected');
        });

        info.dayEl.classList.add('fc-day-selected');

        const eventsOnThisDay = events.filter(event => {
            return event.start.split('T')[0] === info.dateStr;
        });
        setSelectedDayEvents((eventsOnThisDay))
        calendarWrapperRef.current?.classList.add('selection-active');
    };

    useEffect(() => {
        setSelectedDayEvents(events);
    }, [events]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const calendarElement = calendarWrapperRef.current;
            if (calendarElement && !calendarElement.contains(event.target as Node)) {
                document.querySelectorAll('.fc-day').forEach(day => {
                    day.classList.remove('fc-day-selected');
                    calendarWrapperRef.current?.classList.remove('selection-active');
                });
                setSelectedDate(null);
                setSelectedDayEvents(events);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        };
    }, [events]);

    const formatEventTime = (event: MyEvent) => {
        const startDate = new Date(event.start)

        if (event.allDay) {
            return 'Dia Inteiro';
        }

        const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
        const startTime = startDate.toLocaleTimeString('pt-BR', timeOptions);

        return startTime;
    };

    const formatEventDate = (event: MyEvent) => {
        const startDate = new Date(event.start);
        const dateOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return startDate.toLocaleDateString('pt-BR', dateOptions);
    };

    const renderEventContent = () => {
        return (
            <div
                style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: '#0097e6',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <img
                    src="/star-icon.png"
                    alt="evento"
                    style={{
                        width: '12px',
                        height: '12px',
                        display: 'block'
                    }}
                />
            </div>
        );
    };

    return (
        <div className="my-calendar-wrapper" ref={calendarWrapperRef}>
            <header>
                <h1>Calendário Anglo</h1>
            </header>

            <div className="content-wrapper">
                <main className={styles.calendarContainer}>
                    <FullCalendar
                        plugins={[dayGridPlugin, interactionPlugin]}
                        locale={ptbrLocale}
                        initialView="dayGridMonth"
                        height="auto"
                        eventDisplay="list-item"
                        weekends={true}
                        events={events}
                        selectable={true}
                        dateClick={handleDateClick}
                        eventContent={renderEventContent}
                        headerToolbar={{
                            left: 'prev',
                            center: 'title',
                            right: 'next'
                        }}
                    />
                </main>

                <section className="event-list-container">
                    <div className="event-list-header">
                        <h3>Eventos do dia</h3>
                    </div>

                    <div className="event-list">
                        {selectedDayEvents.length > 0 ? (
                            selectedDayEvents.map((event, index) => (
                                <EventImageText
                                    key={event.start + index}
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
        </div>
    );
};

export default MyCalendar;