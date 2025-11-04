import {useEffect, useState} from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, {type DateClickArg} from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import './App.css';
import {EventImageText} from "./components/EventImageText.tsx";

interface MyEvent {
    title: string;
    start: string;
    allDay: boolean;
}

function App() {
    const [events] = useState<MyEvent[]>([
        {title: 'Ir trabalhar!', start: '2025-11-04T09:00:00', allDay: false},
        {title: 'Ir trabalhar!', start: '2025-11-04T09:00:00', allDay: false},
        {title: 'Ir trabalhar!', start: '2025-11-04T09:00:00', allDay: false},
        {title: 'Ir trabalhar!', start: '2025-11-04T09:00:00', allDay: false},
        {title: 'Encontrar amigos!', start: '2025-11-03T19:30:00', allDay: false},
    ]);
    const [selectedDayEvents, setSelectedDayEvents] = useState<MyEvent[]>([]);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const handleDateClick = (info: DateClickArg) => {
        document.querySelectorAll('.fc-day').forEach(day => {
            day.classList.remove('fc-day-selected');
        });

        info.dayEl.classList.add('fc-day-selected');
        setSelectedDate(info.dateStr);

        const eventsOnThisDay = events.filter(event => {
            return event.start.split('T')[0] === info.dateStr;
        });

        setSelectedDayEvents(eventsOnThisDay);
    };

    useEffect(() => {
        setSelectedDayEvents(events);
    }, [events]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const calendarEl = document.querySelector('.fc');
            if (calendarEl && !calendarEl.contains(event.target as Node)) {
                document.querySelectorAll('.fc-day').forEach(day => {
                    day.classList.remove('fc-day-selected');
                });
                setSelectedDate(null);
                setSelectedDayEvents(events);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        };
    }, [events])

    const formatEventTime = (event: MyEvent) => {
        const startDate = new Date(event.start);

        if (event.allDay) {
            return 'Dia inteiro';
        }

        const timeOptions: Intl.DateTimeFormatOptions = {hour: '2-digit', minute: '2-digit'};
        const startTime = startDate.toLocaleTimeString('pt-BR', timeOptions);

        return startTime;
    };

    const formatEventDate = (event: MyEvent) => {
        const startDate = new Date(event.start);
        const dateOptions: Intl.DateTimeFormatOptions = {day: '2-digit', month: '2-digit', year: 'numeric'};
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
        <div className="App">
            <header>
                <h1>Meu Calendário PWA</h1>
            </header>

            <div className="content-wrapper">
                <main>
                    <FullCalendar
                        plugins={[dayGridPlugin, interactionPlugin]}
                        locale={ptBrLocale}
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
    )
}

export default App