import type { Metadata } from 'next';
import './globals.css';
import AppShell from '@/components/layout/AppShell';

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
      <body className="antialiased min-h-screen bg-[#0A0E17] text-slate-100 selection:bg-sky-500/30 selection:text-white">
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
