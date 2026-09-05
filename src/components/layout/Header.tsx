'use client';

import { Menu, Radio } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  onOpenMobile: () => void;
}

export default function Header({ onOpenMobile }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#0B0F17]/95 backdrop-blur-md border-b border-white/[0.07] h-14 flex items-center justify-between px-4 sm:px-6">
      
      {/* Left: Mobile hamburger & Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-xl bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link href="/partidos" className="flex items-center gap-2 lg:hidden">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-sky-400 flex items-center justify-center font-black text-xs text-white">
            FJ
          </div>
          <span className="font-extrabold text-sm text-white">Fútbol Jariel</span>
        </Link>

        <div className="hidden lg:flex items-center gap-3">
          <span className="font-black text-base text-white tracking-tight">Centro de Resultados</span>
          <span className="text-slate-600">/</span>
          <span className="text-xs text-slate-400 font-semibold">Marcadores, Tablas e Historiales en Vivo</span>
        </div>
      </div>

      {/* Right: Quick Links / Live pulse */}
      <div className="flex items-center gap-2">
        <Link
          href="/historial"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-cyan-400 border border-cyan-500/20 transition-colors"
        >
          <span>🔍</span>
          <span>Comparar H2H</span>
        </Link>
        <Link
          href="/liga/liga-arg/tabla"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-amber-400 border border-amber-500/20 transition-colors"
        >
          <span>📊</span>
          <span>Tablas</span>
        </Link>
      </div>

    </header>
  );
}
