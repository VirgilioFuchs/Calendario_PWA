import React from 'react';
import {type CalendarEvent, MONTH_NAMES, WEEK_DAYS } from '../types';

interface EventDetailViewProps {
    event: CalendarEvent;
    currentYear: number;
    currentMonthIdx: number;
    previousView: 'month_detail' | 'day_detail';
    onBack: () => void;
}

const EventDetailView: React.FC<EventDetailViewProps> = ({ event, currentYear, currentMonthIdx, previousView, onBack }) => {

    const HOUR_HEIGHT = 80;
    const getCategoryColor = (cat: string) => {
        switch(cat) {
            case 'Trabalho': return 'bg-gray-100 text-gray-700 border-gray-500 dark:bg-zinc-800/70 dark:text-zinc-100 dark:border-zinc-500';
            case 'Férias':   return 'bg-green-100 text-green-800 border-green-600 dark:bg-green-950/55 dark:text-green-200 dark:border-green-500';
            case 'Feriado':  return 'bg-red-100 text-red-800 border-red-500 dark:bg-red-950/55 dark:text-red-200 dark:border-red-500';
            case 'Festa':    return 'bg-purple-100 text-purple-800 border-purple-500 dark:bg-purple-950/55 dark:text-purple-200 dark:border-purple-500';
            default:         return 'bg-blue-50 text-blue-800 border-blue-500 dark:bg-blue-950/55 dark:text-blue-200 dark:border-blue-500';
        }
    };
    // Formatação de Data
    const dateObj = new Date(currentYear, currentMonthIdx, event.day);
    const dayOfWeek = WEEK_DAYS[dateObj.getDay()]; // "Segunda-feira"
    const fullDate = `${event.day} de ${MONTH_NAMES[currentMonthIdx].toLowerCase().substring(0, 3)} de ${currentYear}`;

    // Formatação de Horário
    const formatTime = (decimalTime: number) => {
        const hours = Math.floor(decimalTime);
        const minutes = Math.round((decimalTime - hours) * 60);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    const startTime = formatTime(event.startHour);
    const endTime = formatTime(event.startHour + event.duration);

    // Lógica da Mini Timeline (Janela de 5 horas)
    let startViewHour = Math.floor(event.startHour) - 1;
    if (startViewHour < 0) startViewHour = 0;
    if (startViewHour > 19) startViewHour = 19;

    const timeSlots = Array.from({ length: 5 }, (_, i) => startViewHour + i);

    const backButtonText = previousView === 'month_detail'
        ? MONTH_NAMES[currentMonthIdx]
        : 'Voltar';

    // Estilo do Card do Evento na Timeline
    const getEventCardStyles = () => {
        const relativeStartHour = event.startHour - startViewHour;

        return {
            top: `${relativeStartHour * HOUR_HEIGHT}px`,
            height: `${event.duration * HOUR_HEIGHT}px`,
            minHeight: '50px'
        };
    };

    const isShortEvent = event.duration <= 1;

    return (
        <div className="flex-1 flex flex-col bg-white dark:bg-zinc-950 h-full animate-fade-in z-50 overflow-y-auto">
            <div className="sticky top-0 backdrop-blur-sm px-4 py-3 z-30 flex items-center
                bg-white/95 border-b border-gray-100
                dark:bg-zinc-950/95 dark:border-zinc-800">
                <button onClick={onBack} className="flex items-center gap-1 hover:opacity-70 transition-opacity text-black dark:text-white">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6"/>
                    </svg>
                    <span className="text-base font-semibold pb-0.5">{backButtonText}</span>
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
                        <span className="block text-xs text-gray-400 dark:text-zinc-600 font-bold uppercase mb-1">Horário</span>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {startTime} <span className="text-gray-400 dark:text-zinc-500 font-normal mx-1">até</span> {endTime}
                        </div>
                    </div>
                    <div className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase border-l-4 ${getCategoryColor(event.type)}`}>
                        {event.type}
                    </div>
                </div>

                {/* TIMELINE */}
                <div className="mb-10 relative">
                    <h3 className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-6">Timeline</h3>
                    <div className="relative">

                        {timeSlots.map(hour => (
                            <div
                                key={hour}
                                className="relative border-b border-gray-100 dark:border-zinc-800"
                                style={{ height: `${HOUR_HEIGHT}px` }}
                            >
                                <span className="text-sm font-medium text-gray-400 dark:text-zinc-500 absolute -top-2.5 left-0 bg-white dark:bg-zinc-950 pl-2">
                                    {hour.toString().padStart(2, '0')}:00
                                </span>
                            </div>
                        ))}

                        {/* O EVENTO */}
                        <div
                            className={`absolute left-14 right-0 rounded-xl shadow-sm border-l-4 overflow-hidden z-20 flex transition-all
                                    ${getCategoryColor(event.type)}
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
                                            {event.title}
                                        </span>
                                        <span className="text-[10px] font-bold opacity-60 uppercase leading-none mt-0.5">
                                            {event.type}
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
                                        {event.type}
                                    </span>

                                    <span className="font-bold text-lg leading-tight truncate">
                                        {event.title}
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

                {/* DESCRIÇÃO */}
                <div className="pb-8">
                    <h3 className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-3">Descrição</h3>
                    <div className="rounded-xl p-4 border leading-relaxed text-sm
                        bg-gray-50 border-gray-100 text-gray-700
                        dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300">
                        {event.description || "Nenhuma descrição fornecida para este evento."}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default EventDetailView;