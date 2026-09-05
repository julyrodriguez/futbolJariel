import MatchesHub from '@/components/MatchesHub';

export const metadata = {
  title: 'Partidos y Resultados de Fútbol en Vivo | Fútbol Jariel',
};

export default function PartidosPage() {
  return <MatchesHub leagueId="general" />;
}
