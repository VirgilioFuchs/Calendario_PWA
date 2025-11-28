import React, {useState} from "react";


// Lista de Legendas (linkar com a API)
const EVENT_LEGEND = [
    { label: 'Trabalho', class: 'bg-gray-100 text-gray-700 border-l-4 border-gray-500' },
    { label: 'Férias',   class: 'bg-green-100 text-green-800 border-l-4 border-green-600' },
    { label: 'Feriado',  class: 'bg-red-100 text-red-800 border-l-4 border-red-500' },
    { label: 'Festa',    class: 'bg-purple-100 text-purple-800 border-l-4 border-purple-500' },
    { label: 'Lazer',    class: 'bg-blue-50 text-blue-800 border-l-4 border-blue-500' },
]

const FooterConfig: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState(false)

    //Função para alternar o estado
    const toggleLegend = () => setIsExpanded(!isExpanded);

    return (
        <>
            {isExpanded && <div className="h-12 w-full shrink-0 bg-white" />}

            <div
                className={`border-t border-gray-200 bg-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] overflow-hidden flex flex-col
                ${isExpanded
                    ? 'fixed inset-0 z-[100]'
                    : 'relative h-12 shrink-0 z-40'
                }`}
            >
                <div
                    onClick={toggleLegend}
                    className="shrink-0 h-12 flex items-center justify-center gap-1 px-6 cursor-pointer hover:bg-gray-50 transition-colors select-none"
                >
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold uppercase tracking-wide text-gray-800">
                            Legendas
                        </span>
                    </div>
                </div>

                {/* CONTEÚDO (LISTA) */}
                <div className={`flex-1 overflow-y-auto px-6 pt-4 pb-10 transition-opacity duration-500 delay-100
                    ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                >
                    <h2 className="text-2xl font-extrabold text-black tracking-tight mb-8">
                        Tipos de Eventos
                    </h2>

                    <div className="space-y-4">
                        {EVENT_LEGEND.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 bg-white shadow-sm">
                                {/* Caixa de Exemplo com a cor real */}
                                <div className={`w-12 h-10 rounded shadow-sm flex items-center justify-center text-[10px] font-bold ${item.class}`}/>

                                <div className="flex flex-col">
                                    <span className="text-base font-bold text-gray-900">
                                        {item.label}
                                    </span>
                                    <span className="text-xs text-gray-400">
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