import React, {useState, useEffect, useCallback} from 'react';
import {DayPicker} from 'react-day-picker';
import {ptBR} from 'date-fns/locale';
import 'react-day-picker/dist/style.css';
import styles from './MyCalendar.module.css';
import {format} from 'date-fns';
import { useSwipeable } from "react-swipeable";

const MyCalendar: React.FC = () => {

    const modifiers = {
        weekend: (date: Date) => {
            const day = date.getDay();
            return day ===0 || day === 6;
        }
    };

    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

    const handleDaySelect = (day: Date | undefined) => {
        if (day && selectedDate && day.getTime() === selectedDate.getTime()) {
            setSelectedDate(undefined);
            document.documentElement.classList.remove('calendar-selection-active');
        } else if (day) {
            setSelectedDate(day);
            document.documentElement.classList.add('calendar-selection-active');
        }
    };

    // Melhorar esse useEffect
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const calendarElement = document.querySelector('.App');

            if (calendarElement && !calendarElement.contains(event.target as Node)) {
                setSelectedDate(undefined);
                document.documentElement.classList.remove('calendar-selection-active');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, []);

    const handlePrev = useCallback(() => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    }, []);

    const handleNext = useCallback(() => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    }, []);

    const swipeHandlers = useSwipeable({
        onSwipedLeft: () => handleNext(),
        onSwipedRight: () => handlePrev(),
        preventScrollOnSwipe: true,
        trackMouse: true
    });

    // Formatação dos dias da semana em maiúsculas e somente a primeira letra
    const formatWeekdayName = (date: Date) => {
        return format(date, 'ccccc', {locale: ptBR}).toUpperCase();
    };

    const year = currentMonth.getFullYear();
    const monthName = currentMonth.toLocaleDateString('pt-br', {month: 'long'});

    return (
        <>
            <div className="content-wrapper">
                <main className={styles.calendarContainer} {...swipeHandlers}>
                    <header className={styles.calendarHeader}>
                        <span className={styles.calendarYear}>{year}</span>
                        <span className={styles.calendarMonth}>
                            {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
                        </span>

                        <DayPicker
                            locale={ptBR} // Tradução
                            mode="single" // Modo de seleção

                            // Conecta o estado ao calendário
                            selected={selectedDate}
                            onSelect={handleDaySelect}

                            formatters={{formatWeekdayName}}
                            modifiers={modifiers}
                            //Final de semana com classe personalizada
                            modifiersClassNames={{
                                weekend: 'rdp-day_weekend'
                            }}
                            // Estado do Mês
                            month={currentMonth}
                            onMonthChange={setCurrentMonth}

                            classNames={{
                                nav: styles.hidden
                            }}
                        />
                    </header>
                </main>
            </div>
        </>
    );
};

export default MyCalendar;