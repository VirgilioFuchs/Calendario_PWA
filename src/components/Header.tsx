import React from 'react';
import type {ViewMode} from '../types';

interface HeaderProps {
    view: ViewMode;
    setView: (v: ViewMode) => void;
}
// Design do Header
const Header: React.FC<HeaderProps> = ({ view, setView }) => {
    return (
        <header className="flex flex-col shrink-0 z-30 bg-white border-b border-gray-200">
            <div className="h-14 flex items-center px-4">
                <div className="bg-gray-100 rounded-lg p-2 flex-1 flex items-center gap-2">
                    <span>🔍</span>
                    <input
                        type="text"
                        className="bg-transparent border-none outline-none w-full text-base"
                        placeholder="Buscar..."
                    />
                </div>
            </div>
            <div className="flex border-t border-gray-200">
                <button
                    onClick={() => setView('day')}
                    className={`flex-1 p-3 text-center text-sm font-bold transition-all border-b-2 cursor-pointer
            ${view === 'day' ? 'text-black border-black' : 'text-gray-500 border-transparent'}`}
                >
                    DIA
                </button>
                <button
                    onClick={() => setView('month')}
                    className={`flex-1 p-3 text-center text-sm font-bold transition-all border-b-2 cursor-pointer
            ${view === 'month' ? 'text-black border-black' : 'text-gray-500 border-transparent'}`}
                >
                    MÊS
                </button>
            </div>
        </header>
    );
};

export default Header;