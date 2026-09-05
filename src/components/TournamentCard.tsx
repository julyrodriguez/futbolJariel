'use client';

import Link from 'next/link';
import MatchRow from './MatchRow';
import { Match } from '../lib/footballUtils';
import { Trophy, ChevronRight } from 'lucide-react';

interface TournamentCardProps {
  tournamentName: string;
  flag?: string;
  tournamentId?: number;
  matches: Match[];
}

export default function TournamentCard({
  tournamentName,
  flag,
  tournamentId,
  matches
}: TournamentCardProps) {
  // Try to find if there's a round name common to the matches
  const roundName = matches[0]?.round_name;

  return (
    <div className="bg-[#101726]/80 rounded-2xl border border-white/[0.08] overflow-hidden shadow-sm hover:border-white/15 transition-colors mb-4">
      {/* Tournament Card Header (Elnine style) */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-[#0B0F17]/90 border-b border-white/[0.08]">
        <div className="flex items-center gap-2 truncate">
          <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-extrabold text-xs sm:text-[13px] text-white tracking-tight truncate">
            {tournamentName}
          </span>
          {roundName && (
            <span className="text-[11px] text-slate-400 font-medium shrink-0">
              • {roundName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
            {matches.length} {matches.length === 1 ? 'partido' : 'partidos'}
          </span>
        </div>
      </div>

      {/* Matches List inside the container */}
      <div className="divide-y divide-white/[0.04]">
        {matches.map((m) => (
          <MatchRow key={m.id || m._id || (m as any).matchId} match={m} />
        ))}
      </div>
    </div>
  );
}
