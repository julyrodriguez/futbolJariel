'use client';

import Link from 'next/link';
import { LEAGUES, LeagueId } from '../lib/leagues';

interface LeagueBarProps {
  currentLeagueId?: string;
  basePath?: string; // 'partidos' | 'tabla'
}

export default function LeagueBar({ currentLeagueId = 'general', basePath = 'partidos' }: LeagueBarProps) {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-3">
      <div className="flex items-center gap-2 min-w-max px-1">
        {LEAGUES.map((league) => {
          const isSelected = league.id === currentLeagueId;
          const href = league.id === 'general' 
            ? '/partidos' 
            : `/liga/${league.id}/${basePath}`;

          return (
            <Link
              key={league.id}
              href={href}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 border cursor-pointer select-none ${
                isSelected
                  ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/25 scale-[1.02]'
                  : 'bg-[#101726]/80 text-slate-300 border-white/5 hover:border-white/20 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-sm shrink-0">{league.icon}</span>
              <span className="whitespace-nowrap">{league.shortName || league.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
