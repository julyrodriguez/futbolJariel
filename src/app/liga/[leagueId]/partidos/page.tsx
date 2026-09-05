import MatchesHub from '@/components/MatchesHub';
import { LEAGUES } from '@/lib/leagues';

export async function generateStaticParams() {
  return LEAGUES.filter(l => l.id !== 'general').map(l => ({
    leagueId: l.id,
  }));
}

export default async function LeagueMatchesPage({ params }: { params: Promise<{ leagueId: string }> }) {
  const { leagueId } = await params;
  return <MatchesHub leagueId={leagueId} />;
}
