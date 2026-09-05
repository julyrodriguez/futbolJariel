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
  getTeamLogo 
} from '../lib/footballUtils';

interface MatchRowProps {
  match: Match;
}

export default function MatchRow({ match }: MatchRowProps) {
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

  const startTimeStr = match.startTimestamp
    ? new Date(match.startTimestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className="border-b border-white/[0.05] last:border-0">
      <div 
        onClick={() => {
          if (matchId) router.push(`/match/${matchId}`);
        }}
        className={`group grid grid-cols-[60px_1fr_auto_1fr] sm:grid-cols-[70px_1fr_auto_1fr] items-center px-2.5 sm:px-4 py-2 hover:bg-white/[0.04] transition-colors cursor-pointer select-none ${
          status.isLive ? 'bg-red-500/[0.03]' : ''
        }`}
      >
        {/* Col 1: Time / Status */}
        <div className="flex flex-col items-center justify-center pr-2 border-r border-white/5 shrink-0 whitespace-nowrap">
          {status.isLive ? (
            <span className="text-[10px] font-black text-red-400 animate-pulse leading-none flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {liveTime || 'VIVO'}
            </span>
          ) : status.hasStarted ? (
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">
              {status.isPenalties ? 'Pen' : 'Final'}
            </span>
          ) : (
            <span className="text-[11px] font-mono font-bold text-slate-300 leading-none">
              {startTimeStr || 'Pend.'}
            </span>
          )}
        </div>

        {/* Col 2: Home Team (Name + Logo) */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-2 px-1.5 sm:px-2 text-right min-w-0">
          <span className="text-xs sm:text-[13px] font-bold text-slate-100 group-hover:text-sky-300 transition-colors truncate">
            {hName}
          </span>
          <TeamLogo logoUrl={hLogo} teamName={hName} className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
        </div>

        {/* Col 3: Scoreboard Box (Always single line, no wrap) */}
        <div className="flex items-center justify-center px-1 sm:px-2 shrink-0">
          {status.hasStarted ? (
            <div className={`px-2.5 py-0.5 rounded font-mono font-black text-xs sm:text-sm tracking-tight border whitespace-nowrap inline-flex items-center justify-center gap-1 min-w-[54px] ${
              status.isLive 
                ? 'bg-red-500/15 border-red-500/30 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.2)]'
                : 'bg-black/40 border-white/10 text-white'
            }`}>
              <span>{hScore ?? 0}</span>
              <span className="text-slate-500 font-normal select-none">-</span>
              <span>{aScore ?? 0}</span>
            </div>
          ) : (
            <div className="px-2 py-0.5 rounded bg-white/5 border border-white/5 font-mono text-[11px] text-slate-500 whitespace-nowrap inline-flex items-center justify-center min-w-[36px]">
              -
            </div>
          )}
        </div>

        {/* Col 4: Away Team (Logo + Name) */}
        <div className="flex items-center justify-start gap-1.5 sm:gap-2 px-1.5 sm:px-2 text-left min-w-0">
          <TeamLogo logoUrl={aLogo} teamName={aName} className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
          <span className="text-xs sm:text-[13px] font-bold text-slate-100 group-hover:text-sky-300 transition-colors truncate">
            {aName}
          </span>
        </div>
      </div>
    </div>
  );
}
