import MatchDetail from '@/components/MatchDetail';

export const metadata = {
  title: 'Detalle del Partido, Historial H2H y Estadísticas | Fútbol Jariel',
};

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MatchDetail matchId={id} />;
}
