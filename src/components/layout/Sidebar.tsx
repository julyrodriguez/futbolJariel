'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LEAGUES, LeagueConfig } from '@/lib/leagues';
import { 
  Calendar, 
  BarChart2, 
  GitCompare, 
  Trophy, 
  ChevronDown, 
  X,
  Radio,
  Flame
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  // Collapsible groups
  const [argOpen, setArgOpen] = useState(true);
  const [copasOpen, setCopasOpen] = useState(true);
  const [intOpen, setIntOpen] = useState(true);

  const argentineLeagues = LEAGUES.filter(l => l.category === 'argentina');
  const copasLeagues = LEAGUES.filter(l => l.category === 'copas');
  const internationalLeagues = LEAGUES.filter(l => l.category === 'internacional');
  const mundialLeague = LEAGUES.find(l => l.id === 'mundial');

  const isActive = (path: string) => {
    if (path === '/partidos' && (pathname === '/' || pathname === '/partidos')) return true;
    return pathname === path;
  };

  const isLeagueActive = (id: string) => pathname.includes(`/liga/${id}/`);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0D131F] border-r border-white/[0.07] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/[0.07] shrink-0 bg-[#0B0F17]">
          <Link 
            href="/partidos" 
            onClick={onCloseMobile}
            className="flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-sky-400 p-[1.5px] shadow-lg shadow-sky-500/20">
              <div className="w-full h-full bg-[#0D131F] rounded-[10px] flex items-center justify-center font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-sky-300 text-sm">
                FJ
              </div>
            </div>
            <div>
              <span className="font-black text-sm text-white tracking-tight group-hover:text-sky-400 transition-colors block">
                Fútbol Jariel
              </span>
              <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider block -mt-0.5">
                Resultados & H2H
              </span>
            </div>
          </Link>

          {/* Close Mobile Button */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Content */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4 text-xs font-semibold">
          
          {/* Main Hub Links */}
          <div className="space-y-1">
            <Link
              href="/partidos"
              onClick={onCloseMobile}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${
                isActive('/partidos')
                  ? 'bg-sky-500 text-white font-bold shadow-md shadow-sky-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Todos los Partidos</span>
            </Link>

            <Link
              href="/historial"
              onClick={onCloseMobile}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${
                pathname === '/historial'
                  ? 'bg-sky-500 text-white font-bold shadow-md shadow-sky-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <GitCompare className="w-4 h-4 text-cyan-400" />
              <span>Historial H2H</span>
            </Link>

            <Link
              href="/liga/liga-arg/tabla"
              onClick={onCloseMobile}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${
                pathname.includes('/tabla')
                  ? 'bg-sky-500 text-white font-bold shadow-md shadow-sky-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <BarChart2 className="w-4 h-4 text-amber-400" />
              <span>Tablas de Posiciones</span>
            </Link>
          </div>

          <hr className="border-white/[0.06]" />

          {/* Mundial / Selecciones */}
          {mundialLeague && (
            <div>
              <Link
                href={`/liga/${mundialLeague.id}/partidos`}
                onClick={onCloseMobile}
                className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                  isLeagueActive(mundialLeague.id)
                    ? 'bg-sky-500/20 text-sky-400 font-bold border border-sky-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{mundialLeague.icon}</span>
                  <span>{mundialLeague.name}</span>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 uppercase">
                  FIFA
                </span>
              </Link>
            </div>
          )}

          {/* Argentina Group */}
          <div>
            <button
              onClick={() => setArgOpen(!argOpen)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span>🇦🇷</span>
                <span>Fútbol Argentino</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${argOpen ? 'rotate-180' : ''}`} />
            </button>

            {argOpen && (
              <div className="mt-1 space-y-0.5 pl-2 border-l border-white/10 ml-3">
                {argentineLeagues.map((l) => (
                  <Link
                    key={l.id}
                    href={`/liga/${l.id}/partidos`}
                    onClick={onCloseMobile}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                      isLeagueActive(l.id)
                        ? 'bg-sky-500/15 text-sky-400 font-bold'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                    }`}
                  >
                    <span>{l.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Copas Internacionales */}
          <div>
            <button
              onClick={() => setCopasOpen(!copasOpen)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span>🏆</span>
                <span>Copas Internacionales</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${copasOpen ? 'rotate-180' : ''}`} />
            </button>

            {copasOpen && (
              <div className="mt-1 space-y-0.5 pl-2 border-l border-white/10 ml-3">
                {copasLeagues.map((l) => (
                  <Link
                    key={l.id}
                    href={`/liga/${l.id}/partidos`}
                    onClick={onCloseMobile}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                      isLeagueActive(l.id)
                        ? 'bg-sky-500/15 text-sky-400 font-bold'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                    }`}
                  >
                    <span>{l.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Ligas del Mundo */}
          <div>
            <button
              onClick={() => setIntOpen(!intOpen)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span>🌐</span>
                <span>Ligas del Mundo</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${intOpen ? 'rotate-180' : ''}`} />
            </button>

            {intOpen && (
              <div className="mt-1 space-y-0.5 pl-2 border-l border-white/10 ml-3">
                {internationalLeagues.map((l) => (
                  <Link
                    key={l.id}
                    href={`/liga/${l.id}/partidos`}
                    onClick={onCloseMobile}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                      isLeagueActive(l.id)
                        ? 'bg-sky-500/15 text-sky-400 font-bold'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-sm">{l.icon}</span>
                      <span>{l.name}</span>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </nav>

        {/* Footer info */}
        <div className="p-3 border-t border-white/[0.07] bg-[#0B0F17] text-[11px] text-slate-500 flex items-center justify-between">
          <span>Fútbol Jariel</span>
          <span className="text-[10px] text-sky-400/80 font-mono">v1.0</span>
        </div>
      </aside>
    </>
  );
}
