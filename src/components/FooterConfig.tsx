import React, {useState} from "react";

// Lista de Legendas (linkar com a API)
const EVENT_LEGEND = [
    {label: 'Trabalho / Profissional', color: 'bg-black'},
    {label: 'Pessoal / Lazer', color: 'bg-gray-300'},
    {label: 'Feriado', color: 'bg-red-500'},
]


const FooterConfig: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState(false)

    //Função para alternar o estado
    const toggleLegend = () => setIsExpanded(!isExpanded);

    return (
        <>
            {/* Evita pulos no layout quando a barra vira 'fixed' */}
            {isExpanded && <div className="h-12 w-full shrink-0 bg-white" />}

            <div
                className={`border-t border-gray-200 bg-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] overflow-hidden flex flex-col
                ${isExpanded
                    ? 'fixed inset-0 z-[100]' // Expandido: Tela cheia
                    : 'relative h-12 shrink-0 z-40' // Fechado: Barra no rodapé
                }`}
            >
                <div
                    onClick={toggleLegend}
                    className="shrink-0 h-12 flex items-center justify-center gap-1 px-6 cursor-pointer hover:bg-gray-50 transition-colors select-none"
                >
                    <div className="flex items-center gap-3">
                        {isExpanded ? (
                            <span className="text-xs font-bold uppercase tracking-wide text-gray-800">
                                Legendas
                            </span>
                        ) : (
                            <span className="text-xs font-bold uppercase tracking-wide text-gray-800">
                                Legendas
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Preview das cores (Fazer ligacação com eventos e depois a API) */}
                        {!isExpanded && (
                            <div className="flex -space-x-1 opacity-60">
                                {EVENT_LEGEND.map((item, i) => (
                                    <div key={i} className={`w-2 h-2 rounded-full ring-1 ring-white ${item.color}`} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* CONTEÚDO (LISTA) */}
                <div className={`flex-1 overflow-y-auto px-6 pt-4 pb-10 transition-opacity duration-500 delay-100
                    ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                >
                    <h2 className="text-2xl font-extrabold text-black tracking-tight mb-8">
                        Tipos de Eventos
                    </h2>

                    <div className="space-y-6">
                        {EVENT_LEGEND.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                                <div className={`w-8 h-8 rounded-lg shadow-sm border border-black/5 shrink-0 ${item.color}`} />
                                <div className="flex flex-col">
                                    <span className="text-base font-bold text-gray-900">
                                        {item.label}
                                    </span>
                                    <span className="text-xs text-gray-500 mt-0.5">
                                        Descrição do evento...
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