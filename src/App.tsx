import React, {useEffect, useState} from 'react';
import Header from './components/Header';
import DayView from './components/DayView';
import YearView from './components/YearView.tsx';
import FooterStrip from './components/FooterStrip';
import MonthView from './components/MonthView.tsx';
import FooterConfig from "./components/FooterConfig.tsx";
import EventDetailView from "./components/EventDetailView.tsx";
import type {CalendarEvent} from "./types";

import './App.css';

type NavLevel = 'year_list' | 'month_detail' | 'day_detail' | 'event_detail';

const App: React.FC = () => {
    // Calendário Estado
    const [navLevel, setNavLevel] = useState<NavLevel>('year_list');
    const [previousNavLevel, setPreviousNavLevel] = useState<'month_detail' | 'day_detail'>('month_detail');
    const [year] = useState(2025);
    const [selectedMonthIdx, setSelectedMonthIdx] = useState(10); // Default Novembro
    const [selectedDay, setSelectedDay] = useState(13);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

    // Animações
    const [daySlideDir, setDaySlideDir] = useState<'right' | 'left' | null>(null);
    const [zoomOrigin, setZoomOrigin] = useState({x: 0, y: 0});
    const [direction, setDirection] = useState<'in' | 'out'>('in');
    const [weekAnimOriginY, setWeekAnimOriginY] = useState(0);
    const [isExitingDay, setIsExitingDay] = useState(false);
    const [isExitingEvent, setIsExitingEvent] = useState(false);

    // Tema Inteligente
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                return savedTheme;
            }

            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }
        }
        return 'light';
    });

    //Classe HTML para tema
    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [theme]);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            // SÓ muda automaticamente se o usuário NÃO tiver forçado uma preferência manual
            if (!localStorage.getItem('theme')) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Função de Troca Manual (Botão)
    const toggleTheme = () => {
        setTheme(prev => {
            const newTheme = prev === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            return newTheme;
        });
    };

    // HANDLERS DE NAVEGAÇÃO
    const handleChangeDate = (day: number, monthIdx: number, targetYear: number) => {
        const currentDate = new Date(year, selectedMonthIdx, selectedDay);
        const newDate = new Date(targetYear, monthIdx, day);
        if (newDate.getTime() === currentDate.getTime()) return;
        if (newDate > currentDate) {
            setDaySlideDir('right');
        } else {
            setDaySlideDir('left');
        }
        setSelectedDay(day);
        if (monthIdx !== selectedMonthIdx) setSelectedMonthIdx(monthIdx);
    };
    const handleMonthSelect = (monthIdx: number, coords: { x: number, y: number }) => {
        setZoomOrigin(coords);
        setDirection('in');
        setSelectedMonthIdx(monthIdx);
        setNavLevel('month_detail');
    };

    const handleDaySelect = (monthIdx: number, day: number, rect?: DOMRect) => {
        setDaySlideDir(null)
        setSelectedMonthIdx(monthIdx);
        setSelectedDay(day);
        if (rect) {
            setWeekAnimOriginY(rect.top)
        }

        setPreviousNavLevel('month_detail');

        requestAnimationFrame(() => {
            setNavLevel('day_detail');
        });
    };

    const handleBackToMonth = () => {
        setIsExitingDay(true)
        setTimeout(() => {
            setNavLevel('month_detail');
            setIsExitingDay(false);
        }, 320);
    };

    const handleBackToYear = () => {
        setDirection('out');
        setNavLevel('year_list');
    }

    const handleEventSelect = (event: CalendarEvent) => {
        setSelectedEvent(event);

        if (navLevel === 'month_detail') {
            setPreviousNavLevel('month_detail');
        } else if (navLevel === 'day_detail') {
            setPreviousNavLevel('day_detail');
        }

        setIsExitingEvent(false);
        setNavLevel('event_detail');
    }

    const handleBackFromEvent = () => {
        setIsExitingEvent(true);
        setTimeout(() => {
            setNavLevel(previousNavLevel);
            setSelectedEvent(null);
            setIsExitingEvent(false);
        }, 380);
    }

    // Lógica de Exibição
    const showFooter = navLevel === 'day_detail';
    const showLegend = navLevel !== 'event_detail';

    return (
        <div
            className="flex flex-col h-screen bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 font-sans overflow-hidden transition-colors duration-300">
            <style>{`
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            {navLevel === 'year_list' && <Header currentYear={year}/>}

            <main className="flex-1 relative flex flex-col overflow-hidden">

                {/* NÍVEL 0: LISTA DE MESES (Sem Spy Scroll no Header, apenas grade) */}
                {navLevel === 'year_list' && (
                    <YearView
                        currentYear={year}
                        initialMonthIdx={selectedMonthIdx}
                        onMonthClick={handleMonthSelect}
                        animation={direction === 'out' ? 'animate-zoom-out' : ''}
                        style={{
                            transformOrigin: direction === 'out' ? `${zoomOrigin.x}px ${zoomOrigin.y}px` : 'center'
                        }}
                    />
                )}

                {/* NÍVEL 1: DETALHE DO MÊS (Com Spy Scroll interno) */}
                {navLevel === 'month_detail' && (
                    <div
                        key="month-detail"
                        className="flex-1 h-full w-full absolute inset-0 bg-white dark:bg-zinc-950"
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
                {(navLevel === 'day_detail' || isExitingDay || navLevel === 'event_detail') && (
                    <div
                        key="day-view-wrapper"
                        className={`
                             absolute inset-0 bg-white dark:bg-zinc-950 z-20
                             ${isExitingDay ? 'animate-day-slide-down' : ''}
                             ${navLevel === 'day_detail' && previousNavLevel === 'month_detail' && !isExitingEvent ? 'animate-day-slide-up' : ''}
                        `}
                    >
                        <DayView
                            currentYear={year}
                            currentMonthIdx={selectedMonthIdx}
                            selectedDay={selectedDay}
                            onBack={handleBackToMonth}
                            onEventClick={handleEventSelect}
                            onChangeDate={handleChangeDate}
                            slideDir={daySlideDir}
                        />
                    </div>
                )}


                {navLevel === 'event_detail' && selectedEvent && (
                    <div className={`absolute inset-0 z-30 bg-white dark:bg-zinc-950 shadow-2xl
                            ${isExitingEvent ? 'animate-slide-out-right-cover' : 'animate-slide-in-right-cover'}
                        `}
                    >
                        <EventDetailView
                            event={selectedEvent}
                            currentYear={year}
                            currentMonthIdx={selectedMonthIdx}
                            previousView={previousNavLevel}
                            onBack={handleBackFromEvent}
                        />
                    </div>
                )}
            </main>

            {(showFooter || isExitingDay) && (
                <FooterStrip
                    currentYear={year}
                    currentMonthIdx={selectedMonthIdx}
                    selectedDay={selectedDay}
                    onSelectDay={handleChangeDate}
                    className={`
                        ${showLegend ? 'bottom-12 border-b border-gray-200 dark:border-zinc-800' : 'bottom-0'}
                        ${isExitingDay ? 'animate-slide-down-footer' : 'animate-slide-up-footer'}
                    `}
                    animStartY={weekAnimOriginY}
                    isExiting={isExitingDay}
                />
            )}

            {showLegend && (
                <FooterConfig
                    currentTheme={theme}
                    onToggleTheme={toggleTheme}/>
            )}
        </div>
    );
};

export default App;