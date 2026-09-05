'use client';

import { useRef, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Radio } from 'lucide-react';

interface DatePickerStripProps {
  selectedDate: string; // YYYY-MM-DD
  onDateChange: (newDate: string) => void;
  showLiveOnly: boolean;
  onToggleLiveOnly: () => void;
  liveCount?: number;
}

export default function DatePickerStrip({
  selectedDate,
  onDateChange,
  showLiveOnly,
  onToggleLiveOnly,
  liveCount = 0
}: DatePickerStripProps) {
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Generate 7 days centered around selected date (or around today)
  const days = useMemo(() => {
    const list = [];
    const base = new Date(selectedDate + 'T12:00:00Z');
    
    // -3 to +3 days
    for (let offset = -3; offset <= 3; offset++) {
      const d = new Date(base);
      d.setDate(base.getDate() + offset);
      const iso = d.toISOString().split('T')[0];
      
      const todayIso = new Date().toISOString().split('T')[0];
      const isToday = iso === todayIso;
      
      const weekday = d.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '');
      const dayNum = d.getDate();
      const monthNum = d.getMonth() + 1;

      list.push({
        iso,
        isToday,
        weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1),
        display: `${dayNum}/${monthNum}`
      });
    }
    return list;
  }, [selectedDate]);

  const stepDate = (deltaDays: number) => {
    const current = new Date(selectedDate + 'T12:00:00Z');
    current.setDate(current.getDate() + deltaDays);
    onDateChange(current.toISOString().split('T')[0]);
  };

  const setToday = () => {
    const today = new Date().toISOString().split('T')[0];
    onDateChange(today);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-2 bg-[#0B0F17]/60 rounded-2xl border border-white/5 p-3">
      
      {/* Date Navigator Strip */}
      <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto no-scrollbar justify-between sm:justify-start">
        <button
          onClick={() => stepDate(-1)}
          title="Día anterior"
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1 shrink-0">
          {days.map((d) => {
            const isSelected = d.iso === selectedDate;
            return (
              <button
                key={d.iso}
                onClick={() => onDateChange(d.iso)}
                className={`flex flex-col items-center justify-center min-w-[50px] py-1.5 px-2 rounded-xl text-xs transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sky-500 text-white font-extrabold shadow-md shadow-sky-500/20'
                    : d.isToday
                    ? 'bg-white/10 text-sky-400 font-bold hover:bg-white/15'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-[10px] uppercase font-semibold leading-tight opacity-90">
                  {d.isToday ? 'Hoy' : d.weekday}
                </span>
                <span className="text-xs font-black leading-tight">
                  {d.display}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => stepDate(1)}
          title="Día siguiente"
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Right Controls: Calendar input & Live filter toggle */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        {/* Calendar Picker */}
        <div className="relative">
          <input
            type="date"
            ref={dateInputRef}
            value={selectedDate}
            onChange={(e) => {
              if (e.target.value) onDateChange(e.target.value);
            }}
            className="absolute inset-0 opacity-0 pointer-events-none"
          />
          <button
            onClick={() => dateInputRef.current?.showPicker?.() || dateInputRef.current?.focus()}
            title="Seleccionar fecha"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold border border-white/5 transition-colors cursor-pointer"
          >
            <CalendarIcon className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden md:inline">Calendario</span>
          </button>
        </div>

        {/* Live Filter Pill */}
        <button
          onClick={onToggleLiveOnly}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
            showLiveOnly
              ? 'bg-red-500 text-white border-red-400 shadow-md shadow-red-500/30'
              : 'bg-white/5 text-slate-300 border-white/5 hover:border-white/20 hover:text-white'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${showLiveOnly ? 'bg-white animate-ping' : 'bg-red-500 animate-pulse'}`} />
          <span>EN VIVO</span>
          {liveCount > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${showLiveOnly ? 'bg-red-700 text-white' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
              {liveCount}
            </span>
          )}
        </button>
      </div>

    </div>
  );
}
