"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { AgendamentoService } from "../services/agendamentoService"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Checkbox } from "./ui/checkbox"
import { AgendamentoRequestDTO, Exame, Unidade, Slot } from "../types/agendamento"

// --- Mock Data (In real app, come from API) ---
const EXAMES_MOCK: Exame[] = [
    { id: 1, nome: "Hemograma Completo", exigePreparo: false, requisitosPreparo: "" },
    { id: 2, nome: "Ultrassom Abdominal", exigePreparo: true, requisitosPreparo: "Jejum de 8 horas e bexiga cheia." },
    { id: 3, nome: "Ressonância Magnética", exigePreparo: true, requisitosPreparo: "Remover metais e jejum de 4 horas." },
]

const UNIDADES_MOCK: Unidade[] = [
    { id: 1, nome: "Unidade Central" },
    { id: 2, nome: "Unidade Zona Sul" },
]

// --- Schema Definition ---
const agendamentoSchema = z.object({
    pacienteId: z.string().optional(), // Using string for select value, convert to number later
    isNovoPaciente: z.boolean().default(false),
    pacienteNome: z.string().optional(),
    pacienteCpf: z.string().optional(),
    pacienteDataNascimento: z.string().optional(),
    pacienteTelefone: z.string().optional(),
    pacienteEmail: z.string().email("E-mail inválido").optional().or(z.literal("")),
    exameId: z.string().min(1, "Selecione um exame"), // Select returns string
    unidadeId: z.string().min(1, "Selecione uma unidade"),
    dataHorario: z.string().min(1, "Selecione um horário"),
    confirmaPreparo: z.boolean().default(false),
}).superRefine((data, ctx) => {
    // 1. Validation for New Patient vs Existing
    if (data.isNovoPaciente) {
        if (!data.pacienteNome) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Nome é obrigatório", path: ["pacienteNome"] });
        if (!data.pacienteCpf) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "CPF é obrigatório", path: ["pacienteCpf"] });
        if (!data.pacienteDataNascimento) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Data de Nascimento é obrigatória", path: ["pacienteDataNascimento"] });
        if (!data.pacienteTelefone) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Telefone é obrigatório", path: ["pacienteTelefone"] });
        if (!data.pacienteEmail) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "E-mail é obrigatório", path: ["pacienteEmail"] });
    } else {
        if (!data.pacienteId) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Selecione um paciente existente", path: ["pacienteId"] });
    }

    // 2. Validation for Exam Preparation
    if (data.exameId) {
        const exame = EXAMES_MOCK.find(e => e.id.toString() === data.exameId);
        if (exame?.exigePreparo && !data.confirmaPreparo) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `É obrigatório confirmar o preparo: ${exame.requisitosPreparo}`,
                path: ["confirmaPreparo"],
            });
        }
    }
});

type AgendamentoFormValues = z.infer<typeof agendamentoSchema>;

export function AgendamentoForm() {
    const [slots, setSlots] = useState<Slot[]>([]);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const form = useForm<AgendamentoFormValues>({
        resolver: zodResolver(agendamentoSchema),
        defaultValues: {
            isNovoPaciente: false,
            confirmaPreparo: false,
        }
    });

    const { register, handleSubmit, watch, setValue, formState: { errors } } = form;

    const watchIsNovoPaciente = watch("isNovoPaciente");
    const watchExameId = watch("exameId");
    const watchUnidadeId = watch("unidadeId");
    // const watchDate = watch("dataHorario"); // In a real calendar picker

    // Derived state
    const selectedExame = EXAMES_MOCK.find(e => e.id.toString() === watchExameId);

    // Mock fetching slots when Unidade changes
    useEffect(() => {
        if (watchUnidadeId) {
            // Simulate API call for slots
            const today = new Date().toISOString().split('T')[0];
            const mockSlots: Slot[] = [
                { dataHorario: `${today}T08:00:00`, disponivel: true },
                { dataHorario: `${today}T09:00:00`, disponivel: true },
                { dataHorario: `${today}T10:00:00`, disponivel: false }, // Occupied
                { dataHorario: `${today}T11:00:00`, disponivel: true },
            ];
            setSlots(mockSlots);
        }
    }, [watchUnidadeId]);

    const onSubmit = async (data: AgendamentoFormValues) => {
        setLoading(true);
        setStatusMessage(null);
        try {
            const payload: AgendamentoRequestDTO = {
                exameId: parseInt(data.exameId, 10),
                unidadeId: parseInt(data.unidadeId, 10),
                dataHorario: data.dataHorario,
                confirmaPreparo: data.confirmaPreparo,
                ...(data.isNovoPaciente ? {
                    pacienteNome: data.pacienteNome,
                    pacienteCpf: data.pacienteCpf,
                    pacienteDataNascimento: data.pacienteDataNascimento,
                    pacienteTelefone: data.pacienteTelefone,
                    pacienteEmail: data.pacienteEmail,
                } : {
                    pacienteId: parseInt(data.pacienteId!, 10)
                })
            };

            await AgendamentoService.criar(payload);
            setStatusMessage({ type: 'success', text: 'Agendamento realizado com sucesso!' });
            form.reset();
        } catch (error: any) {
            setStatusMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6 border rounded-md shadow-sm bg-white max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Novo Agendamento</h2>

            {/* 1. Identificação do Paciente */}
            <div className="space-y-4 border-b pb-4">
                <h3 className="font-semibold text-lg">Paciente</h3>
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="isNovoPaciente"
                        checked={watchIsNovoPaciente}
                        onCheckedChange={(checked) => setValue("isNovoPaciente", checked as boolean)}
                    />
                    <Label htmlFor="isNovoPaciente">Novo Paciente?</Label>
                </div>

                {!watchIsNovoPaciente ? (
                    <div>
                        <Label htmlFor="pacienteId">Selecione o Paciente</Label>
                        <select
                            {...register("pacienteId")}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            <option value="">Selecione...</option>
                            <option value="101">João Silva (CPF: 123...)</option>
                            <option value="102">Maria Souza (CPF: 456...)</option>
                        </select>
                        {errors.pacienteId && <p className="text-red-500 text-sm mt-1">{errors.pacienteId.message}</p>}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <Label htmlFor="pacienteNome">Nome Completo</Label>
                            <Input {...register("pacienteNome")} placeholder="Nome do paciente" />
                            {errors.pacienteNome && <p className="text-red-500 text-sm mt-1">{errors.pacienteNome.message}</p>}
                        </div>
                        <div>
                            <Label htmlFor="pacienteCpf">CPF</Label>
                            <Input {...register("pacienteCpf")} placeholder="000.000.000-00" />
                            {errors.pacienteCpf && <p className="text-red-500 text-sm mt-1">{errors.pacienteCpf.message}</p>}
                        </div>
                        <div>
                            <Label htmlFor="pacienteDataNascimento">Data de Nascimento</Label>
                            <Input type="date" {...register("pacienteDataNascimento")} />
                            {errors.pacienteDataNascimento && <p className="text-red-500 text-sm mt-1">{errors.pacienteDataNascimento.message}</p>}
                        </div>
                        <div>
                            <Label htmlFor="pacienteTelefone">Telefone</Label>
                            <Input {...register("pacienteTelefone")} placeholder="(00) 00000-0000" />
                            {errors.pacienteTelefone && <p className="text-red-500 text-sm mt-1">{errors.pacienteTelefone.message}</p>}
                        </div>
                        <div>
                            <Label htmlFor="pacienteEmail">E-mail</Label>
                            <Input type="email" {...register("pacienteEmail")} placeholder="email@exemplo.com" />
                            {errors.pacienteEmail && <p className="text-red-500 text-sm mt-1">{errors.pacienteEmail.message}</p>}
                        </div>
                    </div>
                )}
            </div>

            {/* 2. Seleção de Exame e Validação de Preparo */}
            <div className="space-y-4 border-b pb-4">
                <h3 className="font-semibold text-lg">Exame</h3>
                <div>
                    <Label htmlFor="exameId">Exame Solicitado</Label>
                    <select
                        {...register("exameId")}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                        <option value="">Selecione o exame...</option>
                        {EXAMES_MOCK.map(e => (
                            <option key={e.id} value={e.id}>{e.nome}</option>
                        ))}
                    </select>
                    {errors.exameId && <p className="text-red-500 text-sm mt-1">{errors.exameId.message}</p>}
                </div>

                {selectedExame?.exigePreparo && (
                    <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                        <p className="text-sm text-yellow-800 font-medium mb-2">⚠ Atenção: Este exame exige preparo!</p>
                        <p className="text-sm text-gray-700 mb-3">{selectedExame.requisitosPreparo}</p>
                        <div className="flex items-start space-x-2">
                            <Checkbox
                                id="confirmaPreparo"
                                checked={watch("confirmaPreparo")}
                                onCheckedChange={(c) => setValue("confirmaPreparo", c as boolean)}
                            />
                            <Label htmlFor="confirmaPreparo" className="leading-tight">
                                Confirmo que estou ciente do preparo: {selectedExame.requisitosPreparo}
                            </Label>
                        </div>
                        {errors.confirmaPreparo && <p className="text-red-500 text-sm mt-1">{errors.confirmaPreparo.message}</p>}
                    </div>
                )}
            </div>

            {/* 3. Unidade e Horário */}
            <div className="space-y-4 border-b pb-4">
                <h3 className="font-semibold text-lg">Agendamento</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="unidadeId">Unidade</Label>
                        <select
                            {...register("unidadeId")}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            <option value="">Selecione a unidade...</option>
                            {UNIDADES_MOCK.map(u => (
                                <option key={u.id} value={u.id}>{u.nome}</option>
                            ))}
                        </select>
                        {errors.unidadeId && <p className="text-red-500 text-sm mt-1">{errors.unidadeId.message}</p>}
                    </div>

                    {/* Simplified Date/Slot Selection */}
                    <div>
                        <Label>Horário Disponível</Label>
                        {slots.length > 0 ? (
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                {slots.map((slot, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        disabled={!slot.disponivel}
                                        className={`p-2 text-sm border rounded-md transition-colors
                                            ${watch("dataHorario") === slot.dataHorario ? 'bg-primary text-white border-primary' : 'bg-white hover:bg-gray-50'}
                                            ${!slot.disponivel ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}
                                        `}
                                        onClick={() => setValue("dataHorario", slot.dataHorario)}
                                    >
                                        {new Date(slot.dataHorario).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 mt-2">Selecione uma unidade para ver horários.</p>
                        )}
                        {errors.dataHorario && <p className="text-red-500 text-sm mt-1">{errors.dataHorario.message}</p>}
                    </div>
                </div>
            </div>

            {/* Feedback & Actions */}
            {statusMessage && (
                <div className={`p-4 rounded-md ${statusMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {statusMessage.text}
                </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Agendando...' : 'Confirmar Agendamento'}
            </Button>
        </form>
    )
}
