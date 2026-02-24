import { memo } from 'react';

interface MonthViewErrorBoxProps {
    isTimeout: boolean;
    onRetry: () => void;
    onContinue: () => void;
}

const MonthViewErrorBox = memo(({ isTimeout, onRetry, onContinue }: MonthViewErrorBoxProps) => (
    <div
        role="alertdialog"
        aria-modal="true"
        aria-label="Erro ao carregar eventos"
        className={[
            'absolute inset-0 z-50',
            'flex items-center justify-center px-4',
            'backdrop-blur-sm',
            'bg-white/60 dark:bg-zinc-950/70',
        ].join(' ')}
    >
        <div
            className={[
                'w-full max-w-sm rounded-2xl p-5',
                'bg-white dark:bg-zinc-900',
                'border border-gray-200 dark:border-zinc-700',
                'shadow-xl',
            ].join(' ')}
        >
            {/* Cabeçalho */}
            <div className="mb-2 flex items-center gap-2">
                <svg
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-5 shrink-0 text-amber-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                    />
                </svg>
                <h2 className="text-sm font-semibold text-gray-800 dark:text-zinc-100">
                    {isTimeout ? 'Tempo limite excedido' : 'Falha ao carregar eventos'}
                </h2>
            </div>

            {/* Mensagem */}
            <p className="mb-5 text-xs leading-relaxed text-gray-500 dark:text-zinc-400">
                {isTimeout
                    ? 'O servidor demorou mais de 15 segundos para responder.'
                    : 'Não foi possível carregar os eventos. Verifique sua conexão.'}{' '}
                Deseja tentar novamente ou continuar sem os eventos?
            </p>

            {/* Ações */}
            <div className="flex gap-2">
                <button
                    onClick={onRetry}
                    className={[
                        'flex-1 rounded-xl py-2 text-xs font-medium',
                        'bg-blue-500 text-white',
                        'hover:bg-blue-600 active:scale-[0.97]',
                        'transition-colors duration-150',
                    ].join(' ')}
                >
                    Tentar novamente
                </button>
                <button
                    onClick={onContinue}
                    className={[
                        'flex-1 rounded-xl py-2 text-xs font-medium',
                        'bg-gray-100 text-gray-700',
                        'dark:bg-zinc-800 dark:text-zinc-300',
                        'hover:bg-gray-200 dark:hover:bg-zinc-700',
                        'active:scale-[0.97] transition-colors duration-150',
                    ].join(' ')}
                >
                    Continuar assim
                </button>
            </div>
        </div>
    </div>
));

MonthViewErrorBox.displayName = 'MonthViewErrorBox';

export default MonthViewErrorBox;
