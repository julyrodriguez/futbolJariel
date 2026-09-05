'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import TeamLogo from './TeamLogo';
import { translateTeamToSpanish } from '../lib/footballUtils';
import { LEAGUES } from '../lib/leagues';
import { Trophy, AlertCircle, BarChart3, ChevronRight } from 'lucide-react';

interface StandingRow {
  posicion: number;
  equipoId: number;
  nombre: string;
  escudo?: string;
  puntos: number;
  partidosJugados: number;
  ganados: number;
  empatados: number;
  perdidos: number;
  golesAFavor: number;
  golesEnContra: number;
  diferenciaGoles: string | number;
  promocion?: string | null;
  enVivo?: boolean;
}

const TAB_LABELS: Record<string, string> = {
  tablaGeneral: 'General',
  zonaA: 'Zona A',
  zonaB: 'Zona B',
  anual: 'Tabla Anual',
  promedios: 'Promedios',
  grupoA: 'Grupo A',
  grupoB: 'Grupo B',
  grupoC: 'Grupo C',
  grupoD: 'Grupo D',
  grupoE: 'Grupo E',
  grupoF: 'Grupo F',
  grupoG: 'Grupo G',
  grupoH: 'Grupo H',
};

export default function LeagueTable({ leagueId }: { leagueId: string }) {
  const activeLeague = LEAGUES.find(l => l.id === leagueId) || LEAGUES[1];
  const tournamentId = activeLeague.tournamentId;

  const [standingsData, setStandingsData] = useState<Record<string, StandingRow[]>>({});
  const [activeTab, setActiveTab] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tournamentId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`https://apivacas.jariel.com.ar/api/standings/${tournamentId}`)
      .then(res => {
        if (!res.ok) throw new Error('No se pudo cargar la tabla de posiciones');
        return res.json();
      })
      .then(json => {
        const raw = json.data || json;
        const validTabs: Record<string, StandingRow[]> = {};
        for (const [key, rows] of Object.entries(raw)) {
          if (Array.isArray(rows) && rows.length > 0) {
            validTabs[key] = rows;
          }
        }
        setStandingsData(validTabs);
        const keys = Object.keys(validTabs);
        if (keys.length > 0) {
          // Default tab
          if (validTabs['tablaGeneral']) setActiveTab('tablaGeneral');
          else if (validTabs['zonaA']) setActiveTab('zonaA');
          else setActiveTab(keys[0]);
        }
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [tournamentId]);

  const tabs = Object.keys(standingsData);
  const currentRows: StandingRow[] = (activeTab && standingsData[activeTab]) ? standingsData[activeTab] : [];

  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 border-3 border-sky-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-400 font-semibold">Cargando tabla de posiciones...</span>
      </div>
    );
  }

  if (error || tabs.length === 0) {
    return (
      <div className="p-8 rounded-3xl bg-[#101726]/50 border border-white/5 text-center">
        <AlertCircle className="w-10 h-10 text-slate-500 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-white mb-1">Tabla no disponible</h3>
        <p className="text-xs text-slate-400">
          {error || 'No hay datos de posiciones registrados para esta competición en este momento.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      
      {/* Tab Switcher if multiple zones / groups */}
      {tabs.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : 'bg-[#101726] text-slate-300 hover:text-white hover:bg-white/5 border border-white/5'
              }`}
            >
              {TAB_LABELS[tab] || tab}
            </button>
          ))}
        </div>
      )}

      {/* Standings Table Card */}
      <div className="bg-[#101726]/80 rounded-2xl border border-white/[0.08] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] bg-black/30 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                <th className="py-3 px-3 w-12 text-center">Pos</th>
                <th className="py-3 px-4">Equipo</th>
                <th className="py-3 px-2 text-center">PJ</th>
                <th className="py-3 px-2 text-center">G</th>
                <th className="py-3 px-2 text-center">E</th>
                <th className="py-3 px-2 text-center">P</th>
                <th className="py-3 px-2 text-center hidden sm:table-cell">GF</th>
                <th className="py-3 px-2 text-center hidden sm:table-cell">GC</th>
                <th className="py-3 px-2 text-center font-bold">DG</th>
                <th className="py-3 px-4 text-center font-black text-sky-400">PTS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {currentRows.map((row, idx) => {
                const teamName = translateTeamToSpanish(row.nombre);
                const logoUrl = row.escudo?.startsWith('/') 
                  ? row.escudo 
                  : (row.equipoId ? `/escudos/${row.equipoId}.png` : undefined);
                
                const isTop = row.posicion <= 4;
                const isRelegation = row.posicion > currentRows.length - 2 && currentRows.length > 6;

                return (
                  <tr 
                    key={row.equipoId || idx}
                    className="hover:bg-white/[0.03] transition-colors group"
                  >
                    {/* Position */}
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-black ${
                        isTop 
                          ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' 
                          : isRelegation 
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'text-slate-400'
                      }`}>
                        {row.posicion}
                      </span>
                    </td>

                    {/* Team */}
                    <td className="py-3 px-4">
                      <Link 
                        href={`/team/${row.equipoId}`}
                        className="flex items-center gap-3 group-hover:text-sky-300 transition-colors"
                      >
                        <TeamLogo logoUrl={logoUrl} teamName={teamName} className="w-6 h-6 shrink-0" />
                        <span className="font-bold text-slate-100 text-xs sm:text-sm truncate max-w-[140px] sm:max-w-xs">
                          {teamName}
                        </span>
                        {row.promocion && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-white/5 text-slate-400 hidden md:inline">
                            {row.promocion}
                          </span>
                        )}
                      </Link>
                    </td>

                    {/* Stats */}
                    <td className="py-3 px-2 text-center text-slate-300 font-semibold">{row.partidosJugados}</td>
                    <td className="py-3 px-2 text-center text-slate-300">{row.ganados}</td>
                    <td className="py-3 px-2 text-center text-slate-400">{row.empatados}</td>
                    <td className="py-3 px-2 text-center text-slate-400">{row.perdidos}</td>
                    <td className="py-3 px-2 text-center text-slate-400 hidden sm:table-cell">{row.golesAFavor}</td>
                    <td className="py-3 px-2 text-center text-slate-400 hidden sm:table-cell">{row.golesEnContra}</td>
                    <td className="py-3 px-2 text-center font-bold text-slate-200">{row.diferenciaGoles}</td>

                    {/* Points */}
                    <td className="py-3 px-4 text-center">
                      <span className="text-sm font-black text-sky-400">
                        {row.puntos}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
