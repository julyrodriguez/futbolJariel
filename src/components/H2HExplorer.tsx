'use client';

import { useState, useEffect, useMemo } from 'react';
import TeamLogo from './TeamLogo';
import { 
  getTeamName, 
  getTeamLogo, 
  getScore,
  translateTeamToSpanish 
} from '../lib/footballUtils';
import { GitCompare, Search, History, Trophy, ArrowRight, Sparkles } from 'lucide-react';

interface TeamOption {
  id: number;
  name: string;
}

// Popular rivalries presets
const RIVALRIES = [
  { teamA: { id: 1104201, name: 'Boca Juniors' }, teamB: { id: 1104204, name: 'River Plate' }, label: 'Superclásico Argentino' },
  { teamA: { id: 1104205, name: 'Racing Club' }, teamB: { id: 1104203, name: 'Independiente' }, label: 'Clásico de Avellaneda' },
  { teamA: { id: 1104206, name: 'San Lorenzo' }, teamB: { id: 1104207, name: 'Huracán' }, label: 'Clásico Porteño' },
  { teamA: { id: 1104208, name: 'Rosario Central' }, teamB: { id: 1104209, name: "Newell's Old Boys" }, label: 'Clásico Rosarino' },
  { teamA: { id: 2817, name: 'Barcelona' }, teamB: { id: 2829, name: 'Real Madrid' }, label: 'El Clásico' },
  { teamA: { id: 4819, name: 'Argentina' }, teamB: { id: 4812, name: 'Brasil' }, label: 'Superclásico de las Américas' },
];

export default function H2HExplorer() {
  const [teamAId, setTeamAId] = useState<number>(1104201); // Boca
  const [teamBId, setTeamBId] = useState<number>(1104204); // River
  const [teamAName, setTeamAName] = useState<string>('Boca Juniors');
  const [teamBName, setTeamBName] = useState<string>('River Plate');

  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState<number>(20);

  // Search input helpers
  const [searchA, setSearchA] = useState('');
  const [searchB, setSearchB] = useState('');

  // Load H2H data
  useEffect(() => {
    if (!teamAId || !teamBId) return;
    setLoading(true);

    fetch(`https://apivacas.jariel.com.ar/api/matches/h2h?teamA=${teamAId}&teamB=${teamBId}&limit=50`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMatches(data);
        } else {
          setMatches([]);
        }
      })
      .catch(err => {
        console.error('Error fetching H2H:', err);
        setMatches([]);
      })
      .finally(() => setLoading(false));
  }, [teamAId, teamBId]);

  // Compute Stats
  const stats = useMemo(() => {
    if (!matches || matches.length === 0) return null;

    const sliced = matches.slice(0, limit);
    let aWins = 0;
    let bWins = 0;
    let draws = 0;
    let aGoals = 0;
    let bGoals = 0;

    sliced.forEach(m => {
      const isAHome = (m.homeTeam?.id || m.home_team?.id) === teamAId;
      const hScore = m.homeScore?.current ?? m.homeTeam?.score ?? m.home_team?.score ?? 0;
      const aScore = m.awayScore?.current ?? m.awayTeam?.score ?? m.away_team?.score ?? 0;

      const scoreA = isAHome ? hScore : aScore;
      const scoreB = isAHome ? aScore : hScore;

      aGoals += scoreA;
      bGoals += scoreB;

      if (scoreA > scoreB) aWins++;
      else if (scoreB > scoreA) bWins++;
      else draws++;
    });

    const total = sliced.length;
    return {
      total,
      aWins,
      draws,
      bWins,
      aGoals,
      bGoals,
      aWinPct: total > 0 ? Math.round((aWins / total) * 100) : 0,
      drawPct: total > 0 ? Math.round((draws / total) * 100) : 0,
      bWinPct: total > 0 ? Math.round((bWins / total) * 100) : 0,
      matches: sliced
    };
  }, [matches, teamAId, teamBId, limit]);

  const selectRivalry = (riv: typeof RIVALRIES[number]) => {
    setTeamAId(riv.teamA.id);
    setTeamAName(riv.teamA.name);
    setTeamBId(riv.teamB.id);
    setTeamBName(riv.teamB.name);
  };

  return (
    <div className="space-y-6">
      
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-900/40 via-sky-900/20 to-[#0B0F17] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 mb-3">
            <GitCompare className="w-3.5 h-3.5" />
            Historial de Enfrentamientos Directos
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Comparador Historial H2H
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Consultá el historial completo de partidos, victorias, empates y goles entre dos equipos a lo largo del tiempo.
          </p>
        </div>

        {/* Quick Clásicos Presets */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Clásicos y Rivalidades Destacadas
          </span>
          <div className="flex flex-wrap gap-2">
            {RIVALRIES.map((riv, idx) => {
              const isCurrent = (teamAId === riv.teamA.id && teamBId === riv.teamB.id) || (teamAId === riv.teamB.id && teamBId === riv.teamA.id);
              return (
                <button
                  key={idx}
                  onClick={() => selectRivalry(riv)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                      : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/5'
                  }`}
                >
                  {riv.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Team Comparison Duel Banner */}
      <div className="bg-[#101726]/80 rounded-3xl border border-white/10 p-6 sm:p-8">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 sm:gap-8">
          
          {/* Team A */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-2 bg-white/5 border border-white/10 flex items-center justify-center">
              <TeamLogo logoUrl={`/escudos/${teamAId}.png`} teamName={teamAName} className="w-full h-full" />
            </div>
            <h3 className="mt-2 text-sm sm:text-base font-black text-white">{teamAName}</h3>
          </div>

          {/* VS Pill */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-white font-black text-xs flex items-center justify-center shadow-lg shadow-sky-500/30">
              VS
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-2">
              Historial
            </span>
          </div>

          {/* Team B */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-2 bg-white/5 border border-white/10 flex items-center justify-center">
              <TeamLogo logoUrl={`/escudos/${teamBId}.png`} teamName={teamBName} className="w-full h-full" />
            </div>
            <h3 className="mt-2 text-sm sm:text-base font-black text-white">{teamBName}</h3>
          </div>

        </div>

        {/* Breakdown bar */}
        {stats && stats.total > 0 && (
          <div className="mt-8 pt-6 border-t border-white/5">
            <div className="grid grid-cols-3 text-center mb-3">
              <div>
                <span className="text-3xl font-black text-sky-400 block">{stats.aWins}</span>
                <span className="text-xs font-bold text-slate-400">Victorias {teamAName}</span>
              </div>
              <div>
                <span className="text-3xl font-black text-slate-300 block">{stats.draws}</span>
                <span className="text-xs font-bold text-slate-400">Empates</span>
              </div>
              <div>
                <span className="text-3xl font-black text-cyan-400 block">{stats.bWins}</span>
                <span className="text-xs font-bold text-slate-400">Victorias {teamBName}</span>
              </div>
            </div>

            <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden flex border border-white/5">
              <div style={{ width: `${stats.aWinPct}%` }} className="bg-sky-500 h-full" />
              <div style={{ width: `${stats.drawPct}%` }} className="bg-slate-600 h-full" />
              <div style={{ width: `${stats.bWinPct}%` }} className="bg-cyan-400 h-full" />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 mt-2 font-medium">
              <span>{stats.aGoals} goles anotados</span>
              <span className="font-bold text-slate-300">{stats.total} partidos registrados</span>
              <span>{stats.bGoals} goles anotados</span>
            </div>
          </div>
        )}
      </div>

      {/* Historical Matches List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-sky-400" />
            Resultados de Todos los Partidos
          </h3>
          <span className="text-xs text-slate-400 font-semibold">
            {stats ? `${stats.matches.length} partidos listados` : ''}
          </span>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-400">Cargando resultados...</span>
          </div>
        ) : stats && stats.matches.length > 0 ? (
          <div className="space-y-2">
            {stats.matches.map((m, idx) => {
              const hName = getTeamName(m, 'home');
              const aName = getTeamName(m, 'away');
              const hLogo = getTeamLogo(m, 'home');
              const aLogo = getTeamLogo(m, 'away');
              const hScore = getScore(m, 'home');
              const aScore = getScore(m, 'away');
              const dateStr = m.startTimestamp
                ? new Date(m.startTimestamp * 1000).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
                : '';

              return (
                <div 
                  key={m.id || idx}
                  className="flex items-center justify-between p-4 rounded-2xl bg-[#101726]/60 hover:bg-[#101726] border border-white/5 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-w-[90px]">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      {dateStr}
                    </span>
                    <span className="text-[11px] text-slate-500 font-semibold hidden md:inline truncate max-w-[130px]">
                      {m.tournament_name || m.tournament?.name || 'Oficial'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 flex-1 justify-center max-w-lg">
                    <div className="flex items-center gap-2 justify-end flex-1 min-w-0">
                      <span className={`text-xs sm:text-sm font-bold truncate ${hScore !== null && aScore !== null && hScore > aScore ? 'text-sky-400' : 'text-slate-200'}`}>
                        {hName}
                      </span>
                      <TeamLogo logoUrl={hLogo} teamName={hName} className="w-6 h-6 shrink-0" />
                    </div>

                    <div className="px-3 py-1 rounded-xl bg-black/50 border border-white/10 text-xs sm:text-sm font-black text-white shrink-0 whitespace-nowrap inline-flex items-center justify-center gap-1">
                      {hScore ?? 0} - {aScore ?? 0}
                    </div>

                    <div className="flex items-center gap-2 justify-start flex-1 min-w-0">
                      <TeamLogo logoUrl={aLogo} teamName={aName} className="w-6 h-6 shrink-0" />
                      <span className={`text-xs sm:text-sm font-bold truncate ${hScore !== null && aScore !== null && aScore > hScore ? 'text-sky-400' : 'text-slate-200'}`}>
                        {aName}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-[#101726]/40 border border-white/5 text-center text-slate-400 text-xs">
            No se encontraron partidos registrados entre estos dos equipos.
          </div>
        )}
      </div>

    </div>
  );
}
