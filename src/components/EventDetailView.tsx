import React from 'react';
import {type CalendarEvent, MONTH_NAMES, WEEK_DAYS } from '../types';

interface EventDetailViewProps {
    event: CalendarEvent;
    currentYear: number;
    currentMonthIdx: number;
    previousView: 'month_detail' | 'day_detail'; // Para saber de onde veio
    onBack: () => void;
}

const EventDetailView: React.FC<EventDetailViewProps> = ({ event, currentYear, currentMonthIdx, previousView, onBack }) => {

    const HOUR_HEIGHT = 80;
    const getCategoryColor = (cat: string) => {
        switch(cat) {
            case 'Trabalho': return 'bg-gray-100 text-gray-800 border-black';
            case 'Férias':   return 'bg-green-100 text-green-800 border-green-600';
            case 'Feriado':  return 'bg-red-100 text-red-800 border-red-500';
            case 'Festa':    return 'bg-purple-100 text-purple-800 border-purple-500';
            default:         return 'bg-blue-50 text-blue-800 border-blue-500';
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
    if (startViewHour > 19) startViewHour = 19; // Limite para não estourar 24h

    const timeSlots = Array.from({ length: 5 }, (_, i) => startViewHour + i);

    // Texto do Botão Voltar
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

    return (
        <div className="flex-1 flex flex-col bg-white h-full animate-fade-in z-50 overflow-y-auto">
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3 z-30 flex items-center">
                <button onClick={onBack} className="flex items-center gap-1 hover:opacity-70 transition-opacity text-black">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6"/>
                    </svg>
                    <span className="text-base font-semibold pb-0.5">{backButtonText}</span>
                </button>
            </div>
            <div className="p-6">
                {/* Data e Dia */}
                <div className="mb-6">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">
                        {dayOfWeek}
                    </h2>
                    <h1 className="text-3xl font-extrabold text-black tracking-tight">
                        {fullDate}
                    </h1>
                </div>

                {/* Card de Resumo (Topo) */}
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-8">
                    <div>
                        <span className="block text-xs text-gray-400 font-bold uppercase mb-1">Horário</span>
                        <div className="text-lg font-bold text-gray-900">
                            {startTime} <span className="text-gray-400 font-normal mx-1">até</span> {endTime}
                        </div>
                    </div>
                    <div className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase border-l-4 ${getCategoryColor(event.type)}`}>
                        {event.type}
                    </div>
                </div>

                {/* TIMELINE */}
                <div className="mb-10 relative">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">Timeline</h3>
                    <div className="relative">

                        {timeSlots.map(hour => (
                            <div
                                key={hour}
                                className="relative border-b border-gray-100"
                                style={{ height: `${HOUR_HEIGHT}px` }}
                            >
                                <span className="text-sm font-medium text-gray-300 absolute -top-2.5 left-0 bg-white pl-2">
                                    {hour.toString().padStart(2, '0')}:00
                                </span>
                            </div>
                        ))}

                        {/* O EVENTO */}
                        <div
                            className={`absolute left-14 right-0 rounded-xl p-4 shadow-sm border-l-4 flex flex-col justify-center overflow-hidden z-20
                            ${getCategoryColor(event.type)}
                            `}
                            style={getEventCardStyles()}
                        >
                            <span className="text-xs font-bold opacity-70 uppercase leading-none mb-1.5">{event.type}</span>
                            <span className="font-bold text-lg leading-tight truncate">{event.title}</span>
                            <div className="mt-1 text-xs opacity-80 flex items-center gap-1">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                                {startTime} - {endTime}
                            </div>
                        </div>

                    </div>
                </div>

                {/* DESCRIÇÃO */}
                <div className="pb-8">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Descrição</h3>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-gray-700 leading-relaxed text-sm">
                        {event.description || "Nenhuma descrição fornecida para este evento."}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default EventDetailView;