'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LEAGUES } from '../lib/leagues';
import { Menu, X, Trophy, Calendar, BarChart2, GitCompare, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [leaguesDropdownOpen, setLeaguesDropdownOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/partidos' && (pathname === '/' || pathname === '/partidos' || pathname.startsWith('/liga/') && pathname.endsWith('/partidos'))) {
      return true;
    }
    if (path === '/tabla' && pathname.includes('/tabla')) return true;
    if (path === '/historial' && pathname.startsWith('/historial')) return true;
    return pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0B0F17]/90 backdrop-blur-md border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand / Logo */}
          <div className="flex items-center gap-6">
            <Link href="/partidos" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-sky-500 to-cyan-400 p-[1.5px] shadow-lg shadow-sky-500/20 group-hover:shadow-sky-500/40 transition-all duration-300">
                <div className="w-full h-full bg-[#0B0F17] rounded-[10px] flex items-center justify-center font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-sky-200 text-base tracking-tighter">
                  FJ
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-sky-400 transition-colors">
                    Fútbol Jariel
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    Live
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 -mt-0.5 hidden sm:block">
                  Resultados, Estadísticas e Historial
                </p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 ml-4">
              <Link
                href="/partidos"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive('/partidos')
                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                Partidos
              </Link>

              <Link
                href="/liga/liga-arg/tabla"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive('/tabla')
                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                Tablas
              </Link>

              <Link
                href="/historial"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive('/historial')
                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <GitCompare className="w-3.5 h-3.5" />
                Historial H2H
              </Link>

              {/* Leagues Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setLeaguesDropdownOpen(!leaguesDropdownOpen)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    leaguesDropdownOpen
                      ? 'bg-white/10 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  Competiciones
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${leaguesDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {leaguesDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setLeaguesDropdownOpen(false)}
                    />
                    <div className="absolute left-0 mt-2 w-72 bg-[#101726] border border-white/10 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in-0 zoom-in-95 duration-150">
                      <div className="p-2 border-b border-white/5 mb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Principales Ligas
                      </div>
                      <div className="max-h-80 overflow-y-auto space-y-1">
                        {LEAGUES.filter(l => l.id !== 'general').map(league => (
                          <Link
                            key={league.id}
                            href={`/liga/${league.id}/partidos`}
                            onClick={() => setLeaguesDropdownOpen(false)}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 text-xs text-slate-200 hover:text-white transition-colors"
                          >
                            <span className="flex items-center gap-2.5">
                              <span className="text-base">{league.icon}</span>
                              <span className="font-semibold">{league.name}</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium bg-white/5 px-2 py-0.5 rounded-lg">
                              Ver
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </nav>
          </div>

          {/* Right Action: Quick Competition Pills */}
          <div className="hidden lg:flex items-center gap-2">
            <Link
              href="/liga/liga-arg/partidos"
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <span>🇦🇷</span> Liga Profesional
            </Link>
            <Link
              href="/liga/mundial/partidos"
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <span>🌍</span> Mundial
            </Link>
            <Link
              href="/liga/champions/partidos"
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <span>⭐</span> Champions
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/5 bg-[#0B0F17]/95 backdrop-blur-xl px-4 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/partidos"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-3 rounded-xl text-center text-xs font-bold border ${
                isActive('/partidos')
                  ? 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                  : 'bg-white/5 text-slate-200 border-white/5'
              }`}
            >
              ⚽ Partidos
            </Link>
            <Link
              href="/liga/liga-arg/tabla"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-3 rounded-xl text-center text-xs font-bold border ${
                isActive('/tabla')
                  ? 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                  : 'bg-white/5 text-slate-200 border-white/5'
              }`}
            >
              📊 Tablas
            </Link>
            <Link
              href="/historial"
              onClick={() => setMobileMenuOpen(false)}
              className={`col-span-2 p-3 rounded-xl text-center text-xs font-bold border ${
                isActive('/historial')
                  ? 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                  : 'bg-white/5 text-slate-200 border-white/5'
              }`}
            >
              🔍 Comparador Historial H2H
            </Link>
          </div>

          <div className="pt-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
              Competiciones
            </div>
            <div className="grid grid-cols-2 gap-1.5 max-h-60 overflow-y-auto">
              {LEAGUES.filter(l => l.id !== 'general').map(league => (
                <Link
                  key={league.id}
                  href={`/liga/${league.id}/partidos`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03] hover:bg-white/10 text-xs font-medium text-slate-200"
                >
                  <span>{league.icon}</span>
                  <span className="truncate">{league.shortName || league.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
