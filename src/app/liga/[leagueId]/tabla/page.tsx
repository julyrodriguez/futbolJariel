import LeagueBar from '@/components/LeagueBar';
import LeagueTable from '@/components/LeagueTable';
import { LEAGUES } from '@/lib/leagues';
import Link from 'next/link';
import { Calendar } from 'lucide-react';

export async function generateStaticParams() {
  return LEAGUES.filter(l => l.id !== 'general').map(l => ({
    leagueId: l.id,
  }));
}

export default async function LeagueTablaPage({ params }: { params: Promise<{ leagueId: string }> }) {
  const { leagueId } = await params;
  const activeLeague = LEAGUES.find(l => l.id === leagueId) || LEAGUES[1];

  return (
    <div className="space-y-6 pb-16">
      <LeagueBar currentLeagueId={leagueId} basePath="tabla" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#101726]/60 p-5 rounded-3xl border border-white/5">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{activeLeague.icon}</span>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Tabla de Posiciones • {activeLeague.name}
            </h1>
            <p className="text-xs text-slate-400">
              Clasificación actualizada, estadísticas de goles y puntos
            </p>
          </div>
        </div>

        <Link
          href={`/liga/${leagueId}/partidos`}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 transition-colors"
        >
          <Calendar className="w-3.5 h-3.5 text-sky-400" />
          Ver Partidos y Fixture
        </Link>
      </div>

      <LeagueTable leagueId={leagueId} />
    </div>
  );
}
