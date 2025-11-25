import React, { useState } from 'react';

import Header from './components/Header';
import DayView from './components/DayView';
import YearView from './components/YearView.tsx';
import FooterStrip from './components/FooterStrip';
import MonthView from './components/MonthView.tsx';

import './App.css';

type NavLevel = 'year_list' | 'month_detail' | 'day_detail';

const App: React.FC = () => {
    const [navLevel, setNavLevel] = useState<NavLevel>('year_list');

    const [year] = useState(2025);
    const [selectedMonthIdx, setSelectedMonthIdx] = useState(9); // Default Outubro
    const [selectedDay, setSelectedDay] = useState(13);

    // --- HANDLERS DE NAVEGAÇÃO ---
    const handleMonthSelect = (monthIdx: number) => {
        setSelectedMonthIdx(monthIdx);
        setNavLevel('month_detail');
    };

    const handleDaySelect = (monthIdx: number, day: number) => {
        setSelectedMonthIdx(monthIdx);
        setSelectedDay(day);
        setNavLevel('day_detail');
    };

    const handleBackToMonth = () => setNavLevel('month_detail');
    const handleBackToYear = () => setNavLevel('year_list');

    // Lógica de Exibição
    const showFooter = navLevel === 'day_detail';

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
                    />
                )}

                {/* NÍVEL 1: DETALHE DO MÊS (Com Spy Scroll interno) */}
                {navLevel === 'month_detail' && (
                    <MonthView
                        year={year}
                        monthIdx={selectedMonthIdx}
                        onBack={handleBackToYear}
                        onDayClick={handleDaySelect}
                    />
                )}

                {/* NÍVEL 2: DETALHE DO DIA (Timeline) */}
                {navLevel === 'day_detail' && (
                    <DayView
                        currentYear={year}
                        currentMonthIdx={selectedMonthIdx}
                        selectedDay={selectedDay}
                        onBack={handleBackToMonth}
                    />
                )}

            </main>

            {showFooter && (
                <FooterStrip
                    currentYear={year}
                    currentMonthIdx={selectedMonthIdx}
                    selectedDay={selectedDay}
                    onSelectDay={setSelectedDay}
                />
            )}
        </div>
    );
};

export default App;