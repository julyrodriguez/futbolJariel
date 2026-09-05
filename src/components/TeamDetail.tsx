'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TeamLogo from './TeamLogo';
import MatchCard from './MatchCard';
import { translateTeamToSpanish } from '../lib/footballUtils';
import { ArrowLeft, Users, Calendar, Trophy, MapPin, AlertCircle } from 'lucide-react';

interface TeamDetailProps {
  teamId: string;
}

export default function TeamDetail({ teamId }: TeamDetailProps) {
  const router = useRouter();
  const [team, setTeam] = useState<any>(null);
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'matches' | 'squad'>('matches');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!teamId) return;
    setLoading(true);

    const fetchAll = async () => {
      try {
        const tRes = await fetch(`https://apivacas.jariel.com.ar/api/teams/${teamId}`);
        if (!tRes.ok) throw new Error('No se pudo cargar la información del equipo');
        const teamData = await tRes.json();
        setTeam(teamData);

        const mRes = await fetch(`https://apivacas.jariel.com.ar/api/teams/${teamId}/all-matches?limit=100`);
        if (mRes.ok) {
          const allMatches = await mRes.json();
          const now = Math.floor(Date.now() / 1000);
          const played = allMatches
            .filter((m: any) => m.startTimestamp && m.startTimestamp <= now)
            .sort((a: any, b: any) => b.startTimestamp - a.startTimestamp);
          const upcoming = allMatches
            .filter((m: any) => m.startTimestamp && m.startTimestamp > now)
            .sort((a: any, b: any) => a.startTimestamp - b.startTimestamp);

          setRecentMatches(played);
          setUpcomingMatches(upcoming);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [teamId]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-3 border-sky-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-400 font-semibold">Cargando perfil del club...</span>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="p-8 rounded-3xl bg-[#101726]/50 border border-white/5 text-center">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-white mb-1">Equipo no encontrado</h3>
        <p className="text-xs text-slate-400 mb-4">{error || 'No se encontró la información de este equipo.'}</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
        >
          Volver
        </button>
      </div>
    );
  }

  const teamName = translateTeamToSpanish(team.name || 'Equipo');
  const logoUrl = team.logoUrl || `/escudos/${teamId}.png`;
  const players = team.players || [];

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

      {/* Team Header Hero */}
      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-r from-blue-900/40 via-sky-900/20 to-[#0B0F17] shadow-xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white/5 border border-white/10 p-3 flex items-center justify-center shrink-0 shadow-lg shadow-sky-500/10">
            <TeamLogo logoUrl={logoUrl} teamName={teamName} className="w-full h-full" />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {teamName}
            </h1>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2 text-xs text-slate-300">
              {team.country && (
                <span className="flex items-center gap-1">
                  <span>📍</span> {team.country.name || team.country}
                </span>
              )}
              {team.venue && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-sky-400" />
                  {team.venue.name} {team.venue.capacity ? `(${team.venue.capacity.toLocaleString()} esp.)` : ''}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Controls */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('matches')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'matches'
              ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-lg shadow-sky-500/25'
              : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Partidos y Resultados
        </button>

        <button
          onClick={() => setActiveTab('squad')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'squad'
              ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-lg shadow-sky-500/25'
              : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Users className="w-4 h-4" />
          Plantel ({players.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'matches' && (
        <div className="space-y-8 animate-in fade-in-50 duration-200">
          
          {/* Upcoming Matches */}
          {upcomingMatches.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-400" />
                Próximos Partidos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {upcomingMatches.slice(0, 6).map((match, idx) => (
                  <MatchCard key={match.id || idx} match={match} showTournamentHeader />
                ))}
              </div>
            </div>
          )}

          {/* Recent Results */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              Últimos Resultados
            </h3>
            {recentMatches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recentMatches.slice(0, 10).map((match, idx) => (
                  <MatchCard key={match.id || idx} match={match} showTournamentHeader />
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-[#101726]/40 border border-white/5 text-center text-slate-400 text-xs">
                No hay resultados recientes disponibles para este equipo.
              </div>
            )}
          </div>

        </div>
      )}

      {/* Squad Tab */}
      {activeTab === 'squad' && (
        <div className="space-y-4 animate-in fade-in-50 duration-200">
          {players.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {players.map((p: any, idx: number) => {
                const pData = p.player || p;
                return (
                  <div 
                    key={pData.id || idx}
                    className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#101726]/60 border border-white/5 hover:border-white/15 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-mono font-black text-sky-400 shrink-0">
                      {pData.shirtNumber || pData.jerseyNumber || '•'}
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-white block truncate">
                        {pData.name}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                        {pData.position || 'Jugador'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-[#101726]/40 border border-white/5 text-center text-slate-400 text-xs">
              Plantel no disponible actualmente para este equipo.
            </div>
          )}
        </div>
      )}

    </div>
  );
}
