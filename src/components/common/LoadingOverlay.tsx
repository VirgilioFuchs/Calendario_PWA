import React, { memo } from 'react';

interface LoadingOverlayProps {
    isLoading: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = memo(({ isLoading }:LoadingOverlayProps) => {
    if (!isLoading) return null;

    return (
        <div
            role="status"
            aria-label="Carregando eventos!"
            className={[
                'absolute inset-0 z-50',
                'flex flex-col items-center justify-center gap-3',
                'backdrop-blur-sm',
                'bg-white/60 dark:bg-zinc-950/70'
            ].join (' ')}
        >
            <div
                aria-hidden="true"
                className={[
                    'size-8 rounded-full',
                    'border-2',
                    'border-gray-200 border-t-blue-500',
                    'dark:border-zinc-700 dark:border-t-blue-400',
                    'animate-spin',
                ].join(' ')}
            />

            <p className="text-xs select-none text-gray-500 dark:text-zinc-400">
                Carregando eventos…
            </p>
        </div>
    );
});

LoadingOverlay.displayName = 'LoadingOverlay';

export default LoadingOverlay;