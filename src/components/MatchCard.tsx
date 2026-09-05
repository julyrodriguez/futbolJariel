'use client';

import { useState } from 'react';
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
import { ChevronDown, Trophy } from 'lucide-react';

interface MatchCardProps {
  match: Match;
  showTournamentHeader?: boolean;
}

export default function MatchCard({ match, showTournamentHeader = false }: MatchCardProps) {
  const router = useRouter();
  const [goalsOpen, setGoalsOpen] = useState(false);
  const [goalsLoading, setGoalsLoading] = useState(false);
  const [goals, setGoals] = useState<any[] | null>(null);

  const matchId = match.id || match._id || (match as any).matchId;
  const status = parseMatchStatus(match);
  const hName = getTeamName(match, 'home');
  const aName = getTeamName(match, 'away');
  const hLogo = getTeamLogo(match, 'home');
  const aLogo = getTeamLogo(match, 'away');
  const hScore = getScore(match, 'home');
  const aScore = getScore(match, 'away');
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
    fetch(`https://apivacas.jariel.com.ar/api/matches/detail/${matchId}`)
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
      onClick={() => {
        if (matchId) router.push(`/match/${matchId}`);
      }}
      className={`group relative bg-[#101726]/80 hover:bg-[#141e33] border rounded-xl transition-all duration-150 cursor-pointer overflow-hidden shadow-sm hover:shadow-md hover:border-sky-500/30 ${
        status.isLive 
          ? 'border-red-500/40 bg-gradient-to-r from-red-500/[0.06] via-[#101726]/80 to-transparent' 
          : 'border-white/[0.07] hover:border-white/20'
      }`}
    >
      {/* Optional Tournament Sub-header if requested */}
      {showTournamentHeader && (
        <div className="flex items-center justify-between px-3 py-1 border-b border-white/5 bg-black/20 text-[10px] font-bold text-slate-400">
          <div className="flex items-center gap-1.5 truncate">
            <Trophy className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="text-slate-300 truncate">{match.tournament_name || match.tournament?.name || 'Fútbol'}</span>
          </div>
          {match.round_name && (
            <span className="text-slate-400 font-medium shrink-0">{match.round_name}</span>
          )}
        </div>
      )}

      {/* Main Stadium Layout - Compact & Crisp */}
      <div className="px-3.5 py-2.5 sm:py-3">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3">
          
          {/* Home Team */}
          <div className="flex items-center justify-end gap-2 text-right min-w-0">
            <span className="text-xs sm:text-[13px] font-bold text-slate-100 group-hover:text-sky-300 transition-colors truncate max-w-[110px] sm:max-w-[150px]">
              {hName}
            </span>
            <TeamLogo logoUrl={hLogo} teamName={hName} className="w-6 h-6 sm:w-7 sm:h-7 shrink-0" />
          </div>

          {/* Central Scoreboard / Status */}
          <div className="flex flex-col items-center justify-center min-w-[70px] sm:min-w-[85px] shrink-0">
            {status.isLive ? (
              <div className="flex flex-col items-center">
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/40 mb-0.5 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  {liveTime || 'VIVO'}
                </span>
                <div className="flex items-center gap-1.5 text-base sm:text-lg font-black text-red-400 tracking-tight leading-none">
                  <span>{hScore ?? 0}</span>
                  <span className="text-slate-600 font-light text-xs">-</span>
                  <span>{aScore ?? 0}</span>
                </div>
              </div>
            ) : status.hasStarted ? (
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
                  {status.isPenalties ? 'Penales' : 'Final'}
                </span>
                <div className="flex items-center gap-1.5 text-base sm:text-lg font-black text-white tracking-tight leading-none">
                  <span className={hScore !== null && aScore !== null && hScore > aScore ? 'text-sky-400' : 'text-slate-100'}>
                    {hScore ?? 0}
                  </span>
                  <span className="text-slate-600 font-light text-xs">-</span>
                  <span className={hScore !== null && aScore !== null && aScore > hScore ? 'text-sky-400' : 'text-slate-100'}>
                    {aScore ?? 0}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[11px] font-bold text-slate-200">
                  {startTimeStr || 'Pendiente'}
                </div>
              </div>
            )}
          </div>

          {/* Away Team */}
          <div className="flex items-center justify-start gap-2 text-left min-w-0">
            <TeamLogo logoUrl={aLogo} teamName={aName} className="w-6 h-6 sm:w-7 sm:h-7 shrink-0" />
            <span className="text-xs sm:text-[13px] font-bold text-slate-100 group-hover:text-sky-300 transition-colors truncate max-w-[110px] sm:max-w-[150px]">
              {aName}
            </span>
          </div>

        </div>

        {/* Mini Footer: Quick info & subtle goals button if finished/live */}
        {status.hasStarted && (
          <div className="mt-1.5 pt-1.5 border-t border-white/[0.03] flex items-center justify-between text-[10px] text-slate-500">
            <button
              onClick={loadGoals}
              className="flex items-center gap-1 font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <span>{goalsOpen ? 'Ocultar goles' : 'Goles'}</span>
              <ChevronDown className={`w-2.5 h-2.5 transition-transform ${goalsOpen ? 'rotate-180' : ''}`} />
            </button>
            <span className="text-slate-500 group-hover:text-sky-400 transition-colors">
              Detalles & H2H →
            </span>
          </div>
        )}
      </div>

      {/* Collapsed goals drawer */}
      {goalsOpen && (
        <div className="px-3 py-2 border-t border-white/5 bg-[#080d16]/90 text-[11px] animate-in fade-in-0 duration-150">
          {goalsLoading ? (
            <div className="flex items-center justify-center py-1 text-slate-400 gap-1.5">
              <div className="animate-spin w-3 h-3 border-2 border-sky-400 border-t-transparent rounded-full" />
              <span>Cargando goles...</span>
            </div>
          ) : goals && goals.length > 0 ? (
            <div className="space-y-1">
              {goals.map((goal, idx) => {
                const isHome = goal.isHome === true;
                const name = goal.playerName || goal.player?.shortName || goal.player?.name || 'Gol';
                const timeStr = goal.addedTime ? `${goal.time}+${goal.addedTime}'` : `${goal.time}'`;

                return (
                  <div key={idx} className={`flex items-center gap-1.5 ${isHome ? 'justify-start' : 'justify-end'}`}>
                    <span className="text-[10px] text-slate-400 font-mono bg-white/5 px-1 py-0.2 rounded">
                      {timeStr}
                    </span>
                    <span>⚽</span>
                    <span className="font-semibold text-slate-200 truncate max-w-[160px]">
                      {name}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-0.5 text-slate-400 text-[10px]">
              No se registraron goles
            </div>
          )}
        </div>
      )}
    </div>
  );
}
