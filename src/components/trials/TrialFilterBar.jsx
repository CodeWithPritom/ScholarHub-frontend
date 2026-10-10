import React from 'react';
import { Filter, RotateCcw, Activity, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';

const PHASES = [
  { value: 'all', label: 'All Phases' },
  { value: 'phase1', label: 'Phase 1' },
  { value: 'phase2', label: 'Phase 2' },
  { value: 'phase3', label: 'Phase 3' },
  { value: 'phase4', label: 'Phase 4' },
  { value: 'early_phase1', label: 'Early Phase 1' },
];

const STATUSES = [
  { value: 'all', label: 'All Statuses' },
  { value: 'recruiting', label: '🟢 Recruiting' },
  { value: 'completed', label: '🔵 Completed' },
  { value: 'active_not_recruiting', label: '🟣 Active (Not Recruiting)' },
  { value: 'not_yet_recruiting', label: '🟡 Not Yet Recruiting' },
  { value: 'terminated', label: '🔴 Terminated' },
];

const TrialFilterBar = ({
  phase,
  setPhase,
  status,
  setStatus,
  totalResults,
  onReset
}) => {
  const hasActiveFilters = phase !== 'all' || status !== 'all';

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 p-4 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Filters Area */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-black text-slate-400 uppercase tracking-widest mr-1">
          <Filter size={14} className="text-indigo-600" />
          <span>Filters:</span>
        </div>

        {/* Phase Select */}
        <div className="relative">
          <select
            value={phase}
            onChange={(e) => setPhase(e.target.value)}
            aria-label="Filter by study phase"
            className="appearance-none bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold py-2 pl-3 pr-8 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer transition-colors"
          >
            {PHASES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>

        {/* Status Select */}
        <div className="relative">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filter by trial recruitment status"
            className="appearance-none bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold py-2 pl-3 pr-8 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer transition-colors"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl transition-all"
            title="Reset filters"
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Results Counter */}
      {totalResults > 0 && (
        <div className="text-xs font-bold text-slate-500 self-end md:self-center">
          Found <span className="text-slate-900 font-extrabold">{totalResults.toLocaleString()}</span> Clinical Studies
        </div>
      )}
    </div>
  );
};

export default TrialFilterBar;
