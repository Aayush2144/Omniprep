import React, { useState } from 'react';
import { useTracker } from '../../context/TrackerContext';
import { Calendar, Filter, Sparkles } from 'lucide-react';

export const HeatmapCalendar = () => {
  const { data } = useTracker();
  const [selectedFilter, setSelectedFilter] = useState('total'); // 'total' | 'gate' | 'academic' | 'job' | 'english'
  const [hoveredDay, setHoveredDay] = useState(null);

  const logs = data.activityLogs || [];

  // Determine intensity color based on hours
  const getIntensityClass = (hours, category) => {
    if (!hours || hours === 0) return 'bg-slate-800/60 border-transparent';

    const colorMaps = {
      total: [
        'bg-indigo-950/80 border-indigo-900/50',
        'bg-indigo-800/80 border-indigo-700/60',
        'bg-indigo-600 border-indigo-500',
        'bg-indigo-400 border-indigo-300 shadow-sm shadow-indigo-500/50',
      ],
      gate: [
        'bg-purple-950/80 border-purple-900/50',
        'bg-purple-800/80 border-purple-700/60',
        'bg-purple-600 border-purple-500',
        'bg-purple-400 border-purple-300 shadow-sm shadow-purple-500/50',
      ],
      academic: [
        'bg-emerald-950/80 border-emerald-900/50',
        'bg-emerald-800/80 border-emerald-700/60',
        'bg-emerald-600 border-emerald-500',
        'bg-emerald-400 border-emerald-300 shadow-sm shadow-emerald-500/50',
      ],
      job: [
        'bg-amber-950/80 border-amber-900/50',
        'bg-amber-800/80 border-amber-700/60',
        'bg-amber-600 border-amber-500',
        'bg-amber-400 border-amber-300 shadow-sm shadow-amber-500/50',
      ],
      english: [
        'bg-rose-950/80 border-rose-900/50',
        'bg-rose-800/80 border-rose-700/60',
        'bg-rose-600 border-rose-500',
        'bg-rose-400 border-rose-300 shadow-sm shadow-rose-500/50',
      ],
    };

    const thresholds = category === 'english'
      ? [0.3, 0.6, 1.0]
      : category === 'total'
      ? [2.5, 5.0, 7.5]
      : [1.0, 2.0, 3.5];

    const currentMap = colorMaps[category] || colorMaps.total;
    if (hours < thresholds[0]) return currentMap[0];
    if (hours < thresholds[1]) return currentMap[1];
    if (hours < thresholds[2]) return currentMap[2];
    return currentMap[3];
  };

  const filterOptions = [
    { id: 'total', label: 'All Pillars' },
    { id: 'gate', label: 'GATE DS/AI' },
    { id: 'academic', label: 'Academics' },
    { id: 'job', label: 'Job Prep' },
    { id: 'english', label: 'English' },
  ];

  return (
    <div className="glass-panel rounded-2xl p-5 border border-white/5">
      {/* Header & Category Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">Daily Consistency Matrix (Past 60 Days)</h3>
        </div>

        <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
          {filterOptions.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                selectedFilter === f.id
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Container */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[620px]">
          <div className="grid grid-flow-col grid-rows-7 gap-1.5 justify-start">
            {logs.map((day, idx) => {
              const hoursVal = selectedFilter === 'total' ? day.total : day[selectedFilter] || 0;
              const intensityClass = getIntensityClass(hoursVal, selectedFilter);
              return (
                <div
                  key={day.date || idx}
                  onMouseEnter={() => setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                  className={`w-3.5 h-3.5 rounded-sm border cursor-pointer transition-all transform hover:scale-125 ${intensityClass}`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Legend & Hover Tooltip */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5 text-xs text-slate-400">
        <div className="h-5 flex items-center">
          {hoveredDay ? (
            <span className="text-white font-medium text-[11px] animate-fade-in flex items-center gap-1.5">
              <strong className="text-indigo-400">{hoveredDay.date}</strong>: {hoveredDay.total}h total 
              <span className="text-slate-400">({hoveredDay.gate}h GATE, {hoveredDay.academic}h Acad, {hoveredDay.job}h Job, {hoveredDay.english}h Eng)</span>
            </span>
          ) : (
            <span className="text-[11px] text-slate-400">Hover over any day to see detailed hour breakdown</span>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-1.5 text-[10px]">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded-sm bg-slate-800/80 border border-slate-700" />
          <div className="w-2.5 h-2.5 rounded-sm bg-indigo-950 border border-indigo-900" />
          <div className="w-2.5 h-2.5 rounded-sm bg-indigo-700 border border-indigo-600" />
          <div className="w-2.5 h-2.5 rounded-sm bg-indigo-400 border border-indigo-300" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
};
