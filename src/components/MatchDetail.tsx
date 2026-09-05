'use client';

import { useState, useEffect, useMemo } from 'react';
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
  getTeamId,
  sanitizeMatch,
  translateTeamToSpanish 
} from '../lib/footballUtils';
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  Trophy, 
  Activity, 
  Tv, 
  BarChart2, 
  Users, 
  History,
  AlertCircle,
  Play,
  RefreshCw
} from 'lucide-react';

interface MatchDetailProps {
  matchId: string;
}

export default function MatchDetail({ matchId }: MatchDetailProps) {
  const router = useRouter();
  const [matchData, setMatchData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tabs: 'historial' | 'resumen' | 'alineaciones' | 'estadisticas' | 'transmision'
  const [activeTab, setActiveTab] = useState<'historial' | 'resumen' | 'alineaciones' | 'estadisticas' | 'transmision'>('historial');

  // H2H state
  const [h2hMatches, setH2hMatches] = useState<any[]>([]);
  const [h2hLoading, setH2hLoading] = useState(false);
  const [h2hLimit, setH2hLimit] = useState<number>(10);
  const [h2hVenueFilter, setH2hVenueFilter] = useState<'all' | 'same_venue'>('all');

  // Stream state
  const [streams, setStreams] = useState<any[]>([]);
  const [streamLoading, setStreamLoading] = useState(false);
  const [selectedStreamUrl, setSelectedStreamUrl] = useState<string | null>(null);

  const fetchDetail = async () => {
    if (!matchId || matchId === 'undefined' || matchId === 'null') {
      setError('ID de partido no especificado');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`https://apivacas.jariel.com.ar/api/matches/detail/${matchId}`);
      if (!res.ok) throw new Error('No se pudo cargar la información del partido');
      const data = await res.json();
      const rawEvent = data.events ? data.events[0] : (data.matches ? data.matches[0] : data);
      
      if (!rawEvent || (typeof rawEvent === 'object' && Object.keys(rawEvent).length === 0)) {
        throw new Error('No se encontraron datos para este encuentro');
      }

      const event = sanitizeMatch(rawEvent);
      setMatchData(event);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // Load Match Details
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchDetail();
    const interval = setInterval(() => {
      if (isMounted) fetchDetail();
    }, 20000); // Poll every 20s

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [matchId]);

  const match: Match = matchData || {};
  const status = parseMatchStatus(match);
  const hName = getTeamName(match, 'home');
  const aName = getTeamName(match, 'away');
  const hLogo = getTeamLogo(match, 'home');
  const aLogo = getTeamLogo(match, 'away');
  const hScore = getScore(match, 'home');
  const aScore = getScore(match, 'away');
  const hId = getTeamId(match, 'home');
  const aId = getTeamId(match, 'away');

  // Load H2H data once team IDs are available
  useEffect(() => {
    if (!hId || !aId) return;
    setH2hLoading(true);

    fetch(`https://apivacas.jariel.com.ar/api/matches/h2h?teamA=${hId}&teamB=${aId}&limit=50`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setH2hMatches(data);
        }
      })
      .catch(err => console.error('Error fetching H2H:', err))
      .finally(() => setH2hLoading(false));
  }, [hId, aId]);

  // Load Streams if live or starting soon
  useEffect(() => {
    if (!hName || !aName || hName === 'Local' || aName === 'Visitante') return;
    setStreamLoading(true);

    fetch(`/api/stream?home=${encodeURIComponent(hName)}&away=${encodeURIComponent(aName)}`)
      .then(r => r.json())
      .then(d => {
        if (d?.matched?.streams) {
          setStreams(d.matched.streams);
          if (d.matched.streams.length > 0 && d.matched.streams[0].streamUrl) {
            setSelectedStreamUrl(d.matched.streams[0].streamUrl);
          }
        }
      })
      .catch(err => console.error('Error fetching stream:', err))
      .finally(() => setStreamLoading(false));
  }, [hName, aName]);

  // Calculate H2H Statistics
  const h2hStats = useMemo(() => {
    if (!hId || !aId || h2hMatches.length === 0) return null;

    let filtered = h2hMatches;
    if (h2hVenueFilter === 'same_venue') {
      filtered = filtered.filter(m => (m.homeTeam?.id || m.home_team?.id) === hId);
    }
    const sliced = filtered.slice(0, h2hLimit);

    let homeWins = 0;
    let awayWins = 0;
    let draws = 0;
    let homeGoals = 0;
    let awayGoals = 0;

    sliced.forEach(m => {
      const isTeamAHome = (m.homeTeam?.id || m.home_team?.id) === hId;
      const mHScore = m.homeScore?.current ?? m.homeTeam?.score ?? m.home_team?.score ?? 0;
      const mAScore = m.awayScore?.current ?? m.awayTeam?.score ?? m.away_team?.score ?? 0;

      const teamAScore = isTeamAHome ? mHScore : mAScore;
      const teamBScore = isTeamAHome ? mAScore : mHScore;

      homeGoals += teamAScore;
      awayGoals += teamBScore;

      if (teamAScore > teamBScore) homeWins++;
      else if (teamBScore > teamAScore) awayWins++;
      else draws++;
    });

    const total = sliced.length;
    return {
      total,
      homeWins,
      draws,
      awayWins,
      homeGoals,
      awayGoals,
      homeWinPct: total > 0 ? Math.round((homeWins / total) * 100) : 0,
      drawPct: total > 0 ? Math.round((draws / total) * 100) : 0,
      awayWinPct: total > 0 ? Math.round((awayWins / total) * 100) : 0,
      matches: sliced
    };
  }, [h2hMatches, hId, aId, h2hVenueFilter, h2hLimit]);

  if (loading && !matchData) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-3 border-sky-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-slate-400 text-xs font-semibold">Cargando detalles del partido...</span>
      </div>
    );
  }

  if (error || !matchData) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
        <h3 className="text-base font-bold text-white mb-1">Partido no disponible</h3>
        <p className="text-xs text-slate-400 mb-4">{error || 'No se pudo cargar la información del partido'}</p>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchDetail}
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-xs font-bold text-white transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reintentar
          </button>
          <button
            onClick={() => router.push('/partidos')}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors cursor-pointer"
          >
            Volver a Partidos
          </button>
        </div>
      </div>
    );
  }

  const incidents: any[] = matchData.incidents || [];
  const lineups = matchData.lineups || {};
  const stats = matchData.statistics?.[0]?.groups || [];

  return (
    <div className="space-y-6 pb-16">
      
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver</span>
      </button>

      {/* ── STADIUM SCOREBOARD HERO ── */}
      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-b from-[#111927] to-[#0B0F17] shadow-2xl p-5 sm:p-7">
        
        {/* Top Tournament Pill */}
        <div className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-400 border-b border-white/5 pb-3 mb-5">
          <div className="flex items-center gap-2 truncate">
            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-white font-bold truncate">{match.tournament_name || match.tournament?.name || 'Torneo'}</span>
            {match.round_name && <span className="text-slate-400 shrink-0">• {match.round_name}</span>}
          </div>
          {match.startTimestamp && (
            <div className="flex items-center gap-1 text-[11px] text-slate-400 shrink-0">
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              <span>{new Date(match.startTimestamp * 1000).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
            </div>
          )}
        </div>

        {/* Scoreboard Arena */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-8">
          
          {/* Home Team */}
          <Link href={hId ? `/team/${hId}` : '#'} className="flex flex-col items-center text-center group">
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl p-2 bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform">
              <TeamLogo logoUrl={hLogo} teamName={hName} className="w-full h-full" />
            </div>
            <h2 className="mt-2 text-xs sm:text-base font-black text-white group-hover:text-sky-400 transition-colors line-clamp-2 max-w-[120px] sm:max-w-[180px]">
              {hName}
            </h2>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Local</span>
          </Link>

          {/* Central Scoreboard */}
          <div className="flex flex-col items-center justify-center">
            {status.isLive ? (
              <div className="flex flex-col items-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse mb-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  {getMatchTime(match)}
                </span>
                <div className="flex items-center gap-3 sm:gap-4 text-3xl sm:text-5xl font-black text-red-400">
                  <span>{hScore ?? 0}</span>
                  <span className="text-slate-600 font-light text-xl sm:text-3xl">-</span>
                  <span>{aScore ?? 0}</span>
                </div>
              </div>
            ) : status.hasStarted ? (
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                  {status.isPenalties ? 'Final (Penales)' : 'Final'}
                </span>
                <div className="flex items-center gap-3 sm:gap-4 text-3xl sm:text-5xl font-black text-white">
                  <span className={hScore !== null && aScore !== null && hScore > aScore ? 'text-sky-400' : 'text-slate-100'}>
                    {hScore ?? 0}
                  </span>
                  <span className="text-slate-600 font-light text-xl sm:text-3xl">-</span>
                  <span className={hScore !== null && aScore !== null && aScore > hScore ? 'text-sky-400' : 'text-slate-100'}>
                    {aScore ?? 0}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                  {status.label}
                </span>
                <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-lg sm:text-xl font-black text-slate-200">
                  {match.startTimestamp
                    ? new Date(match.startTimestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'Pendiente'}
                </div>
              </div>
            )}
          </div>

          {/* Away Team */}
          <Link href={aId ? `/team/${aId}` : '#'} className="flex flex-col items-center text-center group">
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl p-2 bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform">
              <TeamLogo logoUrl={aLogo} teamName={aName} className="w-full h-full" />
            </div>
            <h2 className="mt-2 text-xs sm:text-base font-black text-white group-hover:text-sky-400 transition-colors line-clamp-2 max-w-[120px] sm:max-w-[180px]">
              {aName}
            </h2>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Visitante</span>
          </Link>

        </div>
      </div>

      {/* ── NAVIGATION TABS ── */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('historial')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'historial'
              ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-lg shadow-sky-500/25'
              : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          Historial H2H
        </button>

        <button
          onClick={() => setActiveTab('resumen')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'resumen'
              ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-lg shadow-sky-500/25'
              : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Incidencias
        </button>

        <button
          onClick={() => setActiveTab('alineaciones')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'alineaciones'
              ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-lg shadow-sky-500/25'
              : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Alineaciones
        </button>

        <button
          onClick={() => setActiveTab('estadisticas')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'estadisticas'
              ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-lg shadow-sky-500/25'
              : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          Estadísticas
        </button>

        {streams.length > 0 && (
          <button
            onClick={() => setActiveTab('transmision')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'transmision'
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/25'
                : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            Transmisión ({streams.length})
          </button>
        )}
      </div>

      {/* ── TAB CONTENT ── */}

      {/* 1. HISTORIAL H2H */}
      {activeTab === 'historial' && (
        <div className="space-y-5 animate-in fade-in-50 duration-200">
          
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#101726]/60 p-4 rounded-2xl border border-white/5">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-sky-400" />
                Historial de Enfrentamientos Directos
              </h3>
              <p className="text-xs text-slate-400">
                Antecedentes oficiales entre {hName} y {aName}
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={h2hLimit}
                onChange={(e) => setH2hLimit(Number(e.target.value))}
                className="bg-black/40 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-slate-300 font-semibold outline-none cursor-pointer"
              >
                <option value={5}>Últimos 5</option>
                <option value={10}>Últimos 10</option>
                <option value={20}>Últimos 20</option>
              </select>

              <select
                value={h2hVenueFilter}
                onChange={(e) => setH2hVenueFilter(e.target.value as any)}
                className="bg-black/40 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-slate-300 font-semibold outline-none cursor-pointer"
              >
                <option value="all">Todas las canchas</option>
                <option value="same_venue">Solo con {hName} local</option>
              </select>
            </div>
          </div>

          {h2hLoading ? (
            <div className="py-10 flex flex-col items-center justify-center gap-2">
              <div className="w-7 h-7 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-slate-400">Cargando historial...</span>
            </div>
          ) : h2hStats && h2hStats.total > 0 ? (
            <div className="space-y-5">
              
              {/* Summary Scorecard Bar */}
              <div className="bg-[#101726]/80 rounded-2xl border border-white/5 p-4">
                <div className="grid grid-cols-3 text-center mb-2.5">
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-sky-400">{h2hStats.homeWins}</div>
                    <div className="text-[11px] font-bold text-slate-400 truncate">{hName}</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-slate-300">{h2hStats.draws}</div>
                    <div className="text-[11px] font-bold text-slate-400">Empates</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-cyan-400">{h2hStats.awayWins}</div>
                    <div className="text-[11px] font-bold text-slate-400 truncate">{aName}</div>
                  </div>
                </div>

                {/* Progress Bar Breakdown */}
                <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden flex border border-white/5">
                  <div 
                    style={{ width: `${h2hStats.homeWinPct}%` }}
                    className="bg-gradient-to-r from-blue-600 to-sky-500 h-full"
                    title={`${hName}: ${h2hStats.homeWinPct}%`}
                  />
                  <div 
                    style={{ width: `${h2hStats.drawPct}%` }}
                    className="bg-slate-600 h-full"
                    title={`Empates: ${h2hStats.drawPct}%`}
                  />
                  <div 
                    style={{ width: `${h2hStats.awayWinPct}%` }}
                    className="bg-cyan-400 h-full"
                    title={`${aName}: ${h2hStats.awayWinPct}%`}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5">
                  <span>{h2hStats.homeGoals} goles</span>
                  <span className="font-semibold text-slate-300">{h2hStats.total} partidos computados</span>
                  <span>{h2hStats.awayGoals} goles</span>
                </div>
              </div>

              {/* List of Past Matches */}
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                  Enfrentamientos Previos
                </h4>

                {h2hStats.matches.map((m, idx) => {
                  const mHName = getTeamName(m, 'home');
                  const mAName = getTeamName(m, 'away');
                  const mHLogo = getTeamLogo(m, 'home');
                  const mALogo = getTeamLogo(m, 'away');
                  const mHScore = getScore(m, 'home');
                  const mAScore = getScore(m, 'away');
                  const dateStr = m.startTimestamp
                    ? new Date(m.startTimestamp * 1000).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
                    : '';

                  return (
                    <div 
                      key={m.id || m._id || idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#101726]/50 hover:bg-[#101726] border border-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-slate-400 min-w-[70px]">
                          {dateStr}
                        </span>
                        <span className="text-[11px] text-slate-500 font-semibold hidden md:inline truncate max-w-[130px]">
                          {m.tournament_name || m.tournament?.name || 'Oficial'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 flex-1 justify-center max-w-sm">
                        <div className="flex items-center gap-1.5 justify-end flex-1 min-w-0">
                          <span className={`text-xs font-bold truncate ${mHScore !== null && mAScore !== null && mHScore > mAScore ? 'text-sky-400' : 'text-slate-200'}`}>
                            {mHName}
                          </span>
                          <TeamLogo logoUrl={mHLogo} teamName={mHName} className="w-5 h-5 shrink-0" />
                        </div>

                        <div className="px-2.5 py-0.5 rounded-lg bg-black/40 border border-white/10 text-xs font-black text-white shrink-0 whitespace-nowrap inline-flex items-center justify-center gap-1">
                          {mHScore ?? 0} - {mAScore ?? 0}
                        </div>

                        <div className="flex items-center gap-1.5 justify-start flex-1 min-w-0">
                          <TeamLogo logoUrl={mALogo} teamName={mAName} className="w-5 h-5 shrink-0" />
                          <span className={`text-xs font-bold truncate ${mHScore !== null && mAScore !== null && mAScore > mHScore ? 'text-sky-400' : 'text-slate-200'}`}>
                            {mAName}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          ) : (
            <div className="bg-[#101726]/40 rounded-2xl border border-white/5 p-6 text-center text-slate-400 text-xs">
              No se registran enfrentamientos directos previos en nuestra base de datos.
            </div>
          )}

        </div>
      )}

      {/* 2. RESUMEN / INCIDENCIAS */}
      {activeTab === 'resumen' && (
        <div className="space-y-4 animate-in fade-in-50 duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-400" />
              Línea de Tiempo del Partido
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">
              {incidents.length} {incidents.length === 1 ? 'evento' : 'eventos'}
            </span>
          </div>

          {incidents && incidents.length > 0 ? (
            <div className="bg-[#101726]/60 rounded-2xl border border-white/5 overflow-hidden">
              
              {/* Header con equipos a cada lado */}
              <div className="grid grid-cols-[1fr_auto_1fr] items-center px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center justify-end gap-2 min-w-0 pr-2">
                  <span className="text-xs font-bold text-white truncate text-right">{hName}</span>
                  <TeamLogo logoUrl={hLogo} teamName={hName} className="w-5 h-5 shrink-0" />
                </div>

                <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0">
                  MIN
                </div>

                <div className="flex items-center justify-start gap-2 min-w-0 pl-2">
                  <TeamLogo logoUrl={aLogo} teamName={aName} className="w-5 h-5 shrink-0" />
                  <span className="text-xs font-bold text-white truncate text-left">{aName}</span>
                </div>
              </div>

              {/* Timeline con eje central */}
              <div className="relative py-4 px-2 sm:px-4">
                {/* Línea central vertical */}
                <div className="absolute left-1/2 top-2 bottom-2 -translate-x-1/2 w-px bg-white/10 pointer-events-none" />

                <div className="space-y-3 relative z-10">
                  {incidents.map((inc, idx) => {
                    const type = inc.incidentType;
                    const isHome = inc.isHome === true;
                    const isAway = inc.isHome === false;
                    const timeStr = inc.addedTime ? `${inc.time}+${inc.addedTime}'` : inc.time ? `${inc.time}'` : '';

                    // Eventos de período o tiempo añadido (centrados)
                    if (type === 'period') {
                      let pText = inc.text || '';
                      const lower = pText.toLowerCase();
                      if (lower.includes('1t') || lower.includes('1st') || lower.includes('inicio')) pText = 'Inicio del Partido';
                      else if (lower.includes('ht') || lower.includes('halftime') || lower.includes('entretiempo')) pText = 'Entretiempo';
                      else if (lower.includes('2t') || lower.includes('2nd')) pText = 'Segundo Tiempo';
                      else if (lower.includes('ft') || lower.includes('fulltime') || lower.includes('final')) pText = 'Final del Partido';
                      else if (lower.includes('et') || lower.includes('extratime')) pText = 'Tiempo Suplementario';
                      else if (lower.includes('pen')) pText = 'Penales';

                      const hasScore = inc.homeScore !== undefined && inc.awayScore !== undefined;
                      const scoreText = hasScore ? `(${inc.homeScore} - ${inc.awayScore})` : '';

                      return (
                        <div key={idx} className="flex items-center justify-center my-3 relative">
                          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#0B0F17] border border-white/15 text-slate-300 shadow-md flex items-center gap-1.5 z-10">
                            <span>⏱️</span>
                            <span>{pText || 'Período'}</span>
                            {scoreText && <span className="font-mono text-sky-400 font-black">{scoreText}</span>}
                          </span>
                        </div>
                      );
                    }

                    if (type === 'injuryTime') {
                      return (
                        <div key={idx} className="flex items-center justify-center my-2 relative">
                          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-[#0B0F17] border border-white/10 text-slate-400 z-10">
                            ⏱ +{inc.length || inc.time}' tiempo añadido
                          </span>
                        </div>
                      );
                    }

                    // Determinar icono, colores y textos según tipo de incidencia
                    let icon = '⚡';
                    let colorClass = 'text-slate-300 bg-slate-700/50';
                    let borderClass = 'border-slate-600/50';
                    let title = '';
                    let detail = '';

                    const playerName = inc.playerName || inc.player?.shortName || inc.player?.name || '';

                    if (type === 'goal') {
                      icon = '⚽';
                      colorClass = 'text-emerald-300 bg-emerald-500/15';
                      borderClass = 'border-emerald-500/30';
                      if (inc.incidentClass === 'ownGoal') {
                        title = `Autogol - ${playerName}`;
                      } else if (inc.incidentClass === 'penalty') {
                        title = `Gol (Penal) - ${playerName}`;
                      } else {
                        title = `Gol - ${playerName}`;
                      }

                      const assistName = inc.assist1?.shortName || inc.assist1?.name || inc.assist1Name;
                      if (assistName) {
                        detail = `Asist: ${assistName}`;
                      }
                      if (inc.homeScore !== undefined && inc.awayScore !== undefined) {
                        const curScore = `(${inc.homeScore} - ${inc.awayScore})`;
                        detail = detail ? `${detail} • ${curScore}` : curScore;
                      }
                    } else if (type === 'card') {
                      if (inc.incidentClass === 'red' || inc.incidentClass === 'yellowRed') {
                        icon = '🟥';
                        colorClass = 'text-rose-300 bg-rose-500/15';
                        borderClass = 'border-rose-500/30';
                        title = inc.incidentClass === 'yellowRed' ? `Doble Amarilla - ${playerName}` : `Tarjeta Roja - ${playerName}`;
                      } else {
                        icon = '🟨';
                        colorClass = 'text-amber-300 bg-amber-500/15';
                        borderClass = 'border-amber-500/30';
                        title = `Tarjeta Amarilla - ${playerName}`;
                      }
                      if (inc.reason) detail = inc.reason;
                    } else if (type === 'substitution') {
                      icon = '🔄';
                      colorClass = 'text-blue-300 bg-blue-500/15';
                      borderClass = 'border-blue-500/30';
                      const pIn = inc.playerIn?.shortName || inc.playerIn?.name || inc.playerInName || '';
                      const pOut = inc.playerOut?.shortName || inc.playerOut?.name || inc.playerOutName || '';
                      title = pIn ? `Entra: ${pIn}` : 'Cambio';
                      detail = pOut ? `Sale: ${pOut}` : '';
                    } else if (type === 'woodwork') {
                      icon = '🪵';
                      colorClass = 'text-orange-300 bg-orange-500/15';
                      borderClass = 'border-orange-500/30';
                      title = `Tiro al palo - ${playerName}`;
                    } else if (type === 'varDecision') {
                      icon = '📺';
                      colorClass = 'text-purple-300 bg-purple-500/15';
                      borderClass = 'border-purple-500/30';
                      title = 'Revisión VAR';
                      detail = inc.incidentClass === 'goalDisallowed' ? `Gol anulado - ${playerName}` : inc.text || '';
                    } else {
                      title = inc.text || type || 'Incidencia';
                      detail = playerName;
                    }

                    return (
                      <div
                        key={idx}
                        className="grid grid-cols-[1fr_52px_1fr] items-center py-1.5 px-1 sm:px-2 rounded-xl hover:bg-white/[0.03] transition-colors"
                      >
                        {/* COLUMNA IZQUIERDA (Local) */}
                        {isHome ? (
                          <div className="flex items-center justify-end gap-2 min-w-0 pr-2">
                            <div className="flex flex-col items-end text-right min-w-0">
                              <span className="text-xs font-bold text-slate-200 leading-snug truncate max-w-[110px] xs:max-w-[150px] sm:max-w-[220px] md:max-w-[280px]">
                                {title}
                              </span>
                              {detail && (
                                <span className="text-[10px] text-slate-400 leading-tight truncate max-w-[110px] xs:max-w-[150px] sm:max-w-[220px] md:max-w-[280px]">
                                  {detail}
                                </span>
                              )}
                            </div>
                            <div
                              className={`w-7 h-7 rounded-full border ${borderClass} ${colorClass} flex items-center justify-center text-xs shrink-0 shadow-sm`}
                            >
                              {icon}
                            </div>
                          </div>
                        ) : (
                          <div />
                        )}

                        {/* CENTRO (Minuto en el eje) */}
                        <div className="flex items-center justify-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#0B0F17] border shadow-sm z-10 whitespace-nowrap ${
                              isHome
                                ? 'border-sky-500/40 text-sky-400'
                                : isAway
                                ? 'border-purple-500/40 text-purple-400'
                                : 'border-white/20 text-slate-300'
                            }`}
                          >
                            {timeStr || '•'}
                          </span>
                        </div>

                        {/* COLUMNA DERECHA (Visitante) */}
                        {isAway ? (
                          <div className="flex items-center justify-start gap-2 min-w-0 pl-2">
                            <div
                              className={`w-7 h-7 rounded-full border ${borderClass} ${colorClass} flex items-center justify-center text-xs shrink-0 shadow-sm`}
                            >
                              {icon}
                            </div>
                            <div className="flex flex-col items-start text-left min-w-0">
                              <span className="text-xs font-bold text-slate-200 leading-snug truncate max-w-[110px] xs:max-w-[150px] sm:max-w-[220px] md:max-w-[280px]">
                                {title}
                              </span>
                              {detail && (
                                <span className="text-[10px] text-slate-400 leading-tight truncate max-w-[110px] xs:max-w-[150px] sm:max-w-[220px] md:max-w-[280px]">
                                  {detail}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-[#101726]/40 border border-white/5 text-center text-slate-400 text-xs">
              Aún no hay incidencias registradas en este partido.
            </div>
          )}
        </div>
      )}

      {/* 3. ALINEACIONES */}
      {activeTab === 'alineaciones' && (
        <div className="space-y-4 animate-in fade-in-50 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Home Lineup */}
            <div className="bg-[#101726]/70 rounded-2xl border border-white/5 p-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <TeamLogo logoUrl={hLogo} teamName={hName} className="w-5 h-5" />
                  <h4 className="text-xs font-bold text-white">{hName}</h4>
                </div>
                {lineups?.home?.formation && (
                  <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 text-xs font-black">
                    {lineups.home.formation}
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Titulares</div>
                {lineups?.home?.players?.length > 0 ? (
                  lineups.home.players.map((p: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-0.5 border-b border-white/[0.02]">
                      <div className="flex items-center gap-2">
                        <span className="w-5 text-right font-mono font-bold text-sky-400">{p.shirtNumber || p.jerseyNumber || '-'}</span>
                        <span className="text-slate-200 font-semibold">{p.player?.name || p.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 uppercase">{p.position || ''}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 py-1">Alineación no disponible</p>
                )}
              </div>
            </div>

            {/* Away Lineup */}
            <div className="bg-[#101726]/70 rounded-2xl border border-white/5 p-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <TeamLogo logoUrl={aLogo} teamName={aName} className="w-5 h-5" />
                  <h4 className="text-xs font-bold text-white">{aName}</h4>
                </div>
                {lineups?.away?.formation && (
                  <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 text-xs font-black">
                    {lineups.away.formation}
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Titulares</div>
                {lineups?.away?.players?.length > 0 ? (
                  lineups.away.players.map((p: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-0.5 border-b border-white/[0.02]">
                      <div className="flex items-center gap-2">
                        <span className="w-5 text-right font-mono font-bold text-sky-400">{p.shirtNumber || p.jerseyNumber || '-'}</span>
                        <span className="text-slate-200 font-semibold">{p.player?.name || p.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 uppercase">{p.position || ''}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 py-1">Alineación no disponible</p>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 4. ESTADÍSTICAS */}
      {activeTab === 'estadisticas' && (
        <div className="space-y-4 animate-in fade-in-50 duration-200">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-sky-400" />
            Estadísticas Comparativas
          </h3>

          {stats && stats.length > 0 ? (
            <div className="bg-[#101726]/70 rounded-2xl border border-white/5 p-4 space-y-3">
              {stats.map((group: any, gIdx: number) => (
                <div key={gIdx} className="space-y-2.5">
                  {group.statisticsItems?.map((stat: any, sIdx: number) => {
                    const hVal = parseFloat(stat.home) || 0;
                    const aVal = parseFloat(stat.away) || 0;
                    const total = hVal + aVal || 1;
                    const hPct = Math.round((hVal / total) * 100);

                    return (
                      <div key={sIdx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-sky-400 font-bold">{stat.home}</span>
                          <span className="text-slate-400 text-[10px] uppercase tracking-wider">{stat.name}</span>
                          <span className="text-cyan-400 font-bold">{stat.away}</span>
                        </div>
                        <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden flex border border-white/5">
                          <div style={{ width: `${hPct}%` }} className="bg-sky-500 h-full" />
                          <div style={{ width: `${100 - hPct}%` }} className="bg-cyan-400 h-full" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-[#101726]/40 border border-white/5 text-center text-slate-400 text-xs">
              No hay estadísticas detalladas registradas para este partido.
            </div>
          )}
        </div>
      )}

      {/* 5. TRANSMISIÓN EN VIVO */}
      {activeTab === 'transmision' && (
        <div className="space-y-4 animate-in fade-in-50 duration-200">
          <div className="flex items-center justify-between bg-[#101726]/60 p-4 rounded-2xl border border-white/5">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Tv className="w-4 h-4 text-red-400" />
                Señales de Transmisión Disponibles
              </h3>
              <p className="text-xs text-slate-400">Canales en vivo para seguir este encuentro</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {streams.map((s, idx) => (
              <a
                key={idx}
                href={s.streamUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#101726]/80 hover:bg-[#152035] border border-white/5 hover:border-red-500/30 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-white block">{s.channelName || `Canal ${idx + 1}`}</span>
                    <span className="text-[10px] text-slate-400">{s.quality || 'HD'}</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-red-400 group-hover:translate-x-0.5 transition-transform">
                  Ver →
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
