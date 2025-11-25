import React from 'react';

interface HeaderProps {
    currentYear: number;
}

const Header: React.FC<HeaderProps> = ({currentYear}) => {
    return (
        <header
            className="flex flex-col shrink-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200 transition-all sticky top-0">
            <div className="h-14 flex items-center justify-between px-4">
                <span className="text-3xl font-extrabold tracking-tight ">
                    {currentYear}
                </span>
            </div>
        </header>
    );
};

export default Header;