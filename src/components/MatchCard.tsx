'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TeamLogo from './TeamLogo';
import { 
  Match, 
  parseMatchStatus, 
  getMatchTime, 
  getScore, 
  getTeamName, 
  getTeamLogo, 
  getTeamId 
} from '../lib/footballUtils';
import { ChevronDown, ChevronRight, Activity, Trophy } from 'lucide-react';

interface MatchCardProps {
  match: Match;
  showTournamentHeader?: boolean;
}

export default function MatchCard({ match, showTournamentHeader = false }: MatchCardProps) {
  const router = useRouter();
  const [goalsOpen, setGoalsOpen] = useState(false);
  const [goalsLoading, setGoalsLoading] = useState(false);
  const [goals, setGoals] = useState<any[] | null>(null);

  const status = parseMatchStatus(match);
  const hName = getTeamName(match, 'home');
  const aName = getTeamName(match, 'away');
  const hLogo = getTeamLogo(match, 'home');
  const aLogo = getTeamLogo(match, 'away');
  const hScore = getScore(match, 'home');
  const aScore = getScore(match, 'away');
  const hId = getTeamId(match, 'home');
  const aId = getTeamId(match, 'away');
  const liveTime = status.isLive ? getMatchTime(match) : null;

  const loadGoals = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!status.hasStarted) return;
    if (goals !== null) {
      setGoalsOpen(!goalsOpen);
      return;
    }
    setGoalsLoading(true);
    setGoalsOpen(true);
    fetch(`https://apivacas.jariel.com.ar/api/matches/detail/${match.id}`)
      .then(res => res.json())
      .then(d => {
        const incidents = d.incidents || (d.events?.[0]?.incidents) || [];
        const goalInc = incidents.filter((i: any) => i.incidentType === 'goal');
        setGoals(goalInc);
      })
      .catch(() => setGoals([]))
      .finally(() => setGoalsLoading(false));
  };

  const startTimeStr = match.startTimestamp
    ? new Date(match.startTimestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div 
      onClick={() => router.push(`/match/${match.id}`)}
      className={`group relative bg-[#101726]/70 hover:bg-[#131d31] border rounded-2xl transition-all duration-200 cursor-pointer overflow-hidden shadow-sm hover:shadow-xl hover:shadow-sky-500/5 ${
        status.isLive 
          ? 'border-red-500/30 bg-gradient-to-r from-red-500/[0.04] via-transparent to-transparent' 
          : 'border-white/[0.06] hover:border-white/15'
      }`}
    >
      {/* Optional Tournament Sub-header if needed */}
      {showTournamentHeader && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-black/20 text-[11px] font-bold text-slate-400">
          <div className="flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-200">{match.tournament_name || match.tournament?.name || 'Fútbol'}</span>
          </div>
          {match.round_name && (
            <span className="text-slate-400 font-semibold">{match.round_name}</span>
          )}
        </div>
      )}

      {/* Main Stadium Layout */}
      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
          
          {/* Home Team */}
          <div className="flex items-center justify-end gap-3 text-right min-w-0">
            <div className="flex flex-col items-end min-w-0">
              <span className="text-sm sm:text-base font-bold text-slate-100 group-hover:text-sky-300 transition-colors truncate max-w-[130px] sm:max-w-[200px]">
                {hName}
              </span>
              {match.round_name && !showTournamentHeader && (
                <span className="text-[10px] text-slate-400 truncate hidden sm:block">
                  {match.round_name}
                </span>
              )}
            </div>
            <TeamLogo logoUrl={hLogo} teamName={hName} className="w-8 h-8 sm:w-10 sm:h-10 shrink-0" />
          </div>

          {/* Central Scoreboard / Timing Pill */}
          <div className="flex flex-col items-center justify-center min-w-[80px] sm:min-w-[110px] shrink-0">
            {status.isLive ? (
              <div className="flex flex-col items-center">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/40 mb-1 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  {liveTime || 'VIVO'}
                </span>
                <div className="flex items-center gap-2 text-xl sm:text-2xl font-black text-red-400 tracking-tight">
                  <span>{hScore ?? 0}</span>
                  <span className="text-slate-600 font-normal text-sm">-</span>
                  <span>{aScore ?? 0}</span>
                </div>
              </div>
            ) : status.hasStarted ? (
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  {status.isPenalties ? 'Penales' : 'Final'}
                </span>
                <div className="flex items-center gap-2 text-xl sm:text-2xl font-black text-white tracking-tight">
                  <span className={hScore !== null && aScore !== null && hScore > aScore ? 'text-sky-400' : 'text-slate-100'}>
                    {hScore ?? 0}
                  </span>
                  <span className="text-slate-600 font-normal text-sm">-</span>
                  <span className={hScore !== null && aScore !== null && aScore > hScore ? 'text-sky-400' : 'text-slate-100'}>
                    {aScore ?? 0}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  {status.label}
                </span>
                <div className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs sm:text-sm font-bold text-slate-200">
                  {startTimeStr || 'Pendiente'}
                </div>
              </div>
            )}
          </div>

          {/* Away Team */}
          <div className="flex items-center justify-start gap-3 text-left min-w-0">
            <TeamLogo logoUrl={aLogo} teamName={aName} className="w-8 h-8 sm:w-10 sm:h-10 shrink-0" />
            <div className="flex flex-col items-start min-w-0">
              <span className="text-sm sm:text-base font-bold text-slate-100 group-hover:text-sky-300 transition-colors truncate max-w-[130px] sm:max-w-[200px]">
                {aName}
              </span>
              <span className="text-[10px] text-slate-400 truncate hidden sm:block">
                Visitante
              </span>
            </div>
          </div>

        </div>

        {/* Quick Footer Action: Link to Detail & H2H */}
        <div className="mt-3 pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            {status.hasStarted && (
              <button
                onClick={loadGoals}
                className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-white px-2 py-0.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                <span>{goalsOpen ? 'Ocultar goles' : 'Goles'}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${goalsOpen ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 text-[11px] font-bold text-sky-400 group-hover:text-sky-300 transition-colors">
            <span>Ver Historial H2H & Estadísticas</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* Expanded Goals View */}
      {goalsOpen && (
        <div className="px-5 py-3 border-t border-white/5 bg-[#080d16]/80 animate-in fade-in-0 duration-150">
          {goalsLoading ? (
            <div className="flex items-center justify-center py-2 text-slate-400 text-xs gap-2">
              <div className="animate-spin w-3.5 h-3.5 border-2 border-sky-400 border-t-transparent rounded-full" />
              <span>Cargando goles...</span>
            </div>
          ) : goals && goals.length > 0 ? (
            <div className="space-y-1.5">
              {goals.map((goal, idx) => {
                const isHome = goal.isHome === true;
                const name = goal.playerName || goal.player?.shortName || goal.player?.name || 'Gol';
                const timeStr = goal.addedTime ? `${goal.time}+${goal.addedTime}'` : `${goal.time}'`;

                return (
                  <div key={idx} className={`flex items-center gap-2 text-xs ${isHome ? 'justify-start' : 'justify-end'}`}>
                    <span className="text-slate-400 font-mono text-[10px] bg-white/5 px-1.5 py-0.5 rounded">
                      {timeStr}
                    </span>
                    <span>⚽</span>
                    <span className="font-semibold text-slate-200">
                      {name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      ({isHome ? hName : aName})
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-1 text-xs text-slate-400">
              No se registraron goles
            </div>
          )}
        </div>
      )}
    </div>
  );
}
