'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import DatePickerStrip from './DatePickerStrip';
import TournamentCard from './TournamentCard';
import MatchRow from './MatchRow';
import { 
  Match, 
  parseMatchStatus, 
  sanitizeMatch, 
  sortRounds 
} from '../lib/footballUtils';
import { LEAGUES, LeagueId } from '../lib/leagues';
import { Trophy, BarChart2, AlertCircle, RefreshCw } from 'lucide-react';

interface MatchesHubProps {
  leagueId?: string; // default 'general'
}

export default function MatchesHub({ leagueId = 'general' }: MatchesHubProps) {
  const activeLeague = LEAGUES.find(l => l.id === leagueId) || LEAGUES[0];
  const isGeneral = leagueId === 'general';
  const tournamentId = activeLeague.tournamentId;

  // Date selection for general view
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });

  // Filters & State
  const [showLiveOnly, setShowLiveOnly] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // League specific: round
  const [selectedRound, setSelectedRound] = useState<string>('');
  const [allLeagueMatches, setAllLeagueMatches] = useState<Match[]>([]);

  // Fetch logic
  const fetchMatches = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (isGeneral) {
        // Daily matches across all tournaments
        const res = await fetch(`https://apivacas.jariel.com.ar/api/matches/optimized?date=${selectedDate}&direction=1`);
        if (!res.ok) throw new Error('Error al cargar partidos de la fecha');
        const data = await res.json();
        const rawList = data.matches || (Array.isArray(data) ? data : []);
        const sanitized = rawList.map(sanitizeMatch);
        setMatches(sanitized);
      } else if (tournamentId) {
        // Specific league: all matches
        const res = await fetch(`https://apivacas.jariel.com.ar/api/matches/all?tournamentId=${tournamentId}`);
        if (!res.ok) throw new Error('Error al cargar partidos del torneo');
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.matches || []);
        const sanitized = list.map(sanitizeMatch);
        setAllLeagueMatches(sanitized);

        // Auto-select latest or current round
        const rounds = Array.from(new Set(sanitized.map((m: any) => m.round_name).filter(Boolean))) as string[];
        const sorted = sortRounds(rounds);
        if (sorted.length > 0) {
          const currentRound = sorted.find(r => 
            sanitized.some((m: any) => m.round_name === r && !parseMatchStatus(m).isFinished)
          ) || sorted[sorted.length - 1];
          setSelectedRound(prev => prev || currentRound);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  }, [isGeneral, selectedDate, tournamentId]);

  useEffect(() => {
    fetchMatches();
    const interval = setInterval(fetchMatches, 25000); // Poll live scores every 25s
    return () => clearInterval(interval);
  }, [fetchMatches]);

  // Extract available rounds for league
  const availableRounds = useMemo(() => {
    if (isGeneral || allLeagueMatches.length === 0) return [];
    const set = new Set<string>();
    allLeagueMatches.forEach((m: any) => {
      if (m.round_name) set.add(m.round_name);
    });
    return sortRounds(Array.from(set));
  }, [isGeneral, allLeagueMatches]);

  // Determine current active match list
  const currentList = useMemo(() => {
    let list: Match[] = [];

    if (isGeneral) {
      list = matches;
    } else {
      if (selectedRound) {
        list = allLeagueMatches.filter((m: any) => m.round_name === selectedRound);
      } else {
        list = allLeagueMatches;
      }
    }

    if (showLiveOnly) {
      return list.filter(m => parseMatchStatus(m).isLive);
    }

    return list;
  }, [isGeneral, matches, allLeagueMatches, selectedRound, showLiveOnly]);

  // Count Live matches
  const liveCount = useMemo(() => {
    const pool = isGeneral ? matches : allLeagueMatches;
    return pool.filter(m => parseMatchStatus(m).isLive).length;
  }, [isGeneral, matches, allLeagueMatches]);

  // Group by Tournament (for General View)
  const groupedByTournament = useMemo(() => {
    if (!isGeneral) return null;
    const map = new Map<string, { name: string; flag?: string; tournamentId?: number; matches: Match[] }>();

    currentList.forEach(m => {
      const tName = m.tournament_name || m.tournament?.name || 'Varios';
      const flag = m.tournament?.category?.flag;
      const tId = m.tournament?.id || (m as any).tournament_id;
      if (!map.has(tName)) {
        map.set(tName, { name: tName, flag, tournamentId: tId, matches: [] });
      }
      map.get(tName)!.matches.push(m);
    });

    return Array.from(map.values());
  }, [isGeneral, currentList]);

  return (
    <div className="space-y-4 pb-16">
      
      {/* 1. League Subheader & Tab Switcher (if on a specific league) */}
      {!isGeneral && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#101726]/80 px-4 py-3 rounded-2xl border border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{activeLeague.icon}</span>
            <div>
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
                {activeLeague.name}
              </h1>
              <p className="text-[11px] text-slate-400">
                Fixture y resultados oficiales
              </p>
            </div>
          </div>

          <Link
            href={`/liga/${leagueId}/tabla`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 transition-colors"
          >
            <BarChart2 className="w-3.5 h-3.5 text-sky-400" />
            Ver Tabla de Posiciones
          </Link>
        </div>
      )}

      {/* 2. Controls / Date / Round Picker */}
      {isGeneral ? (
        <DatePickerStrip
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          showLiveOnly={showLiveOnly}
          onToggleLiveOnly={() => setShowLiveOnly(!showLiveOnly)}
          liveCount={liveCount}
        />
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2.5 bg-[#101726]/60 px-3.5 py-2.5 rounded-2xl border border-white/[0.08]">
          
          {/* Round Selector Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Fecha / Jornada:</span>
            <select
              value={selectedRound}
              onChange={(e) => setSelectedRound(e.target.value)}
              className="bg-black/50 border border-white/15 rounded-xl px-2.5 py-1 text-xs text-white font-bold outline-none cursor-pointer hover:border-sky-400 transition-colors"
            >
              {availableRounds.map(r => (
                <option key={r} value={r} className="bg-[#101726] text-white">
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Live Filter Toggle */}
          <button
            onClick={() => setShowLiveOnly(!showLiveOnly)}
            className={`flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
              showLiveOnly
                ? 'bg-red-500 text-white border-red-400 shadow-md shadow-red-500/30'
                : 'bg-white/5 text-slate-300 border-white/5 hover:border-white/20 hover:text-white'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${showLiveOnly ? 'bg-white animate-ping' : 'bg-red-500 animate-pulse'}`} />
            <span>EN VIVO</span>
            {liveCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${showLiveOnly ? 'bg-red-700 text-white' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                {liveCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* 3. Match List or Loading States (Elnine format: Tournament Containers with compact rows) */}
      {loading && currentList.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center gap-2.5">
          <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-semibold">Cargando partidos...</span>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-[#101726]/50 border border-white/5 text-center">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white mb-1">No se pudieron cargar los partidos</h3>
          <p className="text-xs text-slate-400 mb-3">{error}</p>
          <button
            onClick={fetchMatches}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" /> Reintentar
          </button>
        </div>
      ) : currentList.length === 0 ? (
        <div className="p-10 rounded-2xl bg-[#101726]/40 border border-white/5 text-center space-y-2">
          <div className="text-2xl mb-1">⚽</div>
          <h3 className="text-sm font-bold text-white">
            {showLiveOnly ? 'No hay partidos en vivo en este momento' : 'No hay partidos programados'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {showLiveOnly
              ? 'Desactivá el filtro "EN VIVO" para ver todos los resultados y partidos del día.'
              : 'Probá seleccionando otra fecha en el calendario o navegando entre las distintas ligas.'}
          </p>
          {showLiveOnly && (
            <button
              onClick={() => setShowLiveOnly(false)}
              className="mt-2 px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-xs font-bold text-white transition-colors cursor-pointer"
            >
              Ver todos los partidos
            </button>
          )}
        </div>
      ) : isGeneral && groupedByTournament ? (
        /* General View: Grouped into Tournament Cards */
        <div className="space-y-3">
          {groupedByTournament.map((group, gIdx) => (
            <TournamentCard
              key={gIdx}
              tournamentName={group.name}
              flag={group.flag}
              tournamentId={group.tournamentId}
              matches={group.matches}
            />
          ))}
        </div>
      ) : (
        /* Specific League: Container Card for current round */
        <div className="space-y-3">
          <TournamentCard
            tournamentName={activeLeague.name}
            tournamentId={activeLeague.tournamentId || undefined}
            matches={currentList}
          />
        </div>
      )}

    </div>
  );
}
