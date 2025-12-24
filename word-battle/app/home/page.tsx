"use client";

import CreateParty from "@/components/createParty/CreateParty";
import JoinParty from "@/components/joinParty/JoinParty";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users } from "lucide-react";

// Mock de datos para el futuro fetch del backend
const MOCK_PARTIES = [
  { id: 1, name: "Sala de Prueba 1", points: 1250 },
  { id: 2, name: "Competitivo Pro", points: 890 },
  { id: 3, name: "Chill & Game", points: 450 },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
      <Card className="w-full max-w-md h-[700px] flex flex-col rounded-3xl border border-zinc-200 bg-white shadow-xl overflow-hidden">
        
        {/* Cabecera / Título */}
        <CardHeader className="py-6 border-b border-zinc-100">
          <CardTitle className="text-center text-xl font-bold text-zinc-800">
            Home
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-6 gap-6 overflow-hidden">
          
          {/* SECCIÓN DE LISTA (La caja gris del wireframe) */}
          <div className="flex-1 bg-zinc-100 rounded-2xl p-4 flex flex-col gap-4 overflow-hidden">
            
            {/* Encabezado de la tabla (Estilo pill de tu imagen) */}
            <div className="flex justify-between items-center bg-white p-2 px-4 rounded-xl shadow-sm border border-zinc-200">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Nombre sala</span>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Puntos globales</span>
            </div>

            {/* Lista de Partys (Scrollable) */}
            <div className="flex flex-col gap-2 overflow-y-auto pr-1 custom-scrollbar">
              {MOCK_PARTIES.length > 0 ? (
                MOCK_PARTIES.map((party) => (
                  <div 
                    key={party.id} 
                    className="flex justify-between items-center bg-white/50 hover:bg-white p-3 px-4 rounded-xl transition-all border border-transparent hover:border-zinc-200 group"
                  >
                    <span className="text-sm font-semibold text-zinc-700">{party.name}</span>
                    <span className="text-sm font-mono font-bold text-zinc-900 bg-zinc-200 px-2 py-1 rounded-lg">
                      {party.points}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex-1 flex items-center justify-center text-zinc-400 text-sm italic">
                  No hay salas activas...
                </div>
              )}
            </div>
          </div>

          {/* SECCIÓN DE BOTONES (Parte inferior del wireframe) */}
          <div className="grid grid-cols-2 gap-4 h-32">
            <CreateParty/>
            <JoinParty/>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}