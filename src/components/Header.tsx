import React from 'react';

interface HeaderProps {
    currentYear: number;
}

const Header: React.FC<HeaderProps> = ({ currentYear }) => {
    return (
        <header className="flex flex-col shrink-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200 transition-all sticky top-0">
            <div className="h-14 flex items-center justify-between px-4">

                {/* Título do Ano (Estilo iOS) */}
                <span className="text-3xl font-extrabold tracking-tight ">
          {currentYear}
        </span>

                {/* Ícone de Busca (Discreto à direita) */}
                <button className="p-2 hover:bg-red-50 rounded-full transition-colors">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </button>

            </div>
        </header>
    );
};

export default Header;