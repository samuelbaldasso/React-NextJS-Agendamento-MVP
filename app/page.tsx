import { AgendamentoForm } from "../components/AgendamentoForm";
import { ListaAgendamentos } from "../components/ListaAgendamentos";

export default function AgendamentosPage() {
    return (
        <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-12">
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                        Gestão de Agendamentos
                    </h1>
                    <p className="mt-4 text-lg text-gray-500">
                        Agende novos exames ou gerencie seus horários existentes.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Form */}
                    <div>
                        <AgendamentoForm />
                    </div>

                    {/* Right Column: List (or below on mobile) */}
                    <div>
                        <ListaAgendamentos />
                    </div>
                </div>
            </div>
        </main>
    );
}
