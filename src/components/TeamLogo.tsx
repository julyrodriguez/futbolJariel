'use client';
import { useState } from 'react';

interface TeamLogoProps {
  logoUrl?: string | null;
  teamName?: string;
  className?: string;
  size?: number;
}

export default function TeamLogo({ logoUrl, teamName = '', className = 'w-6 h-6', size }: TeamLogoProps) {
  const [error, setError] = useState(false);

  const fallback = (
    <div 
      className={`${className} rounded-full bg-slate-800/80 border border-white/10 flex items-center justify-center font-bold text-[10px] text-slate-300 shrink-0 select-none overflow-hidden`}
      title={teamName}
    >
      {teamName ? teamName.substring(0, 2).toUpperCase() : '⚽'}
    </div>
  );

  if (!logoUrl || error) {
    return fallback;
  }

  return (
    <img
      src={logoUrl}
      alt={teamName || 'Equipo'}
      className={`${className} object-contain shrink-0`}
      loading="lazy"
      onError={() => setError(true)}
    />
  );
}
