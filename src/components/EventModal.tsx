import React, { useState } from 'react';
import './EventModal.css'; // Vamos criar este ficheiro a seguir

// Define as propriedades que o Modal vai receber
interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddEvent: (title: string) => void;
}

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, onAddEvent }) => {
    // Estado interno para guardar o texto do evento
    const [title, setTitle] = useState('');

    // Se não estiver aberto, não renderiza nada
    if (!isOpen) {
        return null;
    }

    // Função para lidar com o "submit"
    const handleSubmit = () => {
        if (title.trim()) { // Só adiciona se houver texto
            onAddEvent(title);
            setTitle(''); // Limpa o campo
            onClose(); // Fecha o modal
        }
    };

    return (
        // O "overlay" é o fundo escuro semi-transparente
        <div className="modal-overlay" onClick={onClose}>

            {/* O "content" é a caixa do modal (impede o fecho ao clicar dentro) */}
            <div className="modal-content" onClick={e => e.stopPropagation()}>

                {/* Botão de Fechar (o "X") */}
                <button className="modal-close-btn" onClick={onClose}>
                    &times; {/* Este é o símbolo "X" */}
                </button>

                <h2>Novo Evento</h2>

                <div className="form-group">
                    <label htmlFor="eventText">
                        Adicione um evento (Máximo de 60 Characters)
                    </label>
                    <textarea
                        id="eventText"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        maxLength={60}
                        rows={4}
                    />
                </div>

                <button className="add-event-btn" onClick={handleSubmit}>
                    ADICIONAR EVENTO
                </button>

            </div>
        </div>
    );
};

export default EventModal;