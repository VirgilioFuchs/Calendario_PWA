import React, {useEffect, useMemo, useRef, useState} from 'react';
import {WEEK_DAYS, MONTH_NAMES, WEEK_DAYS_ABREVIATED, type CalendarEvent} from '../../../shared/types';
import {eventsApi} from '../../../shared/services/apiCache.ts';
import {EVENT_LEGEND} from '../../../shared/constants/eventLegend.ts';
import {useDragScroll} from '../../../shared/hooks/useDragScroll.ts';
import '../../../app/App.css';
import {
    getEventStyle,
    getEventRingColor,
    getDotColor,
    getUniqueTypesForDay,
    hasHoliday
} from '../../../shared/utils/eventHelpers.ts';
import {
    timeStringToDecimal,
    formatDecimalTime,
    getCalendarGridData,
    isToday,
    isWeekend,
    getDayOfWeekInGrid,
    parseLocalDate,
} from '../../../shared/utils/dateHelpers.ts';

interface DayViewProps {
    currentYear: number;
    currentMonthIdx: number;
    selectedDay: number;
    onBack: () => void;
    onEventClick: (event: CalendarEvent) => void;
    onDayChange?: (day: number, monthIdx: number, year: number) => void;
}

const HOUR_HEIGHT = 60;

//Campo de vizualização de dias
const DayViewLandscape: React.FC<DayViewProps> = ({
                                             currentYear,
                                             currentMonthIdx,
                                             selectedDay,
                                             onBack,
                                             onDayChange,
                                         }) => {
    const containerRef = useDragScroll<HTMLDivElement>(); // Hook para arrastar e rolar pelo mouse do computador
    const hours = useMemo(() => Array.from({length: 17}, (_, i) => i + 7), []);
    const headerDate = new Date(currentYear, currentMonthIdx, selectedDay);
    const dayTitle = `${WEEK_DAYS[headerDate.getDay()]}, ${selectedDay} de ${MONTH_NAMES[currentMonthIdx]} de ${currentYear}`;
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [monthEvents, setMonthEvents] = useState<CalendarEvent[]>([]);
    const [activeTab, setActiveTab] = useState<'legendas' | 'eventos' | 'dias'>('eventos');
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const eventRefs = useRef<Map<number, HTMLDivElement>>(new Map());
    const panelScrollRef = useRef<HTMLDivElement>(null);

    // Eventos dia inteiro
    const allDayEvents = useMemo(() =>
            events.filter(evt => evt.feriado_dia_inteiro),
        [events]
    );

    // Eventos com dia normal
    const timedEvents = useMemo(() =>
            events.filter(evt => !evt.feriado_dia_inteiro),
        [events]
    );

    // Eventos da timeline (do dia)
    useEffect(() => {
        const fetchDayEvents = async () => {
            try {
                console.log('Buscando eventos:', {currentYear, currentMonthIdx, selectedDay});
                const data = await eventsApi.getEventsByDay(currentYear, currentMonthIdx, selectedDay);
                console.log('Eventos retornados:', data);
                setEvents(data);
            } catch (error) {
                console.error('Erro ao carregar eventos:', error);
                setEvents([]);
            }
        };
        fetchDayEvents();
    }, [currentYear, currentMonthIdx, selectedDay]);

    // Eventos do mês inteiro da aba dias
    useEffect(() => {
        const fetchMonthEvents = async () => {
            try {
                const data = await eventsApi.getEventsByMonth(currentYear, currentMonthIdx);
                setMonthEvents(data);
            } catch (error) {
                console.error('Erro ao carregar eventos do mês:', error);
                setMonthEvents([]);
            }
        };
        fetchMonthEvents();
    }, [currentYear, currentMonthIdx]);

    useEffect(() => {
        if (panelScrollRef.current) {
            panelScrollRef.current.scrollTo({
                behavior: 'smooth'
            });
        }
    }, [activeTab]);

    const handleEventClickInternal = (evt: CalendarEvent) => {
        setSelectedEventId(evt.feriado_id);
        setActiveTab('eventos');

        setTimeout(() => {
            const eventElement = eventRefs.current.get(evt.feriado_id);
            if (eventElement) {
                eventElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'nearest'
                });
            }
            }, 100);
    };

    const sortedEvents = useMemo(() => {
        return [...events].sort((a, b) => {
            // Se ambos têm horário de início
            if (a.feriado_inicio && b.feriado_inicio) {
                const timeA = timeStringToDecimal(a.feriado_inicio);
                const timeB = timeStringToDecimal(b.feriado_inicio);
                return timeA - timeB;
            }

            // Eventos sem horário vão para o final
            if (!a.feriado_inicio) return 1;
            if (!b.feriado_inicio) return -1;

            return 0;
        });
    }, [events]);

    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 h-full relative z-50 max-w-[100vw]">
            {/* HEADER */}
            <div className="flex items-center justify-between px-4 py-2 border-b shrink-0 sticky top-0 z-20 backdrop-blur-sm
                bg-white/90 border-gray-200 hover:bg-gray-50
                dark:bg-zinc-950/80 dark:border-zinc-800 dark:hover:bg-zinc-900/40">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 p-2 rounded-full transition-colors text-gray-900 dark:text-zinc-100
                        hover:bg-gray-100 dark:hover:bg-zinc-900/50"
                >
                    {/* Botão voltar */}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                              strokeLinejoin="round"/>
                    </svg>
                    {/* Mês ao lado do voltar (Mês Atual) */}
                    <span className="text-base font-semibold leading-none pb-0.5">
                        {MONTH_NAMES[currentMonthIdx]}
                    </span>
                </button>

                <div className="text-base font-semibold text-gray-800 dark:text-zinc-100 absolute left-1/2 -translate-x-1/2">
                    {dayTitle}
                </div>

                {/* Lupa - desenvolver a pesquisa de eventos*/}
                <button className='p-2 -mr-2 dark:text-white text-black'>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         strokeWidth="2.5"
                         strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </button>
            </div>
            <div className="flex flex-row flex-1 overflow-hidden">
                <div
                    ref={containerRef}
                    className="overflow-y-auto relative cursor-grab active:cursor-grabbing select-none bg-white dark:bg-zinc-950 dark:accent-indigo-500 px-4
                    w-[60%] border-r border-gray-200 dark:border-zinc-800"
                >
                    <div className="relative pt-6 max-w-full overflow-hidden pb-0.5">
                        {allDayEvents.length > 0 && (
                            <div className="mb-4 -mt-2">
                                <div
                                    className="bg-gray-50 dark:bg-zinc-900 rounded-lg p-2 border border-gray-200 dark:border-zinc-800">
                                    <div className="flex items-center gap-2 flex-wrap">
                                         <span
                                             className="text-xs font-semibold text-gray-600 dark:text-zinc-400 shrink-0">
                                            Dia inteiro:
                                         </span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {allDayEvents.map((evt) => (
                                                <button
                                                    key={evt.feriado_id}
                                                    onClick={() => handleEventClickInternal(evt)}
                                                    className={`px-2 py-1 rounded text-xs font-medium cursor-pointer
                                                    hover:brightness-95 transition-all border-l-2
                                                    ${getEventStyle(evt.feriado_tipo)}
                                                    ${selectedEventId === evt.feriado_id ? `ring-1 ${getEventRingColor(evt.feriado_tipo)}` : ''}
                                                `}
                                                >
                                                    {evt.feriado_titulo}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Linhas de hora */}
                        {hours.map((hour) => (
                            <div
                                key={hour}
                                className="relative"
                                style={{height: `${HOUR_HEIGHT}px`}}
                            >
                                <div
                                    className="absolute top-0 right-0 border-t border-gray-100 dark:border-zinc-800"
                                    style={{left: '56px'}}
                                />
                                <span
                                    className="absolute left-0 text-xs font-medium text-gray-400 dark:text-zinc-500 bg-white dark:bg-zinc-950 pr-3"
                                    style={{top: '-8px'}}
                                >
                                {hour.toString().padStart(2, '0')}:00
                            </span>
                            </div>
                        ))}

                        {/* EVENTOS */}
                        {timedEvents.map(evt => {
                            const startHour = timeStringToDecimal(evt.feriado_inicio);
                            let duration = 1;

                            if (evt.feriado_inicio && evt.feriado_fim) {
                                const endHour = timeStringToDecimal(evt.feriado_fim);
                                duration = endHour - startHour;
                            } else if (evt.feriado_dia_inteiro) {
                                duration = 8;
                            }

                            const topPosition = (startHour - hours[0]) * HOUR_HEIGHT;
                            const eventHeight = duration * HOUR_HEIGHT;
                            const isShortEvent = duration <= 1;
                            const startTime = formatDecimalTime(startHour);
                            const endTime = formatDecimalTime(startHour + duration);

                            return (
                                <div
                                    key={evt.feriado_id}
                                    ref={(el) => {
                                        if (el) {
                                            eventRefs.current.set(evt.feriado_id, el);
                                        } else {
                                            eventRefs.current.delete(evt.feriado_id);
                                        }
                                    }}
                                    onClick={() => handleEventClickInternal(evt)}
                                    className={`absolute left-14 right-0 rounded-xl border-l-4 shadow-sm overflow-hidden cursor-pointer 
                                        hover:brightness-95 active:scale-[0.98] transition-transform z-10
                                        ${getEventStyle(evt.feriado_tipo)}
                                        ${selectedEventId === evt.feriado_id ? `ring-2 ${getEventRingColor(evt.feriado_tipo)} brightness-110` : ''}
                                        ${isShortEvent
                                        ? 'flex flex-row items-start justify-between p-2 px-3'
                                        : 'flex flex-col justify-start p-3'}
                                        `}
                                    style={{
                                        top: `${topPosition}px`,
                                        height: `${Math.max(eventHeight, 40)}px`,
                                    }}
                                >
                                    {isShortEvent ? (
                                        <>
                                            <div className="flex flex-col min-w-0 pr-2">
                                            <span className="font-bold text-sm leading-tight truncate">
                                                {evt.feriado_titulo}
                                            </span>
                                            </div>
                                            <div className="text-xs opacity-90 whitespace-nowrap font-medium shrink-0">
                                                {startTime}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                        <span className="font-bold text-base leading-tight truncate">
                                            {evt.feriado_titulo}
                                        </span>
                                            <div className="mt-1.5 text-xs opacity-80 flex items-center gap-1">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                                                     stroke="currentColor" strokeWidth="3">
                                                    <circle cx="12" cy="12" r="10"></circle>
                                                    <polyline points="12 6 12 12 16 14"></polyline>
                                                </svg>
                                                {startTime} - {endTime}
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
                {/* PAINEL DIREITO - 40% */}
                <div
                    className="w-[40%] flex flex-col overflow-hidden border-l border-gray-200 dark:border-zinc-700">
                    <div
                        ref={panelScrollRef}
                        className="flex-1 overflow-y-auto">
                        {/* Conteúdo scrollável */}
                        <div className="p-4">
                            {activeTab === 'legendas' ? (
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-800 dark:text-zinc-200 mb-3 text-center">
                                            Tipos de Eventos
                                        </h3>
                                    </div>
                                    <div className="space-y-2">
                                        {EVENT_LEGEND.map((item, idx) => (
                                            <div key={idx} className={`rounded-lg p-3 border-l-4 ${item.class}`}>
                                                <div className="font-medium text-sm">{item.label}</div>
                                                <div className="text-xs opacity-70 mt-1">
                                                    Cor padrão para eventos de {item.label.toLowerCase()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : activeTab === 'dias' ? (
                                <div className="space-y-3">
                                    <div>
                                        <h3 className="text-base font-semibold text-gray-800 dark:text-zinc-200 mb-1 text-center">
                                            {MONTH_NAMES[currentMonthIdx]}
                                        </h3>
                                    </div>

                                    {/* Grid compacto de dias */}
                                    <div className="bg-white dark:bg-zinc-900 rounded-xl p-2 border border-gray-200 dark:border-zinc-800">
                                        {/* Headers da Semana */}
                                        <div className="grid grid-cols-7 gap-0.5 mb-1 pb-0.5 border-b border-gray-200 dark:border-zinc-700">
                                            {WEEK_DAYS_ABREVIATED.map((day, i) => (
                                                <div
                                                    key={i}
                                                    className={`text-center text-[10px] font-medium pb-1
                                                            ${isWeekend(i)
                                                        ? 'text-gray-400 dark:text-zinc-500'
                                                        : 'text-gray-800 dark:text-zinc-400'
                                                    }`}
                                                >
                                                    {day}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Grid de dias */}
                                        <div className="grid grid-cols-7 gap-0.5">
                                            {(() => {
                                                const gridData = getCalendarGridData(currentYear, currentMonthIdx, 35);

                                                return (
                                                    <>
                                                        {/* Dias em branco antes do início do mês */}
                                                        {gridData.leadingBlanks.map(b => (
                                                            <div
                                                                key={`blank-start-${b}`}
                                                                className="aspect-square"
                                                            />
                                                        ))}

                                                        {/* Dias do mês */}
                                                        {gridData.days.map((day) => {
                                                            const dayOfWeek = getDayOfWeekInGrid(gridData.firstDayIdx, day);
                                                            const isDayWeekend = isWeekend(dayOfWeek)
                                                            const isSelected = day === selectedDay;
                                                            const isTodayDay = isToday(currentYear, currentMonthIdx, day);
                                                            const dayEvents = monthEvents.filter(evt => {
                                                                const eventDate = parseLocalDate(evt.feriado_data);
                                                                return eventDate.getDate() === day;
                                                            });
                                                            const dayHasFeriado = hasHoliday(dayEvents);
                                                            const uniqueTypes = getUniqueTypesForDay(dayEvents);

                                                            return (
                                                                <button
                                                                    key={day}
                                                                    onClick={() => onDayChange?.(day, currentMonthIdx, currentYear)}
                                                                    className={`
                                                                            aspect-square flex flex-col items-center justify-center transition-all duration-200 relative
                                                                            ${!isSelected ? 'active:scale-95' : ''}
                                                                        `}
                                                                >
                                                                    <div
                                                                        className={`
                                                                                flex items-center justify-center text-xs font-medium transition-all
                                                                                ${isSelected
                                                                            ? 'w-4 h-4 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold ring-2 ring-black dark:ring-white'
                                                                            : isTodayDay
                                                                                ? 'w-5 h-5 rounded-full bg-gray-200 text-gray-900 dark:bg-zinc-700  dark:text-zinc-100 ring-2 dark:ring-zinc-700 ring-gray-200 font-semibold'
                                                                                : dayHasFeriado
                                                                                    ? 'text-red-500 dark:text-red-400 font-semibold'
                                                                                    : isDayWeekend
                                                                                        ? 'text-gray-400 dark:text-zinc-500'
                                                                                        : 'text-gray-700 dark:text-zinc-300'
                                                                        }
                                                                            `}
                                                                    >
                                                                        {day}
                                                                    </div>
                                                                    {uniqueTypes.length > 0 && (
                                                                        <div className="flex gap-0.5 mt-0.5 justify-center absolute bottom-0.5">
                                                                            {uniqueTypes.slice(0, 3).map((type, idx) => (
                                                                                <div
                                                                                    key={idx}
                                                                                    className={`w-1 h-1 rounded-full ${getDotColor(type)}`}
                                                                                />
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </button>
                                                            );
                                                        })}

                                                        {/* Dias em branco após o final do mês */}
                                                        {gridData.trailingBlanks.map(b => (
                                                            <div
                                                                key={`blank-end-${b}`}
                                                                className="aspect-square"
                                                            />
                                                        ))}
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {selectedEventId ? (
                                        (() => {
                                            const selectedEvent = events.find(e => e.feriado_id === selectedEventId);
                                            if (!selectedEvent) return null;

                                            return (
                                                <div className="space-y-4">
                                                    <button
                                                        onClick={() => setSelectedEventId(null)}
                                                        className="flex items-center gap-2 text-sm text-gray-600 dark:text-white hover:text-gray-900 dark:hover:text-zinc-200 transition-colors"
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                                             stroke="currentColor" strokeWidth="2">
                                                            <path d="M15 19L8 12L15 5"/>
                                                        </svg>
                                                        Voltar
                                                    </button>

                                                    <div
                                                        className={`rounded-xl p-4 border-l-4 ${getEventStyle(selectedEvent.feriado_tipo)}`}>
                                                        <div className="space-y-3">
                                                            <div>
                                                                <h3 className="text-lg font-bold leading-tight">
                                                                    {selectedEvent.feriado_titulo}
                                                                </h3>
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                <svg width="16" height="16" viewBox="0 0 24 24"
                                                                     fill="none" stroke="currentColor"
                                                                     strokeWidth="2">
                                                                    <rect x="3" y="4" width="18" height="18" rx="2"
                                                                          ry="2"></rect>
                                                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                                                </svg>
                                                                <div>
                                                                    <div className="text-xs opacity-70">Tipo</div>
                                                                    <div
                                                                        className="text-sm font-medium">{selectedEvent.feriado_tipo}</div>
                                                                </div>
                                                            </div>

                                                            {selectedEvent.feriado_inicio && (
                                                                <div className="flex items-center gap-2">
                                                                    <svg width="16" height="16" viewBox="0 0 24 24"
                                                                         fill="none" stroke="currentColor"
                                                                         strokeWidth="2">
                                                                        <circle cx="12" cy="12" r="10"></circle>
                                                                        <polyline
                                                                            points="12 6 12 12 16 14"></polyline>
                                                                    </svg>
                                                                    <div>
                                                                        <div
                                                                            className="text-xs opacity-70">Horário
                                                                        </div>
                                                                        <div className="text-sm font-medium">
                                                                            {selectedEvent.feriado_inicio}
                                                                            {selectedEvent.feriado_fim && ` - ${selectedEvent.feriado_fim}`}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {selectedEvent.feriado_descricao && (
                                                                <div>
                                                                    <div
                                                                        className="text-xs opacity-70 mb-1">Descrição
                                                                    </div>
                                                                    <p className="text-sm leading-relaxed">
                                                                        {selectedEvent.feriado_descricao}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })()
                                    ) : (
                                        <>
                                            <h3 className="text-sm font-semibold text-gray-800 dark:text-zinc-200 text-center">
                                                Eventos do Dia
                                            </h3>

                                            {sortedEvents.length === 0 ? (
                                                <p className="text-xs text-gray-400 dark:text-zinc-500 text-center py-8">
                                                    Nenhum evento neste dia
                                                </p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {sortedEvents.map((evt) => (
                                                        <div
                                                            key={evt.feriado_id}
                                                            onClick={() => handleEventClickInternal(evt)}
                                                            className={`rounded-lg p-2.5 cursor-pointer hover:brightness-95 transition-all border-l-4
                                                                    ${getEventStyle(evt.feriado_tipo)}
                                                                    ${selectedEventId === evt.feriado_id ? `ring-2 ${getEventRingColor(evt.feriado_tipo)}` : ''}
                                                                    `}
                                                        >
                                                            <div
                                                                className="font-medium text-sm">{evt.feriado_titulo}</div>
                                                            <div className="text-xs opacity-70 mt-1">
                                                                {evt.feriado_dia_inteiro ? (
                                                                    'Dia Inteiro'
                                                                ) : evt.feriado_inicio ? (
                                                                    <>
                                                                        {formatDecimalTime(timeStringToDecimal(evt.feriado_inicio))}
                                                                        {evt.feriado_fim && ` - ${formatDecimalTime(timeStringToDecimal(evt.feriado_fim))}`}
                                                                    </>
                                                                ) : null}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Navigation Bottom */}
                    <div className="px-6 pb-1.5 pt-2">
                        <div
                            className="bg-white dark:bg-zinc-800 rounded-md shadow-sm border border-gray-200 dark:border-zinc-700 overflow-hidden">
                            <div className="flex">
                                <button
                                    onClick={() => setActiveTab('legendas')}
                                    className={`flex-1 py-1.5 text-xs font-medium transition-colors border-r border-gray-200 dark:border-zinc-700
                                            ${activeTab === 'legendas'
                                        ? 'bg-black text-white dark:bg-white dark:text-black font-bold shadow-md'
                                        : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-700/50'
                                    }`}
                                >
                                    Legendas
                                </button>
                                <button
                                    onClick={() => setActiveTab('eventos')}
                                    className={`flex-1 py-1.5 text-xs font-medium transition-colors
                                            ${activeTab === 'eventos'
                                        ? 'bg-black text-white dark:bg-white dark:text-black font-bold shadow-md'
                                        : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-700/50'
                                    }`}
                                >
                                    Eventos
                                </button>
                                <button
                                    onClick={() => setActiveTab('dias')}
                                    className={`flex-1 py-1.5 text-xs font-medium transition-colors
                                            ${activeTab === 'dias'
                                        ? 'bg-black text-white dark:bg-white dark:text-black font-bold shadow-md'
                                        : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-700/50'
                                    }`}
                                >
                                    Dias
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DayViewLandscape;