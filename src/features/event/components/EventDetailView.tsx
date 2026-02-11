import React from 'react';
import {type CalendarEvent, MONTH_NAMES, WEEK_DAYS } from '../../../shared/types';
import { getEventStyle } from '../../../shared/utils/eventHelpers.ts';
import {
    timeStringToDecimal,
    formatTimeString,
    parseLocalDate
} from '../../../shared/utils/dateHelpers.ts';

interface EventDetailViewProps {
    event: CalendarEvent;
    currentMonthIdx: number;
    previousView: 'month_detail' | 'day_detail';
    onBack: () => void;
}

const HOUR_HEIGHT = 80;
const MIN_EVENT_HEIGHT = 50;

const EventDetailView: React.FC<EventDetailViewProps> = ({
                                                             event,
                                                             previousView,
                                                             onBack,
                                                             currentMonthIdx
}) => {

    // Formatação de Data
    const eventDate = parseLocalDate(event.feriado_data);
    const dayOfWeek = WEEK_DAYS[eventDate.getDay()];
    const dayNumber = eventDate.getDate();
    const monthName = MONTH_NAMES[eventDate.getMonth()].toLowerCase().substring(0, 3);
    const yearNumber = eventDate.getFullYear();
    const fullDate = `${dayNumber} de ${monthName} de ${yearNumber}`;

    const startHour = timeStringToDecimal(event.feriado_inicio);
    const endHour = timeStringToDecimal(event.feriado_fim);
    const duration = event.feriado_fim ? endHour - startHour : 1;

    const startTime = formatTimeString(event.feriado_inicio);
    const endTime = formatTimeString(event.feriado_fim);

    // Lógica da Mini Timeline (Janela de 5 horas)
    const startViewHour = Math.max(0, Math.min(19, Math.floor(startHour) - 1));
    const timeSlots = Array.from({ length: Math.ceil(duration) + 3 }, (_, i) => startViewHour + i);

    const backButtonText = previousView === 'month_detail'
        ? MONTH_NAMES[currentMonthIdx]
        : 'Voltar';

    // Estilo do Card do Evento na Timeline
    const getEventCardStyles = () => {
        const relativeStartHour = startHour - startViewHour;

        return {
            top: `${relativeStartHour * HOUR_HEIGHT}px`,
            height: `${Math.max(duration * HOUR_HEIGHT, MIN_EVENT_HEIGHT)}px`
        };
    };

    const isShortEvent = duration <= 1;
    const isDayLongEvent = event.feriado_dia_inteiro;

    return (
        <div className="flex-1 flex flex-col bg-white dark:bg-zinc-950 h-full z-50 overflow-y-auto">
            <div className="sticky top-0 backdrop-blur-sm px-4 py-3 z-30 flex items-center
                bg-white/95 border-b border-gray-100
                dark:bg-zinc-950/95 dark:border-zinc-800">
                <button onClick={onBack} className="flex items-center gap-1 hover:opacity-70 transition-opacity text-black dark:text-white">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6"/>
                    </svg>
                    <span className="text-base font-semibold pb-0.5">
                        {backButtonText}
                    </span>
                </button>
            </div>

            <div className="p-6">
                {/* Data e Dia */}
                <div className="mb-6">
                    <h2 className="text-sm font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                        {dayOfWeek}
                    </h2>
                    <h1 className="text-3xl font-extrabold text-black dark:text-white tracking-tight">
                        {fullDate}
                    </h1>
                </div>

                {/* Card de Resumo (Topo) */}
                <div className="flex items-center justify-between p-4 rounded-2xl border mb-8
                    bg-gray-50 border-gray-100 dark:bg-zinc-900 dark:border-zinc-800">
                    <div>
                        <span className="block text-xs text-gray-400 dark:text-zinc-600 font-bold uppercase mb-1">
                            Horário
                        </span>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {isDayLongEvent ? 'Dia inteiro' : `${startTime} até ${endTime}`}
                        </div>
                        {event.feriado_duracao_dias > 1 && (
                            <div className="mt-3 text-sm text-gray-600 dark:text-zinc-300">
                                Duração: {event.feriado_duracao_dias} dias
                            </div>
                        )}
                    </div>
                    <div className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase border-l-4 ${getEventStyle(event.feriado_tipo)}`}>
                        {event.feriado_tipo}
                    </div>
                </div>

                {/* TIMELINE */}
                {!isDayLongEvent && (
                    <div className="mb-10 relative">
                        <h3 className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-6">
                            Timeline
                        </h3>
                        <div className="relative pt-3">

                            {timeSlots.map(hour => (
                                <div
                                    key={hour}
                                    className="relative"
                                    style={{ height: `${HOUR_HEIGHT}px` }}
                                >
                                    <div
                                        className="absolute top-0 right-0 border-t border-gray-100 dark:border-zinc-800"
                                        style={{ left: '52px' }}
                                    />

                                    <span className="text-sm font-medium text-gray-400 dark:text-zinc-500 absolute -top-2.5 left-0 bg-white dark:bg-zinc-950 pr-4">
                                    {hour.toString().padStart(2, '0')}:00
                                </span>
                                </div>
                            ))}

                            {/* O EVENTO */}
                            <div
                                className={`absolute left-14 right-0 rounded-xl shadow-sm border-l-4 overflow-hidden z-20 flex transition-all
                                    ${getEventStyle(event.feriado_tipo)}
                                    ${isShortEvent
                                    ? 'flex-row items-center justify-between p-2 px-3' // Layout Horizontal Compacto
                                    : 'flex-col justify-center p-4'                     // Layout Vertical Padrão
                                }
                                    `}
                                style={getEventCardStyles()}
                            >
                                {isShortEvent ? (
                                    // DESIGN DO LAYOUT COMPACTO (menos de 1 hora ou igual)
                                    <>
                                        <div className="flex flex-col min-w-0 pr-2">
                                        <span className="font-bold text-sm leading-tight truncate">
                                            {event.feriado_titulo}
                                        </span>
                                            <span className="text-[10px] font-bold opacity-60 uppercase leading-none mt-0.5">
                                            {event.feriado_tipo}
                                        </span>
                                        </div>
                                        <div className="text-xs opacity-90 whitespace-nowrap font-medium flex items-center shrink-0">
                                            {startTime} - {endTime}
                                        </div>
                                    </>
                                ) : (
                                    // DESIGN PADRÃO
                                    <>
                                    <span className="text-xs font-bold opacity-70 uppercase leading-none mb-1.5">
                                        {event.feriado_tipo}
                                    </span>

                                        <span className="font-bold text-lg leading-tight truncate">
                                        {event.feriado_titulo}
                                    </span>
                                        <div className="mt-1 text-xs opacity-80 flex items-center gap-1">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                <circle cx="12" cy="12" r="10"></circle>
                                                <polyline points="12 6 12 12 16 14"></polyline>
                                            </svg>
                                            {startTime} - {endTime}
                                        </div>
                                    </>
                                )}
                            </div>

                        </div>
                    </div>
                )}

                {/* DESCRIÇÃO */}
                <div className="pb-8">
                    <h3 className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-3">Descrição</h3>
                    <div className="rounded-xl p-4 border leading-relaxed text-sm
                        bg-gray-50 border-gray-100 text-gray-700
                        dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300">
                        {event.feriado_descricao || "Nenhuma descrição fornecida para este evento."}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default EventDetailView;