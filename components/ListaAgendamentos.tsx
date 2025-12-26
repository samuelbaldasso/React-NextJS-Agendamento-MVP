"use client"

import { useState } from "react"
import { AgendamentoResponse } from "../types/agendamento"
import { AgendamentoService } from "../services/agendamentoService"
import { Button } from "./ui/button"

// Mock Data for visualization
const AGENDAMENTOS_MOCK: AgendamentoResponse[] = [
    {
        id: 1,
        paciente: { id: 101, nomeCompleto: "João Silva" },
        exame: { id: 2, nome: "Ultrassom Abdominal", exigePreparo: true, requisitosPreparo: "Jejum" },
        unidade: { id: 1, nome: "Unidade Central" },
        dataHorario: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(), // Tomorrow
        status: 'AGENDADO'
    },
    {
        id: 2,
        paciente: { id: 101, nomeCompleto: "João Silva" },
        exame: { id: 1, nome: "Hemograma", exigePreparo: false, requisitosPreparo: "" },
        unidade: { id: 1, nome: "Unidade Central" },
        dataHorario: "2023-01-01T10:00:00", // Past
        status: 'REALIZADO'
    }
]

export function ListaAgendamentos() {
    const [agendamentos, setAgendamentos] = useState<AgendamentoResponse[]>(AGENDAMENTOS_MOCK);
    const [cancelandoId, setCancelandoId] = useState<number | null>(null);

    const checkPodeCancelar = (agendamento: AgendamentoResponse) => {
        if (agendamento.status !== 'AGENDADO') return false;
        const dataAgendamento = new Date(agendamento.dataHorario);
        const agora = new Date();
        return dataAgendamento > agora; // Only future appointments
    }

    const handleCancelar = async (id: number) => {
        if (!window.confirm("Tem certeza que deseja cancelar este agendamento?")) return;

        setCancelandoId(id);
        try {
            await AgendamentoService.cancelar(id);
            // Update local state
            setAgendamentos(prev => prev.map(a =>
                a.id === id ? { ...a, status: 'CANCELADO' } : a
            ));
        } catch (error) {
            alert("Erro ao cancelar agendamento");
        } finally {
            setCancelandoId(null);
        }
    }

    return (
        <div className="space-y-4 p-6 border rounded-md shadow-sm bg-white max-w-4xl mx-auto mt-8">
            <h2 className="text-2xl font-bold mb-4">Meus Agendamentos</h2>

            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="border-b bg-gray-50 text-left">
                            <th className="p-3">Data/Hora</th>
                            <th className="p-3">Paciente</th>
                            <th className="p-3">Exame</th>
                            <th className="p-3">Unidade</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {agendamentos.map((ag) => (
                            <tr key={ag.id} className="border-b hover:bg-gray-50">
                                <td className="p-3">
                                    {new Date(ag.dataHorario).toLocaleDateString()} <br />
                                    <span className="text-gray-500">{new Date(ag.dataHorario).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </td>
                                <td className="p-3">{ag.paciente.nomeCompleto}</td>
                                <td className="p-3">{ag.exame.nome}</td>
                                <td className="p-3">{ag.unidade.nome}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                        ${ag.status === 'AGENDADO' ? 'bg-blue-100 text-blue-800' :
                                            ag.status === 'CANCELADO' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                        {ag.status}
                                    </span>
                                </td>
                                <td className="p-3">
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        disabled={!checkPodeCancelar(ag) || cancelandoId === ag.id}
                                        onClick={() => handleCancelar(ag.id)}
                                    >
                                        {cancelandoId === ag.id ? '...' : 'Cancelar'}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {agendamentos.length === 0 && <p className="text-center p-4 text-gray-500">Nenhum agendamento encontrado.</p>}
            </div>
        </div>
    )
}
