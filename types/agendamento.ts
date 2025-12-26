export type StatusAgendamento = 'AGENDADO' | 'CANCELADO' | 'REALIZADO';

export interface AgendamentoRequestDTO {
  pacienteId?: number; // Opcional se for um novo paciente
  pacienteNome?: string;
  pacienteCpf?: string; // Validar formato
  pacienteDataNascimento?: string; // ISO Date (YYYY-MM-DD)
  pacienteTelefone?: string;
  pacienteEmail?: string;
  exameId: number;
  unidadeId: number;
  dataHorario: string; // ISO DateTime (YYYY-MM-DDTHH:mm:ss)
  confirmaPreparo: boolean; // Crítico para validação
}

export interface AgendamentoResponse {
  id: number;
  paciente: { id: number; nomeCompleto: string };
  exame: { id: number; nome: string; exigePreparo: boolean; requisitosPreparo: string };
  unidade: { id: number; nome: string };
  dataHorario: string;
  status: StatusAgendamento;
}

export interface Unidade {
  id: number;
  nome: string;
}

export interface Exame {
  id: number;
  nome: string;
  exigePreparo: boolean;
  requisitosPreparo: string;
}

export interface Slot {
  dataHorario: string;
  disponivel: boolean;
}
