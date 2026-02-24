import React, {useEffect, useState, useRef, useMemo} from 'react';
import {WEEK_DAYS_ABREVIATED, MONTH_NAMES, type CalendarEvent} from '../../../shared/types';
import {eventsApi} from '../../../shared/services/apiCache.ts';
import {
    getCalendarGridData,
    isToday,
    getDayOfWeekInGrid,
    isWeekend,
    parseLocalDate, formatTimeString, timeStringToDecimal
} from '../../../shared/utils/dateHelpers.ts';
import {
    getDotColor,
    normalizeEventType,
    isDateMarkerType,
    getEventStyle
} from '../../../shared/utils/eventHelpers.ts';
import EventCapsule from "../../event/components/EventDots.tsx";
import {EVENT_LEGEND} from "../../../shared/constants/eventLegend.ts";
import LoadingOverlay from "../../../components/common/LoadingOverlay.tsx";
import ErrorBox from "../../../components/common/ErrorBox.tsx";
import {withTimeout} from "../../../shared/utils/withTimeout.tsx";

interface MonthDetailProps {
    year: number;
    monthIdx: number;
    selectedDay: number;
    onBack: () => void;
    onDayClick: (monthIdx: number, day: number, react?: DOMRect) => void;
    onEventClick?: (event: CalendarEvent, monthIdx: number, day: number) => void;
}

type EventsByMonthAndDay = {
    [month: number]: {
        [day: number]: CalendarEvent[];
    };
};

type FetchStatus = 'loading ' | 'error' | 'timeout' | 'idle';

const MonthViewLandscape: React.FC<MonthDetailProps> = ({
                                                            year,
                                                            monthIdx,
                                                            onBack,
                                                            onDayClick,
                                                            selectedDay,
                                                            onEventClick,
}) => {
    // Estado para o título fixo (Scroll Spy)
    const [visibleMonthIdx, setVisibleMonthIdx] = useState(monthIdx);
    const months = Array.from({length: 12}, (_, i) => i);
    const [yearEvents, setYearEvents] = useState<CalendarEvent[]>([]);
    const [selectedClickedDay, setSelectedClickedDay] = useState<number | null>(selectedDay);
    const [selectedClickedMonthIdx, setSelectedClickedMonthIdx] = useState<number>(monthIdx);
    const [activeTab, setActiveTab] = useState<'legendas' | 'eventos' | 'dia'>('eventos');
    const containerRef = useRef<HTMLDivElement | null>(null);
    const isInitialScroll = useRef(true);
    const [status, setStatus] = useState<FetchStatus>('loading ')
    const [retryKey, setRetryKey] = useState(0);

    useEffect(() => {
        let cancelled = false;

        const fetchYearEvents = async () => {
            setStatus('loading ');
            try {
                const allPromises = Array.from({ length: 12 }, (_, i) =>
                    eventsApi.getEventsByMonth(year, i)
                );

                // Promise.all envolto no timeout de 15s
                const allData = await withTimeout(Promise.all(allPromises), 15_000);

                if (!cancelled) {
                    setYearEvents(allData.flat());
                    setStatus('idle');
                }
            } catch (err) {
                if (!cancelled) {
                    const isTimeout = err instanceof Error && err.message === 'TIMEOUT';
                    setStatus(isTimeout ? 'timeout' : 'error');
                    setYearEvents([]);
                }
            }
        };

        fetchYearEvents();
    }, [year, retryKey]);

    // Agrupar eventos por dia
    const eventsByMonthAndDay = useMemo(() => {
        const grouped: EventsByMonthAndDay = {};
        yearEvents.forEach((evt) => {
            const eventDate = parseLocalDate(evt.feriado_data);
            const month = eventDate.getMonth();
            const day = eventDate.getDate();

            if (!grouped[month]) {
                grouped[month] = {};
            }

            if (!grouped[month][day]) {
                grouped[month][day] = [];
            }

            grouped[month][day].push(evt);
        });
        return grouped;
    }, [yearEvents]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    const idx = Number(
                        (entry.target as HTMLElement).dataset.monthIndex
                    );
                    if (!Number.isNaN(idx)) {
                        setVisibleMonthIdx(idx);
                    }
                });
            },
            {
                root: container,
                rootMargin: '-40% 0px -40% 0px',
                threshold: 0,
            }
        );

        const sections = container.querySelectorAll<HTMLElement>('.month-grid-section');
        sections.forEach((section) => observer.observe(section));

        return () => observer.disconnect();
    }, []);


    // Scroll inicial para o mês selecionado
    useEffect(() => {
        setVisibleMonthIdx(monthIdx);
        isInitialScroll.current = true;

        const timeoutId = setTimeout(() => {
            const section = document.getElementById(`month-detail-section-${monthIdx}`);
            if (section && containerRef.current) {
                containerRef.current.scrollTop = section.offsetTop;
                setTimeout(() => {
                    isInitialScroll.current = false;
                }, 100);
            }
        }, 50);

        return () => clearTimeout(timeoutId)
    }, [containerRef, monthIdx]);

    useEffect(() => {
        containerRef.current?.scrollTo({top: 0, behavior: 'smooth'});
    }, [activeTab]);

    // Ordena eventos do dia pelo horário
    const sortedDayEvents = useMemo(() => {
        if (selectedClickedDay === null) return [];
        const events = eventsByMonthAndDay[selectedClickedMonthIdx]?.[selectedClickedDay] || [];
        return [...events].sort((a, b) => {
            if (a.feriado_inicio && b.feriado_inicio) {
                return timeStringToDecimal(a.feriado_inicio) - timeStringToDecimal(b.feriado_inicio);
            }
            if (!a.feriado_inicio) return 1;
            if (!b.feriado_inicio) return -1;
            return 0;
        });
    }, [eventsByMonthAndDay, selectedClickedDay, selectedClickedMonthIdx]);

    // Na troca do mês, o index vai para o dia 1
    useEffect(() => {
        if (isInitialScroll.current) return;
        setSelectedClickedDay(1);
        setSelectedClickedMonthIdx(visibleMonthIdx);
    }, [visibleMonthIdx]);

    const handleDayClick = (_e: React.MouseEvent, mIdx: number, d: number) => {
        setSelectedClickedDay(d);
        setSelectedClickedMonthIdx(mIdx);
        setActiveTab('dia');
    };

    const handleEventClick = (evt: CalendarEvent) => {
        const eventDate = parseLocalDate(evt.feriado_data);
        const evtDay = eventDate.getDate();
        const evtMonth = eventDate.getMonth();

        onEventClick?.(evt, evtMonth, evtDay);
    };

    const handleRetry    = () => setRetryKey(k => k + 1);
    const handleContinue = () => setStatus('idle');

    return (
        <div className="relative flex flex-col h-full bg-white dark:bg-zinc-950/95">

            {/* Tela de carregamento */}
            <LoadingOverlay isLoading={status === 'loading '} />

            {(status === 'error' || status === 'timeout') && (
                <ErrorBox
                    isTimeout={status === 'timeout'}
                    onRetry={handleRetry}
                    onContinue={handleContinue}
                />
            )}

            {/* HEADER FIXO*/}
            <div
                className="z-30 shadow-sm relative transition-all duration-300
                bg-white/95 backdrop-blur-sm border-b border-gray-300
                dark:bg-zinc-950/95 dark:border-zinc-800">
                <div className="flex items-center justify-between px-4 py-2">
                    <button onClick={onBack}
                            className="flex items-center gap-1 hover:opacity-70 transition-opacity text-black dark:text-white">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 19L8 12L15 5"/>
                        </svg>
                        <span className="text-base font-semibold leading-none pb-0.5">{year}</span>
                    </button>

                    {/* Desenvolver a pesquisa de eventos da LUPA */}
                    <button
                        className="p-2 -mr-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-black dark:text-white">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </button>
                </div>
            </div>

            {/* LAYOUT 50/50 */}
            <div className="flex flex-1 overflow-hidden">
                {/* LADO ESQUERDO - 50% */}
                <div className="w-1/2 flex flex-col border-r border-gray-200 dark:border-zinc-800">
                    {/* Dias da Semana */}
                    <div
                        className="flex-shrink-0 grid grid-cols-7 bg-gray-100 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800">
                        {WEEK_DAYS_ABREVIATED.map((d, idx) => (
                            <div
                                key={idx}
                                className="text-center py-0.5 text-[0.6rem] font-semibold text-gray-600 dark:text-zinc-400"
                            >
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* ÁREA DE ROLAGEM DOS MESES */}
                    <div
                        ref={containerRef}
                        className="flex-1 overflow-y-auto bg-white dark:bg-zinc-950"
                        style={{
                            scrollSnapType: 'y mandatory',
                            WebkitOverflowScrolling: 'touch',
                            overscrollBehavior: 'contain',
                        }}
                    >
                        {months.map((mIdx) => {
                            const gridData = getCalendarGridData(year, mIdx);
                            const isDecember = mIdx === 11;

                            return (
                                <div
                                    key={mIdx}
                                    id={`month-detail-section-${mIdx}`}
                                    data-month-index={mIdx}
                                    className="month-grid-section"
                                    style={{
                                        scrollSnapAlign: 'start',
                                        scrollSnapStop: 'always',
                                        minHeight: '100%'
                                    }}
                                >
                                    <div
                                        className={`grid grid-cols-7 ${!isDecember ? 'border-b-4 border-gray-300 dark:border-zinc-800' : ''}`}>
                                        {gridData.leadingBlanks.map((b) => (
                                            <div
                                                key={`blank-${b}`}
                                                className="min-h-[4rem] border-t border-gray-100 dark:border-zinc-800 bg-gray-50/30 dark:bg-zinc-900/20"
                                            />
                                        ))}

                                        {/* Dias */}
                                        {gridData.days.map((d) => {
                                            const dayOfWeek = getDayOfWeekInGrid(gridData.firstDayIdx, d);
                                            const isDayWeekend = isWeekend(dayOfWeek);
                                            const isTodayDay = isToday(year, mIdx, d);
                                            const isSelected = d === selectedClickedDay && mIdx === selectedClickedMonthIdx;
                                            const allEvents = eventsByMonthAndDay[mIdx]?.[d] || [];
                                            const feriados = allEvents.filter(e => normalizeEventType(e.feriado_tipo) === 'feriado');
                                            const ferias = allEvents.filter(e => normalizeEventType(e.feriado_tipo) === 'férias');
                                            const dotEvents = allEvents.filter(e => !isDateMarkerType(e.feriado_tipo));
                                            const dayNumberColorClass = feriados.length > 0
                                                ? 'text-red-500 dark:text-red-400 font-semibold'
                                                : ferias.length > 0
                                                    ? 'text-green-500 dark:text-green-400 font-semibold'
                                                    : isDayWeekend
                                                        ? 'text-gray-300 dark:text-zinc-600'
                                                        : 'text-gray-900 dark:text-zinc-300';
                                            const overflowEvents = dotEvents.slice(4)


                                            return (
                                                <div
                                                    key={d}
                                                    onClick={(e) => handleDayClick(e, mIdx, d)}
                                                    className={`min-h-[4.2rem] flex flex-col items-center justify-start px-1 pt-2 border-t relative transition-colors cursor-pointer active:scale-[0.98]
                                                        border-gray-100 dark:border-zinc-800
                                                        hover:bg-gray-50 dark:hover:bg-zinc-900
                                                        ${isDayWeekend ? 'bg-gray-50/50 dark:bg-zinc-900/30' : 'bg-white dark:bg-zinc-950'}`}
                                                >
                                                    {/*Destaque do dia de hoje*/}
                                                    <div
                                                        className={`
                                                            flex items-center justify-center text-xs font-medium transition-all h-6 w-6 rounded-full duration-200
                                                            ${isSelected
                                                            ? 'bg-black text-white dark:bg-white dark:text-black font-bold'
                                                            : isTodayDay
                                                            ? ' bg-gray-200 text-gray-900 border border-gray-300 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700'
                                                            : dayNumberColorClass
                                                        }
                                                        `}
                                                    >
                                                        {d}
                                                    </div>

                                                    <div className="flex flex-col items-center gap-[3px] w-full pt-3">

                                                        {[...feriados, ...ferias].length > 0 && dotEvents.length === 0 && (
                                                            [...feriados, ...ferias].map((evt, i) => (
                                                                <span
                                                                    key={`marker-${i}`}
                                                                    className={`inline-block shrink-0 rounded-full ${getDotColor(evt.feriado_tipo)}`}
                                                                    style={{width: 7, height: 7}}
                                                                    title={evt.feriado_titulo ?? evt.feriado_tipo}
                                                                />
                                                            ))
                                                        )}

                                                        {/* Cápsula elástica */}
                                                        {dotEvents.length > 0 && (
                                                            <EventCapsule events={dotEvents}/>
                                                        )}

                                                        <div className="flex flex-col py-1">
                                                            {/* Overflow */}
                                                            {overflowEvents.length > 0 && (
                                                                <span
                                                                    className="text-[9px] font-semibold text-gray-400 dark:text-zinc-500 leading-none">
                                                                    +{overflowEvents.length}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/*  LADO DIREITO - 50% */}
                <div
                    className="w-1/2 flex flex-col h-full overflow-hidden border-l border-gray-200 dark:border-zinc-950">

                    {/* Header fixo */}
                    <div
                        className="shrink-0 px-6 py-2 border-b border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-950">
                        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white tracking-tight transition-all duration-300">
                            {MONTH_NAMES[visibleMonthIdx]}
                        </h1>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3">
                        {activeTab === 'eventos' ? (
                            <div
                                className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-4 py-3 bg-gray-50 dark:bg-zinc-950">
                                {Object.entries(eventsByMonthAndDay[visibleMonthIdx] || {})
                                    .sort(([a], [b]) => Number(a) - Number(b))
                                    .map(([day, events]) => {
                                        const date = new Date(year, visibleMonthIdx, Number(day));
                                        const weekDay = date.toLocaleDateString('pt-BR', {weekday: 'long'}).toUpperCase();

                                        return (
                                            <div key={day} className="flex flex-col gap-2 px-4">

                                                {/* Cabeçalho do dia */}
                                                <div className="flex items-center gap-2">
                                            <span
                                                className="text-xs font-bold text-gray-900 dark:text-white tracking-wide">
                                                {weekDay} — Dia {String(day).padStart(2, '0')}
                                            </span>
                                                    <div className="flex-1 h-px bg-gray-200 dark:bg-zinc-500"/>
                                                </div>

                                                {/* Cards */}
                                                {events.map((evt) => {
                                                    const type = normalizeEventType(evt.feriado_tipo);
                                                    const isDayLong = !evt.feriado_inicio && !evt.feriado_fim;

                                                    return (
                                                        <div
                                                            key={evt.feriado_id}
                                                            onClick={() => handleEventClick(evt)}
                                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg ${getEventStyle(type)}`}
                                                        >
                                                            {isDayLong ? (
                                                                <>
                                                            <span
                                                                className={`text-xs font-bold uppercase tracking-wide`}>
                                                                {evt.feriado_tipo?.toUpperCase() ?? 'EVENTO'}
                                                            </span>
                                                                    <span
                                                                        className="text-xs font-semibold  uppercase tracking-wide">
                                                                DIA INTEIRO
                                                            </span>
                                                                </>
                                                            ) : (
                                                                <>
                                                            <span
                                                                className={`text-xs font-bold uppercase tracking-wide`}>
                                                                {evt.feriado_tipo?.toUpperCase() ?? 'EVENTO'}
                                                            </span>
                                                                    <div className="flex flex-col items-end gap-0.5">
                                                                <span className="text-xs font-semibold">
                                                                    {formatTimeString(evt.feriado_inicio)}
                                                                </span>
                                                                        <span className="text-xs opacity-60">
                                                                    {formatTimeString(evt.feriado_fim)}
                                                                </span>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })}

                                {/* Estado vazio */}
                                {Object.keys(eventsByMonthAndDay[visibleMonthIdx] || {}).length === 0 && (
                                    <div className="flex-1 flex items-center justify-center">
                                <span className="text-xs text-gray-400 dark:text-zinc-600 uppercase tracking-widest">
                                    Nenhum evento
                                </span>
                                    </div>
                                )}
                            </div>
                        ) : activeTab === 'dia' ? (
                            <div className="flex flex-col gap-2">

                                {/* Título do dia selecionado */}
                                {selectedClickedDay !== null && (
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wide">
                                            {new Date(year, selectedClickedMonthIdx, selectedClickedDay)
                                                .toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                                        </p>

                                        <button
                                            onClick={() => onDayClick?.(selectedClickedMonthIdx, selectedClickedDay)}
                                            className="text-xs font-bold text-black dark:text-white shrink-0 ml-2"
                                        >
                                            Ir para o dia
                                        </button>
                                    </div>
                                )}

                                {/* Lista de eventos */}
                                {sortedDayEvents.length === 0 ? (
                                    <p className="text-sm text-gray-400 dark:text-zinc-500 text-center mt-8">
                                        Nenhum evento neste dia
                                    </p>
                                ) : (
                                    sortedDayEvents.map((evt) => {
                                        const isDayLong = !evt.feriado_inicio && !evt.feriado_fim;
                                        return (
                                            <div
                                                key={evt.feriado_id}
                                                onClick={() => handleEventClick(evt)}
                                                className={`rounded-lg p-2.5 border-l-4 ${getEventStyle(evt.feriado_tipo)}`}
                                            >
                                                <p className="text-xs font-semibold leading-snug">{evt.feriado_titulo}</p>
                                                {isDayLong ? (
                                                    <p className="text-xs opacity-60 mt-0.5">Dia Inteiro</p>
                                                ) : evt.feriado_inicio ? (
                                                    <p className="text-xs opacity-60 mt-0.5">
                                                        {formatTimeString(evt.feriado_inicio)}
                                                        {evt.feriado_fim && ` - ${formatTimeString(evt.feriado_fim)}`}
                                                    </p>
                                                ) : null}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        ) : (
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
                        )}
                    </div>
                    {/*Navigation Bottom*/}
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
                                    onClick={() => setActiveTab('dia')}
                                    className={`flex-1 py-1.5 text-xs font-medium transition-colors
                                            ${activeTab === 'dia'
                                        ? 'bg-black text-white dark:bg-white dark:text-black font-bold shadow-md'
                                        : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-700/50'
                                    }`}
                                >
                                    Dia
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MonthViewLandscape;
