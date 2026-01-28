import React, {useRef, useState } from "react";

// Lista de Legendas
export const EVENT_LEGEND = [
    { label: 'Trabalho', class: 'bg-gray-100 text-gray-700 border-l-4 border-gray-500 dark:bg-zinc-800/70 dark:text-zinc-100 dark:border-zinc-500' },
    { label: 'Férias',   class: 'bg-green-100 text-green-800 border-l-4 border-green-600 dark:bg-green-950/55 dark:text-green-200 dark:border-green-500' },
    { label: 'Feriado',  class: 'bg-red-100 text-red-800 border-l-4 border-red-500 dark:bg-red-950/55 dark:text-red-200 dark:border-red-500' },
    { label: 'Festa',    class: 'bg-purple-100 text-purple-800 border-l-4 border-purple-500 dark:bg-purple-950/55 dark:text-purple-200 dark:border-purple-500' },
    { label: 'Outros',    class: 'bg-blue-50 text-blue-800 border-l-4 border-blue-500 dark:bg-blue-950/55 dark:text-blue-200 dark:border-blue-500' },
]

interface FooterConfigProps {
    currentTheme?: string;
    onToggleTheme?: () => void;
}

const FooterConfig: React.FC<FooterConfigProps> = ({ currentTheme, onToggleTheme }) => {
    // ANIMAÇÕES
    const [isExpanded, setIsExpanded] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const sheetRef = useRef<HTMLDivElement>(null);
    const backdropRef = useRef<HTMLDivElement>(null);
    const startY = useRef<number>(0);
    const dragOffsetY = useRef<number>(0);

    const HEADER_HEIGHT = 48; // Altura do cabeçalho em pixels

    const onTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true)
        startY.current = e.targetTouches[0].clientY;
    };

    const onTouchMove = (e: React.TouchEvent) => {
        if (!isDragging || !sheetRef.current) return;

        const touchY = e.targetTouches[0].clientY;
        const delta = touchY - startY.current;

        const sheetHeight = sheetRef.current.offsetHeight;
        const maxTravelDistance = sheetHeight - HEADER_HEIGHT;

        if (isExpanded) {
            dragOffsetY.current = Math.max(0, Math.min(delta, maxTravelDistance));
        } else {
            dragOffsetY.current = Math.min(0, Math.max(delta, -maxTravelDistance));
        }

        if (sheetRef.current) {
            sheetRef.current.style.transform = isExpanded
                ? `translateY(${dragOffsetY.current}px)`
                : `translateY(calc(100% - ${HEADER_HEIGHT}px + ${dragOffsetY.current}px))`;

            sheetRef.current.style.transition = 'none';
        }

        if (backdropRef.current) {
            let progress = 0;

            if (isExpanded) {
                progress = 1 - (dragOffsetY.current / maxTravelDistance);
            } else {
                progress = Math.abs(dragOffsetY.current) / maxTravelDistance;
            }

            progress = Math.max(0, Math.min(1, progress));

            backdropRef.current.style.opacity = `${progress}`;
            backdropRef.current.style.backdropFilter = `blur(${progress * 4}px)`;
            backdropRef.current.style.transition = 'none';
        }
    };

    const onTouchEnd = () => {
        setIsDragging(false);

        if (!sheetRef.current) return;

        const threshold = 65;
        let nextState = isExpanded;

        if (isExpanded) {
            if (dragOffsetY.current > threshold) nextState = false;
        } else {
            if (dragOffsetY.current < -threshold) nextState = true;
        }

        setIsExpanded(nextState);
        dragOffsetY.current = 0;

        sheetRef.current.style.transform = '';
        sheetRef.current.style.transition = '';

        if (backdropRef.current) {
            backdropRef.current.style.opacity = '';
            backdropRef.current.style.backdropFilter = '';
            backdropRef.current.style.transition = '';
        }
    };

    // Se arrastou pouco ele não abre (proteção extra)
    const handleHeaderClick = () => {
        if (Math.abs(dragOffsetY.current) < 5) {
            setIsExpanded(!isExpanded)
        }
    };

    return (
        <>
            <div
                className={`h-12 w-full shrink-0 transition-all ${isExpanded ? '' : ''}`}
            />

            <div
                ref={backdropRef}
                className={`fixed inset-0 bg-black/20 z-[90] 
                transition-all duration-300 ease-out
                ${isExpanded
                    ? 'opacity-100 backdrop-blur-sm pointer-events-auto'
                    : 'opacity-0 backdrop-blur-none pointer-events-none'
                }`}
                onClick={() => setIsExpanded(false)}
            />

            {/* (Painel Arrastável) */}
            <div
                ref={sheetRef}
                className={`
                    fixed left-0 right-0 bottom-0 z-[100]
                    w-full h-[70vh] rounded-t-2xl shadow-[0_-5px_20px_rgba(0,0,0,0.15)]
                    bg-white dark:bg-zinc-950 border-t border-gray-200 dark:border-zinc-800
                    transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1)
                    flex flex-col
                    ${isExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-48px)]'}
                `}
            >
                {/* HEADER (Área de toque) */}
                <div
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                    onClick={handleHeaderClick}
                    className="shrink-0 h-12 flex items-center justify-between px-4 cursor-grab active:cursor-grabbing select-none relative
                        bg-white/50 dark:bg-zinc-950/50 rounded-t-2xl touch-none"
                >
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-gray-300 dark:bg-zinc-700" />
                    <div className="w-10"></div>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-bold uppercase tracking-wide text-gray-800 dark:text-zinc-100">
                            Legendas
                        </span>
                    </div>

                    <div className="w-10 flex justify-end mt-2">
                        {/* Botão de troca de tema */}
                        {onToggleTheme && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleTheme();
                                }}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-900 dark:text-zinc-100 transition-colors"
                                title="Alternar Tema"
                            >
                                {currentTheme === 'dark' ? (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                                ) : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* LISTA DE EVENTOS */}
                <div className="flex-1 overflow-y-auto px-6 pt-4 pb-10 bg-white dark:bg-zinc-950">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-extrabold text-black dark:text-white tracking-tight">
                            Tipos de Eventos
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {EVENT_LEGEND.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-3 rounded-xl border border-gray-200 bg-white shadow-sm
                                dark:bg-zinc-900/60 dark:border-zinc-800">
                                <div className={`w-12 h-10 rounded shadow-sm flex items-center justify-center text-[10px] font-bold ${item.class}`}/>
                                <div className="flex flex-col">
                                    <span className="text-base font-bold text-gray-900 dark:text-zinc-100">
                                        {item.label}
                                    </span>
                                    <span className="text-xs text-gray-400 dark:text-zinc-400">
                                        Cor padrão para eventos de {item.label.toLowerCase()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default FooterConfig;