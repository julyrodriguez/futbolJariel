import TeamDetail from '@/components/TeamDetail';

export const metadata = {
  title: 'Perfil del Equipo, Partidos y Plantel | Fútbol Jariel',
};

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TeamDetail teamId={id} />;
}
