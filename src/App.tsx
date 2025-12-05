import React, { useState } from 'react';
import Header from './components/Header';
import DayView from './components/DayView';
import YearView from './components/YearView.tsx';
import FooterStrip from './components/FooterStrip';
import MonthView from './components/MonthView.tsx';
import FooterConfig from "./components/FooterConfig.tsx";
import EventDetailView from "./components/EventDetailView.tsx";
import type { CalendarEvent } from "./types";

import './App.css';

type NavLevel = 'year_list' | 'month_detail' | 'day_detail' | 'event_detail';

const App: React.FC = () => {
    const [navLevel, setNavLevel] = useState<NavLevel>('year_list');
    const [previousNavLevel, setPreviousNavLevel] = useState<'month_detail' | 'day_detail'>('month_detail');
    const [year] = useState(2025);
    const [selectedMonthIdx, setSelectedMonthIdx] = useState(10); // Default Novembro
    const [selectedDay, setSelectedDay] = useState(13);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    // Animações
    const [zoomOrigin, setZoomOrigin] = useState({ x: 0, y: 0 });
    const [direction, setDirection] = useState<'in' | 'out'>('in');
    const [weekAnimOriginY, setWeekAnimOriginY] = useState(0);
    const[isExitingDay, setIsExitingDay] = useState(false);

    // HANDLERS DE NAVEGAÇÃO
    const handleMonthSelect = (monthIdx: number, coords: {x: number, y: number}) => {
        setZoomOrigin(coords);
        setDirection('in');
        setSelectedMonthIdx(monthIdx);
        setNavLevel('month_detail');
    };

    const handleDaySelect = (monthIdx: number, day: number, rect?: DOMRect) => {
        setSelectedMonthIdx(monthIdx);
        setSelectedDay(day);
        if (rect) {
            setWeekAnimOriginY(rect.top)
        }
        setNavLevel('day_detail');
    };

    const handleEventSelect = (event: CalendarEvent) => {
        setSelectedEvent(event);
        if (navLevel === 'month_detail' || navLevel === 'day_detail') {
            setPreviousNavLevel(navLevel)
        }
        setNavLevel('event_detail');
    }

    const handleBackToMonth = () => {
        setIsExitingDay(true)
        setTimeout(() => {
            setNavLevel('month_detail');
            setIsExitingDay(false);
        }, 380);
    };

    const handleBackToYear = () => {
        setDirection('out');
        setNavLevel('year_list');
    }

    const handleBackFromEvent = () => {
        setNavLevel(previousNavLevel)
        setSelectedEvent(null)
    }

    const handleFooterDateSelect = (day: number, monthIdx: number) => {
        setSelectedDay(day);
        if (monthIdx !== selectedMonthIdx) {
            setSelectedMonthIdx(monthIdx);
        }
    }

    // Lógica de Exibição
    const showFooter = navLevel === 'day_detail';
    const showLegend = navLevel !== 'event_detail';

    return (
        <div className="flex flex-col h-screen bg-white text-black font-sans overflow-hidden">
            <style>{`
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            {navLevel === 'year_list' && <Header currentYear={year} />}

            <main className="flex-1 relative flex flex-col overflow-hidden">

                    {/* NÍVEL 0: LISTA DE MESES (Sem Spy Scroll no Header, apenas grade) */}
                    {navLevel === 'year_list' && (
                            <YearView
                                currentYear={year}
                                initialMonthIdx={selectedMonthIdx}
                                onMonthClick={handleMonthSelect}
                                animation={direction === 'out' ? 'animate-zoom-out' : ''}
                                style={{
                                    transformOrigin: direction === 'out' ? `${zoomOrigin.x}px ${zoomOrigin.y}px`: 'center'
                                }}
                            />
                    )}

                    {/* NÍVEL 1: DETALHE DO MÊS (Com Spy Scroll interno) */}
                    {navLevel === 'month_detail' && (
                        <div
                            key="month-detail"
                            className="flex-1 h-full w-full absolute inset-0 bg-white"
                        >
                            <MonthView
                                year={year}
                                monthIdx={selectedMonthIdx}
                                onBack={handleBackToYear}
                                onDayClick={handleDaySelect}
                                zoomOrigin={zoomOrigin}
                            />
                        </div>
                    )}

                    {/* NÍVEL 2: DETALHE DO DIA (Timeline) */}
                    {(navLevel === 'day_detail' || isExitingDay) && (
                        <div
                            className={`absolute inset-0 bg-white z-20 
                        ${isExitingDay ? 'animate-slide-down-content' : 'animate-slide-up-content'}`}
                        >
                            <DayView
                                currentYear={year}
                                currentMonthIdx={selectedMonthIdx}
                                selectedDay={selectedDay}
                                onBack={handleBackToMonth}
                                onEventClick={handleEventSelect}
                            />
                        </div>
                    )}


                    {navLevel === 'event_detail' && selectedEvent && (
                        <EventDetailView
                            event={selectedEvent}
                            currentYear={year}
                            currentMonthIdx={selectedMonthIdx}
                            previousView={previousNavLevel}
                            onBack={handleBackFromEvent}
                        />
                    )}
            </main>

            {(showFooter || isExitingDay) && (
                <FooterStrip
                    currentYear={year}
                    currentMonthIdx={selectedMonthIdx}
                    selectedDay={selectedDay}
                    onSelectDay={handleFooterDateSelect}
                    className={`
                        ${showLegend ? 'bottom-12 border-b border-gray-100' : 'bottom-0'}
                        ${isExitingDay ? 'animate-slide-down-footer' : 'animate-slide-up-footer'}
                    `}
                    animStartY={weekAnimOriginY}
                    isExiting={isExitingDay}
                />
            )}

            {showLegend && (
                <FooterConfig />
            )}
        </div>
    );
};

export default App;