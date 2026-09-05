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
  translateTeamToSpanish 
} from '../lib/footballUtils';
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  Trophy, 
  Activity, 
  Shield, 
  Tv, 
  BarChart2, 
  Users, 
  History,
  AlertCircle,
  Play
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

  // Load Match Details
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchDetail = async () => {
      try {
        const res = await fetch(`https://apivacas.jariel.com.ar/api/matches/detail/${matchId}`);
        if (!res.ok) throw new Error('No se pudo cargar la información del partido');
        const data = await res.json();
        const event = data.events ? data.events[0] : data;
        if (isMounted) {
          setMatchData(event);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Error al conectar');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDetail();
    const interval = setInterval(fetchDetail, 20000); // Poll every 20s
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
    if (!hName || !aName) return;
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
        <p className="text-xs text-slate-400 mb-4">{error || 'No se encontró la información del encuentro'}</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
        >
          Volver a Partidos
        </button>
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
      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-b from-[#111927] to-[#0B0F17] shadow-2xl p-6 sm:p-8">
        
        {/* Top Tournament Pill */}
        <div className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-400 border-b border-white/5 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-white font-bold">{match.tournament_name || match.tournament?.name || 'Torneo'}</span>
            {match.round_name && <span>• {match.round_name}</span>}
          </div>
          {match.startTimestamp && (
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(match.startTimestamp * 1000).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
            </div>
          )}
        </div>

        {/* Scoreboard Arena */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 sm:gap-8">
          
          {/* Home Team */}
          <Link href={`/team/${hId}`} className="flex flex-col items-center text-center group">
            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl p-2 bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform">
              <TeamLogo logoUrl={hLogo} teamName={hName} className="w-full h-full" />
            </div>
            <h2 className="mt-3 text-sm sm:text-lg font-black text-white group-hover:text-sky-400 transition-colors">
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
                <div className="flex items-center gap-3 sm:gap-4 text-4xl sm:text-6xl font-black text-red-400">
                  <span>{hScore ?? 0}</span>
                  <span className="text-slate-600 font-light text-2xl sm:text-4xl">-</span>
                  <span>{aScore ?? 0}</span>
                </div>
              </div>
            ) : status.hasStarted ? (
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                  {status.isPenalties ? 'Final (Penales)' : 'Final'}
                </span>
                <div className="flex items-center gap-3 sm:gap-4 text-4xl sm:text-6xl font-black text-white">
                  <span className={hScore !== null && aScore !== null && hScore > aScore ? 'text-sky-400' : 'text-slate-100'}>
                    {hScore ?? 0}
                  </span>
                  <span className="text-slate-600 font-light text-2xl sm:text-4xl">-</span>
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
                <div className="px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xl sm:text-2xl font-black text-slate-200">
                  {match.startTimestamp
                    ? new Date(match.startTimestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'Próximamente'}
                </div>
              </div>
            )}
          </div>

          {/* Away Team */}
          <Link href={`/team/${aId}`} className="flex flex-col items-center text-center group">
            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl p-2 bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform">
              <TeamLogo logoUrl={aLogo} teamName={aName} className="w-full h-full" />
            </div>
            <h2 className="mt-3 text-sm sm:text-lg font-black text-white group-hover:text-sky-400 transition-colors">
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
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'historial'
              ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-lg shadow-sky-500/25'
              : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <History className="w-4 h-4" />
          Historial H2H
        </button>

        <button
          onClick={() => setActiveTab('resumen')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'resumen'
              ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-lg shadow-sky-500/25'
              : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Activity className="w-4 h-4" />
          Incidencias
        </button>

        <button
          onClick={() => setActiveTab('alineaciones')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'alineaciones'
              ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-lg shadow-sky-500/25'
              : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Users className="w-4 h-4" />
          Alineaciones
        </button>

        <button
          onClick={() => setActiveTab('estadisticas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'estadisticas'
              ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-lg shadow-sky-500/25'
              : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          Estadísticas
        </button>

        {streams.length > 0 && (
          <button
            onClick={() => setActiveTab('transmision')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'transmision'
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/25'
                : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
            }`}
          >
            <Tv className="w-4 h-4" />
            Transmisión en Vivo
          </button>
        )}
      </div>

      {/* ── TAB CONTENT ── */}

      {/* 1. HISTORIAL H2H */}
      {activeTab === 'historial' && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#101726]/60 p-4 rounded-2xl border border-white/5">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-sky-400" />
                Historial de Enfrentamientos Directos
              </h3>
              <p className="text-xs text-slate-400">
                Comparativa estadística histórica entre {hName} y {aName}
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={h2hLimit}
                onChange={(e) => setH2hLimit(Number(e.target.value))}
                className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300 font-semibold outline-none cursor-pointer"
              >
                <option value={5}>Últimos 5 partidos</option>
                <option value={10}>Últimos 10 partidos</option>
                <option value={20}>Últimos 20 partidos</option>
              </select>

              <select
                value={h2hVenueFilter}
                onChange={(e) => setH2hVenueFilter(e.target.value as any)}
                className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300 font-semibold outline-none cursor-pointer"
              >
                <option value="all">Todas las canchas</option>
                <option value="same_venue">Solo con {hName} local</option>
              </select>
            </div>
          </div>

          {h2hLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2">
              <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-slate-400">Cargando historial...</span>
            </div>
          ) : h2hStats && h2hStats.total > 0 ? (
            <div className="space-y-6">
              
              {/* Summary Scorecard Bar */}
              <div className="bg-[#101726]/80 rounded-2xl border border-white/5 p-5">
                <div className="grid grid-cols-3 text-center mb-3">
                  <div>
                    <div className="text-2xl font-black text-sky-400">{h2hStats.homeWins}</div>
                    <div className="text-[11px] font-bold text-slate-400 truncate">{hName}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-300">{h2hStats.draws}</div>
                    <div className="text-[11px] font-bold text-slate-400">Empates</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-cyan-400">{h2hStats.awayWins}</div>
                    <div className="text-[11px] font-bold text-slate-400 truncate">{aName}</div>
                  </div>
                </div>

                {/* Progress Bar Breakdown */}
                <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden flex border border-white/5">
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

                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                  <span>{h2hStats.homeGoals} goles anotados</span>
                  <span>{h2hStats.total} partidos considerados</span>
                  <span>{h2hStats.awayGoals} goles anotados</span>
                </div>
              </div>

              {/* List of Past Matches */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                  Enfrentamientos Anteriores
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
                      key={m.id || idx}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-[#101726]/40 hover:bg-[#101726] border border-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-mono text-slate-500 min-w-[70px]">
                          {dateStr}
                        </span>
                        <span className="text-xs text-slate-400 font-semibold hidden md:inline truncate max-w-[140px]">
                          {m.tournament_name || m.tournament?.name || 'Oficial'}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 flex-1 justify-center max-w-md">
                        <div className="flex items-center gap-2 justify-end flex-1 min-w-0">
                          <span className={`text-xs font-bold truncate ${mHScore !== null && mAScore !== null && mHScore > mAScore ? 'text-sky-400' : 'text-slate-200'}`}>
                            {mHName}
                          </span>
                          <TeamLogo logoUrl={mHLogo} teamName={mHName} className="w-5 h-5 shrink-0" />
                        </div>

                        <div className="px-2.5 py-0.5 rounded-lg bg-black/40 border border-white/10 text-xs font-black text-white shrink-0">
                          {mHScore ?? 0} - {mAScore ?? 0}
                        </div>

                        <div className="flex items-center gap-2 justify-start flex-1 min-w-0">
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
            <div className="bg-[#101726]/40 rounded-2xl border border-white/5 p-8 text-center text-slate-400 text-xs">
              No se registran antecedentes directos recientes entre estos dos equipos.
            </div>
          )}

        </div>
      )}

      {/* 2. RESUMEN / INCIDENCIAS */}
      {activeTab === 'resumen' && (
        <div className="space-y-4 animate-in fade-in-50 duration-200">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-400" />
            Línea de Tiempo del Partido
          </h3>

          {incidents && incidents.length > 0 ? (
            <div className="relative border-l-2 border-white/10 ml-4 pl-6 space-y-4 py-2">
              {incidents.map((inc, idx) => {
                const isHome = inc.isHome === true;
                const time = inc.addedTime ? `${inc.time}+${inc.addedTime}'` : `${inc.time}'`;
                const type = inc.incidentType;
                let icon = '⚡';
                let label = inc.text || type;

                if (type === 'goal') {
                  icon = '⚽';
                  label = `Gol: ${inc.playerName || inc.player?.name || 'Anotación'}`;
                } else if (type === 'card') {
                  if (inc.incidentClass === 'red') {
                    icon = '🟥';
                    label = `Tarjeta Roja: ${inc.playerName || inc.player?.name}`;
                  } else {
                    icon = '🟨';
                    label = `Tarjeta Amarilla: ${inc.playerName || inc.player?.name}`;
                  }
                } else if (type === 'substitution') {
                  icon = '🔄';
                  label = `Cambio: Entra ${inc.playerIn?.name || ''} por ${inc.playerOut?.name || ''}`;
                } else if (type === 'period') {
                  icon = '⏱️';
                  label = inc.text || 'Cambio de tiempo';
                }

                return (
                  <div key={idx} className="relative flex items-center gap-3">
                    <div className="absolute -left-[31px] w-4 h-4 rounded-full bg-[#0B0F17] border-2 border-sky-400 flex items-center justify-center text-[9px]" />
                    <span className="font-mono text-xs font-bold text-sky-400 min-w-[35px]">
                      {time}
                    </span>
                    <span className="text-base">{icon}</span>
                    <div className="flex-1 text-xs">
                      <span className="font-semibold text-slate-200">{label}</span>
                      <span className="text-slate-500 ml-2">({isHome ? hName : aName})</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-[#101726]/40 border border-white/5 text-center text-slate-400 text-xs">
              Aún no hay incidencias registradas en este partido.
            </div>
          )}
        </div>
      )}

      {/* 3. ALINEACIONES */}
      {activeTab === 'alineaciones' && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Home Lineup */}
            <div className="bg-[#101726]/70 rounded-2xl border border-white/5 p-5">
              <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <TeamLogo logoUrl={hLogo} teamName={hName} className="w-6 h-6" />
                  <h4 className="text-sm font-bold text-white">{hName}</h4>
                </div>
                {lineups?.home?.formation && (
                  <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 text-xs font-black">
                    {lineups.home.formation}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Titulares</div>
                {lineups?.home?.players?.length > 0 ? (
                  lineups.home.players.map((p: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-white/[0.02]">
                      <div className="flex items-center gap-2">
                        <span className="w-5 text-right font-mono font-bold text-sky-400">{p.shirtNumber || p.jerseyNumber || '-'}</span>
                        <span className="text-slate-200 font-semibold">{p.player?.name || p.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 uppercase">{p.position || ''}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 py-2">Alineación no disponible</p>
                )}
              </div>
            </div>

            {/* Away Lineup */}
            <div className="bg-[#101726]/70 rounded-2xl border border-white/5 p-5">
              <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <TeamLogo logoUrl={aLogo} teamName={aName} className="w-6 h-6" />
                  <h4 className="text-sm font-bold text-white">{aName}</h4>
                </div>
                {lineups?.away?.formation && (
                  <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 text-xs font-black">
                    {lineups.away.formation}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Titulares</div>
                {lineups?.away?.players?.length > 0 ? (
                  lineups.away.players.map((p: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-white/[0.02]">
                      <div className="flex items-center gap-2">
                        <span className="w-5 text-right font-mono font-bold text-sky-400">{p.shirtNumber || p.jerseyNumber || '-'}</span>
                        <span className="text-slate-200 font-semibold">{p.player?.name || p.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 uppercase">{p.position || ''}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 py-2">Alineación no disponible</p>
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
            <div className="bg-[#101726]/70 rounded-2xl border border-white/5 p-5 space-y-4">
              {stats.map((group: any, gIdx: number) => (
                <div key={gIdx} className="space-y-3">
                  {group.statisticsItems?.map((stat: any, sIdx: number) => {
                    const hVal = parseFloat(stat.home) || 0;
                    const aVal = parseFloat(stat.away) || 0;
                    const total = hVal + aVal || 1;
                    const hPct = Math.round((hVal / total) * 100);

                    return (
                      <div key={sIdx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-sky-400 font-bold">{stat.home}</span>
                          <span className="text-slate-400 text-[11px] uppercase tracking-wider">{stat.name}</span>
                          <span className="text-cyan-400 font-bold">{stat.away}</span>
                        </div>
                        <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden flex border border-white/5">
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
            <div className="p-8 rounded-2xl bg-[#101726]/40 border border-white/5 text-center text-slate-400 text-xs">
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
                className="flex items-center justify-between p-4 rounded-2xl bg-[#101726]/80 hover:bg-[#152035] border border-white/5 hover:border-red-500/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 fill-current" />
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
