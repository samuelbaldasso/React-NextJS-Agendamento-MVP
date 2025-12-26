import { AgendamentoRequestDTO, AgendamentoResponse } from '../types/agendamento';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const AgendamentoService = {
    // Cria um novo agendamento
    criar: async (dto: AgendamentoRequestDTO): Promise<AgendamentoResponse> => {
        try {
            const response = await fetch(`${API_URL}/agendamentos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dto),
            });

            if (!response.ok) {
                const errorText = await response.text();
                // Tenta fazer o parse se for JSON, senão retorna o texto puro
                try {
                    const errorJson = JSON.parse(errorText);
                    throw new Error(errorJson.message || errorText);
                } catch {
                    throw new Error(errorText);
                }
            }
            return await response.json();
        } catch (error: any) {
            throw error;
        }
    },

    // Cancela um agendamento existente
    cancelar: async (id: number): Promise<void> => {
        const response = await fetch(`${API_URL}/agendamentos/${id}/cancelar`, {
            method: 'POST', // Backend usa @PostMapping para cancelar
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Não foi possível cancelar o agendamento.');
        }
    }
};
