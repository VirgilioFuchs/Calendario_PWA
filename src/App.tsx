import { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin, { type DateClickArg } from '@fullcalendar/interaction'
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import './App.css'
import EventModal from './components/EventModal';
import { type DayCellMountArg } from '@fullcalendar/core'

// Define o tipo de um Evento (igual a antes)
interface MyEvent {
    title: string;
    start: string;
    allDay: boolean;
}

function App() {
    const [events, setEvents] = useState<MyEvent[]>([
        { title: 'Ir trabalhar!', start: '2025-10-31', allDay: true },
        { title: 'Encontrar amigos!', start: '2025-10-31', allDay: true },
    ]);
    const [selectedDayEvents, setSelectedDayEvents] = useState<MyEvent[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);


    /**
     * 1. Função handleDateClick (SIMPLIFICADA)
     * Agora APENAS seleciona a data e filtra a lista.
     */
    const handleDateClick = (arg: DateClickArg) => {

        // 1. Guarda a data que o utilizador clicou
        setSelectedDate(arg.dateStr);

        // 2. Filtra a lista principal de eventos
        const eventsOnThisDay = events.filter(event => {
            return event.start.split('T')[0] === arg.dateStr;
        });

        // 3. Atualiza o estado dos eventos selecionados
        setSelectedDayEvents(eventsOnThisDay);

        // NÃO ABRE MAIS O MODAL
    }

    /**
     * 2. NOVA função para ser chamada pelo BOTÃO
     */
    const openAddEventModal = () => {
        // Só abre o modal se o utilizador já tiver clicado num dia
        if (selectedDate) {
            setIsModalOpen(true);
        } else {
            // (Opcional) Poderíamos dar um alerta, mas o botão desabilitado é melhor
            alert("Por favor, selecione um dia no calendário primeiro.");
        }
    }

    /**
     * 3. Função handleAddNewEvent (vinda do modal)
     * Esta função continua EXATAMENTE IGUAL a antes.
     * Ela funciona perfeitamente pois lê o 'selectedDate' do estado.
     */
    const handleAddNewEvent = (title: string) => {
        if (!selectedDate) return;

        const newEvent = {
            title: title,
            start: selectedDate,
            allDay: true
        };

        const updatedEvents = [...events, newEvent];
        setEvents(updatedEvents);

        const eventsOnThisDay = updatedEvents.filter(event => {
            return event.start.split('T')[0] === selectedDate;
        });
        setSelectedDayEvents(eventsOnThisDay);

        setIsModalOpen(false);
    }

    const handleDayCellMount = (arg: DayCellMountArg) => {
        if (arg.dateStr === selectedDate) {
            arg.el.classList.add('fc-day-active');
        } else {
            // Se NÃO é a selecionada, remove a classe
            // (Isto é importante para "limpar" a bola laranja do dia anterior)
            arg.el.classList.remove('fc-day-active');
        }
    }

    // O JSX (return) fica quase igual
    return (
        <div className="App">
            <header>
                <h1>Meu Calendário PWA</h1>
            </header>

            <div className="content-wrapper">

                {/* Coluna 1: O Calendário (igual) */}
                <main>
                    <FullCalendar
                        plugins={[dayGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        locale={ptBrLocale}
                        height="auto"
                        eventDisplay="dot" // Garante que só mostra o ponto
                        weekends={true}
                        events={events}
                        selectable={true}
                        dateClick={handleDateClick} // Agora chama a função modificada
                        dayCellDidMount={handleDayCellMount}
                        headerToolbar={{
                            left: '',
                            center: 'title',
                            right: 'prev,next'
                        }}
                    />
                </main>

                {/* Coluna 2: A Lista de Eventos (MODIFICADA) */}
                <section className="event-list-container">

                    {/* --- NOVO HEADER PARA A LISTA --- */}
                    <div className="event-list-header">
                        <h3>Eventos do dia</h3>
                        <button
                            className="open-modal-btn"
                            onClick={openAddEventModal}
                            disabled={!selectedDate} /* Desabilitado se nenhum dia for selecionado */
                        >
                            + Adicionar Evento
                        </button>
                    </div>

                    {/* O resto da lista continua igual */}
                    <div className="event-list">
                        {selectedDayEvents.length > 0 ? (
                            selectedDayEvents.map((event, index) => (
                                <div key={index} className="event-item">
                                    <span className="event-title">{event.title}</span>
                                </div>
                            ))
                        ) : (
                            // Mensagem se não houver eventos (ou nenhum dia selecionado)
                            <p className="no-events-message">
                                {selectedDate ? "Nenhum evento para este dia." : "Selecione um dia para ver os eventos."}
                            </p>
                        )}
                    </div>
                </section>

            </div>

            {/* --- 5. Renderiza o Modal (ele está escondido por defeito) --- */}
            <EventModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAddEvent={handleAddNewEvent}
            />

        </div>
    )
}

export default App