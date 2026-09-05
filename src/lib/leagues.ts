export interface LeagueConfig {
  id: string;
  name: string;
  shortName?: string;
  icon: string;
  tournamentId: number | null;
  category: 'mundial' | 'argentina' | 'copas' | 'internacional' | 'general';
}

export const LEAGUES: LeagueConfig[] = [
  { id: 'general', name: 'Todos los Partidos', shortName: 'Todos', icon: '🌐', tournamentId: null, category: 'general' },
  { id: 'mundial', name: 'Copa del Mundo', shortName: 'Mundial', icon: '🌍', tournamentId: 16, category: 'mundial' },
  
  // Argentina
  { id: 'liga-arg', name: 'Liga Profesional', shortName: 'Liga Arg', icon: '🇦🇷', tournamentId: 155, category: 'argentina' },
  { id: 'copa-arg', name: 'Copa Argentina', shortName: 'Copa Arg', icon: '🏆', tournamentId: 10005, category: 'argentina' },
  { id: 'primera-nacional', name: 'Primera Nacional', shortName: 'Nacional', icon: '🇦🇷', tournamentId: 10001, category: 'argentina' },
  { id: 'primera-b-metro', name: 'Primera B Metro', shortName: 'B Metro', icon: '🇦🇷', tournamentId: 10002, category: 'argentina' },
  { id: 'federal-a', name: 'Federal A', shortName: 'Federal A', icon: '🇦🇷', tournamentId: 10003, category: 'argentina' },
  { id: 'primera-c', name: 'Primera C', shortName: 'Primera C', icon: '🇦🇷', tournamentId: 10004, category: 'argentina' },

  // Copas continentales
  { id: 'libertadores', name: 'Copa Libertadores', shortName: 'Libertadores', icon: '🏆', tournamentId: 384, category: 'copas' },
  { id: 'champions', name: 'Champions League', shortName: 'Champions', icon: '⭐', tournamentId: 7, category: 'copas' },

  // Ligas Internacionales
  { id: 'premier-league', name: 'Premier League', shortName: 'Premier', icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', tournamentId: 10007, category: 'internacional' },
  { id: 'laliga', name: 'La Liga EA Sports', shortName: 'La Liga', icon: '🇪🇸', tournamentId: 10008, category: 'internacional' },
  { id: 'serie-a', name: 'Serie A', shortName: 'Serie A', icon: '🇮🇹', tournamentId: 10009, category: 'internacional' },
  { id: 'bundesliga', name: 'Bundesliga', shortName: 'Bundesliga', icon: '🇩🇪', tournamentId: 10011, category: 'internacional' },
  { id: 'ligue-1', name: 'Ligue 1', shortName: 'Ligue 1', icon: '🇫🇷', tournamentId: 10010, category: 'internacional' },
  { id: 'brasileirao', name: 'Brasileirão Serie A', shortName: 'Brasileirão', icon: '🇧🇷', tournamentId: 325, category: 'internacional' },
  { id: 'mls', name: 'MLS', shortName: 'MLS', icon: '🇺🇸', tournamentId: 10006, category: 'internacional' },
];

export type LeagueId = typeof LEAGUES[number]['id'];

export const POPULAR_LEAGUES = LEAGUES.filter(l => 
  ['general', 'mundial', 'liga-arg', 'champions', 'libertadores', 'premier-league', 'laliga'].includes(l.id)
);
