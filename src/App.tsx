import React, { useState } from 'react';
import { MONTH_NAMES } from './types';
import type { ViewMode } from './types';

// Componentes
import Header from './components/Header';
import DayView from './components/DayView';
import MonthView from './components/MonthView';
import FooterStrip from './components/FooterStrip';

import './App.css';

const App: React.FC = () => {
    const [view, setView] = useState<ViewMode>('day');

    // Estado Global
    const [year] = useState(2025);
    const [monthIdx] = useState(9); // Outubro
    const [selectedDay, setSelectedDay] = useState(13);

    const [visibleMonthLabel, setVisibleMonthLabel] = useState(`${MONTH_NAMES[monthIdx]} ${year}`);

    return (
        <div className="flex flex-col h-screen bg-white text-black font-sans overflow-hidden">

            {/* Styles locais para esconder scrollbar */}
            <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

            <Header view={view} setView={setView} />

            <main className="flex-1 relative flex flex-col overflow-hidden">
                {/* VIEW: DIA */}
                {view === 'day' && (
                    <DayView
                        currentYear={year}
                        currentMonthIdx={monthIdx}
                        selectedDay={selectedDay}
                    />
                )}

                {/* VIEW: MÊS */}
                {view === 'month' && (
                    <>
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm px-5 py-2 rounded-full shadow-lg border border-gray-100 z-50 pointer-events-none transition-all duration-300">
              <span className="text-sm font-extrabold uppercase tracking-wider">
                {visibleMonthLabel}
              </span>
                        </div>

                        <MonthView
                            currentYear={year}
                            initialMonthIdx={monthIdx}
                            onMonthVisible={setVisibleMonthLabel}
                        />
                    </>
                )}
            </main>

            {/* FOOTER - Só aparece no DIA */}
            {view === 'day' && (
                <FooterStrip
                    currentYear={year}
                    currentMonthIdx={monthIdx}
                    selectedDay={selectedDay}
                    onSelectDay={setSelectedDay}
                />
            )}
        </div>
    );
};

export default App;