import React, {useEffect, useRef, useState} from 'react';
import {motion, AnimatePresence, type Variants} from "framer-motion";
import Header from './components/Header';
import YearView, {type YearViewHandle } from './components/YearView.tsx';
import FooterStrip from './components/FooterStrip';
import MonthView from './components/MonthView.tsx';
import FooterConfig from "./components/FooterConfig.tsx";
import EventDetailView from "./components/EventDetailView.tsx";
import type {CalendarEvent} from "./types";
import {useOrientation} from "./hooks/useOrientation.ts";
import './App.css';
import DayCarousel from "./components/DayCarousel.tsx";


type NavLevel = 'year_list' | 'month_detail' | 'day_detail' | 'event_detail';

const App: React.FC = () => {
    // Informações da data do Calendário
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth();
    const fullYear = today.getFullYear();

    // Calendário Estado
    const [navLevel, setNavLevel] = useState<NavLevel>('year_list');
    const [previousNavLevel, setPreviousNavLevel] = useState<'month_detail' | 'day_detail'>('month_detail');
    const [year, setYear] = useState(fullYear);
    const [selectedMonthIdx, setSelectedMonthIdx] = useState(month);
    const [selectedDay, setSelectedDay] = useState(day);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

    const orientation = useOrientation();

    // Animações
    const [zoomOrigin, setZoomOrigin] = useState({x: 0, y: 0});
    const [animDirection, setAnimDirection] = useState<'forward' | 'backward'>('forward');
    const isFirstLoad = useRef(true);

    const yearViewScrollRef = useRef(0);
    const yearViewRef = useRef<YearViewHandle>(null);
    const hasInitialScrolled = useRef(false);

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

    useEffect(() => {
        // Delay para garantir que o DOM está pronto
        const timer = setTimeout(() => {
            if (hasInitialScrolled.current) return;

            const monthCard = document.querySelector(`#month-card-${month}`); // Usa 'month' do início
            if (monthCard) {
                monthCard.scrollIntoView({block: 'center', behavior: 'smooth'});
                hasInitialScrolled.current = true;
            }
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    const yearViewVariants: Variants = {
        initial: {
            opacity: 1,
            scale: 1,
        },
        animate: {
            opacity: 1,
            scale: 1,
        },
        exit: {
            opacity: 0,
            scale: animDirection === 'forward' ? 0.95 : 1.02,
            y: animDirection === 'forward' ? -20 : 0,
            transition: {
                duration: 0.2,
                ease: [0.16, 1, 0.3, 1]
            }
        }
    };

    const monthViewVariants: Variants = {
        initial: {
            opacity: 0,
            y: animDirection === 'forward' ? 20 : -20,
            scale: animDirection === 'forward' ? 0.96 : 1.02,
        },
        animate: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.18,
                ease: [0.16, 1, 0.3, 1]
            }
        },
        exit: {
            opacity: 0,
            y: animDirection === 'backward' ? 12 : -12,
            scale: animDirection === 'backward' ? 0.96 : 1.02,
            transition: {
                duration: 0.16,
                ease: [0.16, 1, 0.3, 1]
            }
        }
    };

    const dayViewVariants: Variants = {
        initial: {
            opacity: 0,
            y: animDirection === 'forward' ? 20 : -20,
            scale: animDirection === 'forward' ? 0.96 : 1.02,
        },
        animate: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.18,
                ease: [0.16, 1, 0.3, 1]
            }
        },
        exit: {
            opacity: 0,
            y: animDirection === 'backward' ? 12 : -12,
            scale: animDirection === 'backward' ? 0.96 : 1.02,
            transition: {
                duration: 0.16,
                ease: [0.16, 1, 0.3, 1]
            }
        }
    };

    // HANDLERS DE NAVEGAÇÃO
    const handleChangeDate = (
        newDay: number,
        newMonthIdx: number,
        newYear: number
    ) => {
        console.log('🟡 handleChangeDate:', {
            newDay,
            newMonthIdx,
            newYear,
            currentSelectedMonthIdx: selectedMonthIdx,
            currentSelectedDay: selectedDay
        });

        const targetDate = new Date(newYear, newMonthIdx, newDay);
        const currentDate = new Date(year, selectedMonthIdx, selectedDay);
        if (targetDate.getTime() === currentDate.getTime()) return;

        setSelectedDay(newDay);
        if (newMonthIdx !== selectedMonthIdx) setSelectedMonthIdx(newMonthIdx);
        if (newYear !== year) setYear(newYear);
    }

    const handleMonthSelect = (monthIdx: number, coords: { x: number, y: number }) => {
        isFirstLoad.current = false;

        if (yearViewRef.current) {
            yearViewScrollRef.current = yearViewRef.current.getScrollTop();
        }

        setZoomOrigin(coords);
        setSelectedMonthIdx(monthIdx);
        setAnimDirection('forward');
        setNavLevel('month_detail');
    };

    const handleDaySelect = (monthIdx: number, day: number) => {
        console.log('🔵 handleDaySelect ANTES:', {
            monthIdx,
            day,
            selectedMonthIdx,
            selectedDay
        });

        setSelectedMonthIdx(monthIdx);
        setSelectedDay(day);
        setAnimDirection('forward');
        setPreviousNavLevel('month_detail');
        setNavLevel('day_detail');

        console.log('🟢 handleDaySelect DEPOIS:', {
            monthIdx,
            day
        });
    };

    const handleBackToMonth = () => {
        setAnimDirection('backward');
        setNavLevel('month_detail');
    };

    const handleBackToYear = () => {
        setAnimDirection('backward');
        setNavLevel('year_list');

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (yearViewRef.current && yearViewScrollRef.current > 0) {
                    yearViewRef.current.setScrollTop(yearViewScrollRef.current)
                }
            });
        });
    };

    const handleEventSelect = (event: CalendarEvent) => {
        setSelectedEvent(event);
        setPreviousNavLevel(navLevel === 'month_detail' ? 'month_detail' : 'day_detail');
        setNavLevel('event_detail');
    }

    const handleBackFromEvent = () => {
        setNavLevel(previousNavLevel);
        setSelectedEvent(null);
    }

    // Lógica de Exibição
    const showFooter = navLevel === 'day_detail';
    const showLegend = navLevel !== 'event_detail' &&
        !(navLevel === 'day_detail' && orientation === 'landscape') &&
        !(navLevel === 'month_detail' && orientation === 'landscape');

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-zinc-950">
            {/* Header - só aparece no YearView */}
            {navLevel === 'year_list' && (
                <Header currentYear={year}/>
            )}

            {/* Container principal com AnimatePresence */}
            <div className="flex-1 overflow-hidden">
                <AnimatePresence mode="wait" initial={false}>
                    {/* YearView */}
                    {navLevel === 'year_list' && (
                        <motion.div
                            key="year-view"
                            variants={yearViewVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="h-full overflow-hidden"
                            style={{ willChange: 'transform, opacity' }}
                        >
                            <YearView
                                ref={yearViewRef}
                                currentYear={year}
                                onMonthClick={handleMonthSelect}
                                isFirstLoad={isFirstLoad.current}
                            />
                        </motion.div>
                    )}

                    {/* MonthView */}
                    {navLevel === 'month_detail' && (
                        <motion.div
                            key="month-view"
                            variants={monthViewVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="h-full overflow-hidden"
                            style={{ willChange: 'transform, opacity' }}
                        >
                            <MonthView
                                year={year}
                                monthIdx={selectedMonthIdx}
                                onBack={handleBackToYear}
                                onDayClick={handleDaySelect}
                                zoomOrigin={zoomOrigin}
                            />
                        </motion.div>
                    )}

                    {/* DayView */}
                    {navLevel === 'day_detail' && (
                        <motion.div
                            key="day"
                            variants={dayViewVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="h-full overflow-hidden"
                            style={{ willChange: 'transform, opacity' }}
                        >
                            {orientation === 'landscape' ? (
                                <div className="flex h-full">
                                    {/* Área principal do DayCarousel */}
                                    <div className="flex-1 overflow-hidden">
                                        <DayCarousel
                                            currentYear={year}
                                            currentMonthIdx={selectedMonthIdx}
                                            selectedDay={selectedDay}
                                            onBack={handleBackToMonth}
                                            onChangeDate={handleChangeDate}
                                            onEventClick={handleEventSelect}
                                            horizontalMode={true}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <DayCarousel
                                    currentYear={year}
                                    currentMonthIdx={selectedMonthIdx}
                                    selectedDay={selectedDay}
                                    onBack={handleBackToMonth}
                                    onChangeDate={handleChangeDate}
                                    onEventClick={handleEventSelect}

                                />
                            )}
                        </motion.div>
                    )}

                    {/* EventDetailView */}
                    {navLevel === 'event_detail' && selectedEvent && (
                        <motion.div
                            key="event-view"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -12 }}
                            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                            className="h-full overflow-hidden"
                        >
                            <EventDetailView
                                event={selectedEvent}
                                onBack={handleBackFromEvent}
                                previousView={previousNavLevel}
                                currentMonthIdx={selectedMonthIdx}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footers */}
            <div>
                {showFooter && orientation === 'portrait' && (
                    <FooterStrip
                        currentYear={year}
                        currentMonthIdx={selectedMonthIdx}
                        selectedDay={selectedDay}
                        onSelectDay={handleChangeDate}
                        orientation="horizontal"
                        className={showLegend ? 'bottom-12 border-t border-gray-200 dark:border-zinc-800' : 'bottom-0'}
                    />
                )}
                {showLegend && (
                    <FooterConfig
                        currentTheme={theme}
                        onToggleTheme={toggleTheme}
                    />
                )}
            </div>
        </div>
    );
};

export default App;