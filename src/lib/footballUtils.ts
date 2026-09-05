export interface MatchOdds {
  full_time?: { home?: number; draw?: number; away?: number };
  double_chance?: { home_draw?: number; draw_away?: number; home_away?: number };
  draw_no_bet?: { home?: number; away?: number };
  btts?: { yes?: number; no?: number };
}

export interface TeamRef {
  name: string;
  logoUrl?: string;
  score?: number;
  id?: number;
}

export interface Match {
  id: number;
  homeTeam?: TeamRef;
  awayTeam?: TeamRef;
  home_team?: TeamRef;
  away_team?: TeamRef;
  startTimestamp?: number;
  tournament?: { name?: string; id?: number; category?: { flag?: string } };
  tournament_name?: string;
  round_name?: string;
  status?: string | { type?: string; description?: string; minute?: string | number };
  homeScore?: { current?: number; display?: number; period1?: number; period2?: number };
  awayScore?: { current?: number; display?: number; period1?: number; period2?: number };
  odds?: MatchOdds;
}

export const translateTeamToSpanish = (name: string): string => {
  if (!name) return '';
  const translations: Record<string, string> = {
    'Brazil': 'Brasil',
    'France': 'Francia',
    'Germany': 'Alemania',
    'Spain': 'España',
    'England': 'Inglaterra',
    'Belgium': 'Bélgica',
    'Croatia': 'Croacia',
    'Netherlands': 'Países Bajos',
    'Holland': 'Holanda',
    'Japan': 'Japón',
    'Saudi Arabia': 'Arabia Saudita',
    'South Korea': 'Corea del Sur',
    'Switzerland': 'Suiza',
    'Denmark': 'Dinamarca',
    'Poland': 'Polonia',
    'Mexico': 'México',
    'Morocco': 'Marruecos',
    'United States': 'Estados Unidos',
    'USA': 'Estados Unidos',
    'Cameroon': 'Camerún',
    'Canada': 'Canadá',
    'Ecuador': 'Ecuador',
    'Senegal': 'Senegal',
    'Tunisia': 'Túnez',
    'Wales': 'Gales',
    'Qatar': 'Qatar',
    'Serbia': 'Serbia',
    'Ghana': 'Ghana',
    'Uruguay': 'Uruguay',
    'Argentina': 'Argentina',
    'Portugal': 'Portugal',
    'Italy': 'Italia',
    'Colombia': 'Colombia',
    'Chile': 'Chile',
    'Peru': 'Perú',
    'Paraguay': 'Paraguay',
    'Venezuela': 'Venezuela',
    'Bolivia': 'Bolivia',
    'Algeria': 'Argelia',
    'Austria': 'Austria',
    'Egypt': 'Egipto',
    'Sweden': 'Suecia',
    'Norway': 'Noruega',
    'Scotland': 'Escocia',
    'Ireland': 'Irlanda',
    'Greece': 'Grecia',
    'Turkey': 'Turquía',
    'Türkiye': 'Turquía',
    'Ukraine': 'Ucrania',
    'Czech Republic': 'República Checa',
    'Czechia': 'República Checa',
    'Romania': 'Rumania',
    'Russia': 'Rusia',
    'New Zealand': 'Nueva Zelanda',
    'South Africa': 'Sudáfrica',
    'Panama': 'Panamá',
    'Costa Rica': 'Costa Rica',
    'Honduras': 'Honduras',
    'El Salvador': 'El Salvador',
    'Jamaica': 'Jamaica',
    'Hungary': 'Hungría',
    "Côte d'Ivoire": 'Costa de Marfil',
    "Cote d'Ivoire": 'Costa de Marfil',
    'Ivory Coast': 'Costa de Marfil'
  };
  const trimmed = name.trim();
  return translations[trimmed] || translations[trimmed.replace(/\s+/g, ' ')] || trimmed;
};

export const parseMatchStatus = (match: Match) => {
  const startMs = (match.startTimestamp || 0) * 1000;
  const isPastTime = startMs > 0 && startMs < Date.now();
  const isOverTwoHours = startMs > 0 && (Date.now() - startMs) > 120 * 60 * 1000;

  if (typeof match.status === 'string') {
    const statusStr = match.status.toLowerCase();
    if (statusStr === 'notstarted') return { isLive: false, hasStarted: false, isFinished: false, label: 'Pendiente' };
    if (statusStr === 'inprogress' || statusStr === 'live') return { isLive: true, hasStarted: true, isFinished: false, label: 'EN VIVO' };
    if (statusStr === 'finished' || statusStr === 'ended') return { isLive: false, hasStarted: true, isFinished: true, label: 'Finalizado' };
    if (statusStr === 'canceled') return { isLive: false, hasStarted: false, isFinished: false, label: 'Cancelado' };
    if (statusStr === 'postponed') return { isLive: false, hasStarted: false, isFinished: false, label: 'Postergado' };
  }

  if (typeof match.status === 'object' && match.status !== null) {
    const type = match.status.type?.toLowerCase();
    const desc = match.status.description?.toLowerCase();

    if (type === 'notstarted') {
      if (desc === 'fro') {
        if (isPastTime) {
          if (isOverTwoHours) {
            return { isLive: false, hasStarted: true, isFinished: true, label: 'Finalizado' };
          }
          return { isLive: true, hasStarted: true, isFinished: false, label: 'En juego' };
        }
        return { isLive: false, hasStarted: false, isFinished: false, label: 'Por comenzar' };
      }
      return { isLive: false, hasStarted: false, isFinished: false, label: 'Pendiente' };
    }

    if (type === 'inprogress' || type === 'live') {
      return { isLive: true, hasStarted: true, isFinished: false, label: match.status.description || 'EN VIVO' };
    }
    if (type === 'finished' || type === 'ended') {
      const isPenalties = desc === 'ap' || desc?.includes('pen');
      return { isLive: false, hasStarted: true, isFinished: true, label: 'Finalizado', isPenalties };
    }
    if (type === 'canceled') return { isLive: false, hasStarted: false, isFinished: false, label: 'Cancelado' };
    if (type === 'postponed') return { isLive: false, hasStarted: false, isFinished: false, label: 'Postergado' };
  }

  if (isPastTime) {
    if (isOverTwoHours) {
      return { isLive: false, hasStarted: true, isFinished: true, label: 'Finalizado' };
    }
    return { isLive: true, hasStarted: true, isFinished: false, label: 'EN JUEGO' };
  }
  return { isLive: false, hasStarted: false, isFinished: false, label: 'Pendiente' };
};

export const getMatchTime = (match: Match): string => {
  if (typeof match.status === 'object' && match.status?.minute) {
    return `${match.status.minute}'`;
  }
  const statusDesc = typeof match.status === 'object' ? match.status?.description?.toLowerCase() : match.status?.toLowerCase();
  if (statusDesc?.includes('halftime') || statusDesc === 'ht' || statusDesc === 'pause') return 'ET';
  if (statusDesc?.includes('1st') || statusDesc?.includes('first')) return '1T';
  if (statusDesc?.includes('2nd') || statusDesc?.includes('second')) return '2T';
  if (statusDesc === 'ap' || statusDesc?.includes('pen')) return 'PEN';
  if (statusDesc === 'aet' || statusDesc?.includes('extra')) return 'PR';
  const original = typeof match.status === 'object' ? match.status?.description : match.status;
  if (!original) return 'EN VIVO';
  const origStr = String(original).trim();
  if (['inprogress', 'in_progress', 'live'].includes(origStr.toLowerCase())) {
    return 'EN VIVO';
  }
  return origStr.toUpperCase();
};

export const getScore = (match: Match, team: 'home' | 'away'): number | null => {
  const scoreObj = team === 'home' ? match.homeScore : match.awayScore;
  const teamObj = team === 'home' ? match.homeTeam : match.awayTeam;
  const altTeamObj = team === 'home' ? match.home_team : match.away_team;
  if (scoreObj?.current !== undefined) return scoreObj.current;
  if (scoreObj?.display !== undefined) return scoreObj.display;
  if (teamObj?.score !== undefined) return teamObj.score;
  if (altTeamObj?.score !== undefined) return altTeamObj.score;
  return null;
};

export const getTeamName = (match: Match, team: 'home' | 'away'): string => {
  const teamObj = team === 'home' ? match.homeTeam : match.awayTeam;
  const altTeamObj = team === 'home' ? match.home_team : match.away_team;
  const raw = teamObj?.name || altTeamObj?.name || (team === 'home' ? 'Local' : 'Visitante');
  return translateTeamToSpanish(raw);
};

export const getTeamId = (match: Match, team: 'home' | 'away'): number | undefined => {
  const teamObj = team === 'home' ? match.homeTeam : match.awayTeam;
  const altTeamObj = team === 'home' ? match.home_team : match.away_team;
  return teamObj?.id || altTeamObj?.id;
};

export const getTeamLogo = (match: Match, team: 'home' | 'away'): string => {
  const teamObj = team === 'home' ? match.homeTeam : match.awayTeam;
  const altTeamObj = team === 'home' ? match.home_team : match.away_team;
  const teamId = teamObj?.id || altTeamObj?.id;
  if (teamId) return `/escudos/${teamId}.png`;
  const logoUrl = teamObj?.logoUrl || altTeamObj?.logoUrl || null;
  if (logoUrl?.startsWith('/')) return `https://apivacas.jariel.com.ar/api${logoUrl}`;
  return logoUrl || '/football2.png';
};

export const sanitizeMatch = (m: any): any => {
  if (!m) return m;
  const matchId = m.id || m._id;
  const homeName = (m.homeTeam?.name || m.home_team?.name || '').toLowerCase();
  const awayName = (m.awayTeam?.name || m.away_team?.name || '').toLowerCase();
  const isTercerPuesto = 
    matchId === 1775853465 || 
    ((homeName.includes('france') || homeName.includes('francia')) && 
     (awayName.includes('england') || awayName.includes('inglaterra')));
  
  if (isTercerPuesto) {
    return {
      ...m,
      round_name: 'Tercer puesto',
      stage: 'Tercer puesto'
    };
  }
  return m;
};

export const getLeagueFormat = (id: string): 'argentina' | 'european' | 'brazil' | 'mls' | 'cup' | 'international' => {
  if (['liga-arg', 'primera-nacional', 'primera-b-metro', 'federal-a', 'primera-c'].includes(id)) {
    return 'argentina';
  }
  if (['premier-league', 'laliga', 'serie-a', 'ligue-1', 'bundesliga'].includes(id)) {
    return 'european';
  }
  if (id === 'brasileirao') {
    return 'brazil';
  }
  if (id === 'mls') {
    return 'mls';
  }
  if (id === 'copa-arg') {
    return 'cup';
  }
  return 'international';
};

export const sortRounds = (rounds: string[]) => {
  return [...rounds].sort((a, b) => {
    const isFechaA = a.toLowerCase().includes('fecha');
    const isFechaB = b.toLowerCase().includes('fecha');
    
    if (isFechaA && isFechaB) {
      const numA = parseInt(a.replace(/\D/g, ''), 10);
      const numB = parseInt(b.replace(/\D/g, ''), 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    }
    
    if (isFechaA && !isFechaB) return -1;
    if (!isFechaA && isFechaB) return 1;
    
    const numA = parseInt(a.replace(/\D/g, ''), 10);
    const numB = parseInt(b.replace(/\D/g, ''), 10);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;

    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  });
};
