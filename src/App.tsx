import React, { useState } from 'react';
import {AnimatePresence} from "framer-motion";
import {motion} from "framer-motion";
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
    const [zoomOrigin, setZoomOrigin] = useState({ x: 0, y: 0 });
    const [direction, setDirection] = useState<'in' | 'out'>('in');

    const pageVariants = {
        // Estado Inicial
        initial: (custom: { x: number, y: number, dir: 'in' | 'out' }) => ({
            scale: custom.dir === 'in' ? 0.4 : 1.5,
            opacity: 0,
            transformOrigin: `${custom.x}px ${custom.y}px`,
            filter: 'blur(4px)'
        }),
        // Estado Visível
        animate: (custom: { x: number, y: number }) => ({
            scale: 1,
            opacity: 1,
            transformOrigin: `${custom.x}px ${custom.y}px`,
            filter: 'blur(0px)',
            transition: {
                duration: 0.45,
                ease: [0.32, 0.72, 0, 1] as const
            }
        }),
        // Estado de Saída
        exit: (custom: { x: number, y: number, dir: 'in' | 'out' }) => ({
            scale: custom.dir === 'in' ? 1.5 : 0.4,
            opacity: 0,
            transformOrigin: `${custom.x}px ${custom.y}px`,
            filter: 'blur(4px)',
            transition: {
                duration: 0.45,
                ease: [0.32, 0.72, 0, 1] as const
            }
        })
    };

    // --- HANDLERS DE NAVEGAÇÃO ---
    const handleMonthSelect = (monthIdx: number, coords: {x: number, y: number}) => {
        setZoomOrigin(coords);
        setDirection('in');
        setSelectedMonthIdx(monthIdx);
        setNavLevel('month_detail');
    };

    const handleDaySelect = (monthIdx: number, day: number) => {
        setSelectedMonthIdx(monthIdx);
        setSelectedDay(day);
        setNavLevel('day_detail');
    };

    const handleEventSelect = (event: CalendarEvent) => {
        setSelectedEvent(event);
        if (navLevel === 'month_detail' || navLevel === 'day_detail') {
            setPreviousNavLevel(navLevel)
        }
        setNavLevel('event_detail');
    }

    const handleBackToMonth = () => setNavLevel('month_detail');
    const handleBackToYear = () => {
        setDirection('out');
        setNavLevel('year_list');
    }

    const handleBackFromEvent = () => {
        setNavLevel(previousNavLevel)
        setSelectedEvent(null)
    }

    // Lógica de Exibição
    const showFooter = navLevel === 'day_detail';
    const showLegend = navLevel === 'event_detail';

    return (
        <div className="flex flex-col h-screen bg-white text-black font-sans overflow-hidden">
            <style>{`
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            {navLevel === 'year_list' && <Header currentYear={year} />}

            <main className="flex-1 relative flex flex-col overflow-hidden">

                <AnimatePresence mode="popLayout" custom={{...zoomOrigin, dir: direction}}>
                    {/* NÍVEL 0: LISTA DE MESES (Sem Spy Scroll no Header, apenas grade) */}
                    {navLevel === 'year_list' && (
                        <motion.div
                            key="year-list"
                            className="flex-1 h-full w-full absolute inset-0 bg-white"
                            // Passamos as coordenadas e direção para a animação
                            custom={{ ...zoomOrigin, dir: direction }}
                            variants={pageVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            style={{ zIndex: 10 }} // YearView fica atrás ao sair
                        >
                            <YearView
                                currentYear={year}
                                initialMonthIdx={selectedMonthIdx}
                                onMonthClick={handleMonthSelect}
                            />
                        </motion.div>
                    )}

                    {/* NÍVEL 1: DETALHE DO MÊS (Com Spy Scroll interno) */}
                    {navLevel === 'month_detail' && (
                        <motion.div
                            key="month-detail"
                            className="flex-1 h-full w-full absolute inset-0 bg-white"
                            custom={{ ...zoomOrigin, dir: direction }}
                            variants={pageVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            style={{ zIndex: 20 }} // MonthView fica na frente ao entrar
                        >
                            <MonthView
                                year={year}
                                monthIdx={selectedMonthIdx}
                                onBack={handleBackToYear}
                                onDayClick={handleDaySelect}
                            />
                        </motion.div>
                    )}

                    {/* NÍVEL 2: DETALHE DO DIA (Timeline) */}
                    {navLevel === 'day_detail' && (
                        <DayView
                            currentYear={year}
                            currentMonthIdx={selectedMonthIdx}
                            selectedDay={selectedDay}
                            onBack={handleBackToMonth}
                            onEventClick={handleEventSelect}
                        />
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
                </AnimatePresence>
            </main>

            {showFooter && (
                <FooterStrip
                    currentYear={year}
                    currentMonthIdx={selectedMonthIdx}
                    selectedDay={selectedDay}
                    onSelectDay={setSelectedDay}
                />
            )}

            {!showLegend && (
                <FooterConfig />
            )}
        </div>
    );
};

export default App;