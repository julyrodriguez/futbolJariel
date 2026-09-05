import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Fútbol Jariel - Resultados en Vivo, Tablas e Historial H2H',
  description: 'Seguí todos los partidos de fútbol en vivo, resultados, estadísticas, formaciones, tablas de posiciones e historiales de enfrentamientos directos.',
  icons: {
    icon: '/football2.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased min-h-screen flex flex-col bg-[#0A0E17] text-slate-100 selection:bg-sky-500/30 selection:text-white">
        <Navbar />
        
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">
          {children}
        </main>

        <footer className="border-t border-white/[0.08] bg-[#080B12] py-8 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <span className="font-extrabold text-slate-300">Fútbol Jariel</span>
              <span>© {new Date().getFullYear()} • Plataforma de Resultados e Historiales</span>
            </div>

            <div className="flex items-center gap-4 text-slate-400">
              <Link href="/partidos" className="hover:text-white transition-colors">Partidos</Link>
              <Link href="/liga/liga-arg/tabla" className="hover:text-white transition-colors">Tablas</Link>
              <Link href="/historial" className="hover:text-white transition-colors">Historial H2H</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
