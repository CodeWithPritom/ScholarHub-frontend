import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, CheckCircle2, AlertCircle, Clock, Building2, MapPin,
  ExternalLink, Sparkles, Copy, Check, ChevronDown, ChevronUp,
  Stethoscope, Pill, ShieldAlert, HeartPulse, Beaker
} from 'lucide-react';
import { toast } from 'sonner';

const getPhaseBadgeColor = (phase) => {
  const p = (phase || '').toLowerCase();
  if (p.includes('phase 3') || p.includes('phase 4')) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }
  if (p.includes('phase 2')) {
    return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  }
  if (p.includes('phase 1') || p.includes('early')) {
    return 'bg-amber-50 text-amber-700 border-amber-200';
  }
  return 'bg-slate-100 text-slate-700 border-slate-200';
};

const getStatusBadgeColor = (status) => {
  const s = (status || '').toLowerCase();
  if (s.includes('recruiting') && !s.includes('not')) {
    return 'bg-emerald-500 text-white shadow-sm shadow-emerald-200';
  }
  if (s.includes('completed')) {
    return 'bg-blue-50 text-blue-700 border border-blue-200';
  }
  if (s.includes('active')) {
    return 'bg-violet-50 text-violet-700 border border-violet-200';
  }
  if (s.includes('terminated') || s.includes('suspended') || s.includes('withdrawn')) {
    return 'bg-rose-50 text-rose-700 border border-rose-200';
  }
  return 'bg-slate-100 text-slate-600 border border-slate-200';
};

const TrialCard = ({ trial, onOpenAiInsights }) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const nctId = trial.nct_id || trial.id;
  const title = trial.title || trial.official_title || 'Untitled Clinical Study';
  const status = trial.status || 'Unknown Status';
  const phase = trial.phase || 'Phase N/A';
  const conditions = trial.conditions || [];
  const interventions = trial.interventions || [];
  const sponsor = trial.lead_sponsor || 'Unknown Sponsor';
  const summary = trial.brief_summary || '';
  const locations = trial.locations || [];

  const handleCopyNct = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(nctId);
    setCopied(true);
    toast.success(`Copied ${nctId} to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      layout
      className="group bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-300 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 overflow-hidden flex flex-col p-6 relative"
    >
      {/* Top Header: NCT ID, Status & Phase */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* NCT Identifier Button */}
          <button
            onClick={handleCopyNct}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 hover:bg-indigo-50 text-slate-800 hover:text-indigo-600 rounded-lg text-xs font-mono font-bold border border-slate-200 transition-colors"
            title="Click to copy NCT ID"
          >
            <Activity size={13} className="text-indigo-600" />
            {nctId}
            {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} className="text-slate-400" />}
          </button>

          {/* Phase Badge */}
          <span className={`px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider border ${getPhaseBadgeColor(phase)}`}>
            {phase}
          </span>

          {/* Status Badge */}
          <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${getStatusBadgeColor(status)}`}>
            {status}
          </span>

          {trial.study_type && (
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
              {trial.study_type}
            </span>
          )}
        </div>

        {/* AI Insights Action Button */}
        {onOpenAiInsights && (
          <button
            onClick={() => onOpenAiInsights(trial)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold rounded-lg shadow-sm shadow-indigo-200 transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            <Sparkles size={13} className="text-amber-300" />
            <span>AI Clinical Synthesis</span>
          </button>
        )}
      </div>

      {/* Trial Title */}
      <h3 className="text-lg font-black text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors mb-3">
        {title}
      </h3>

      {/* Medical Indications / Conditions */}
      {conditions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <HeartPulse size={14} className="text-rose-500 shrink-0 mr-1" />
          {conditions.slice(0, 4).map((cond, idx) => (
            <span
              key={idx}
              className="px-2.5 py-0.5 bg-rose-50/70 border border-rose-100 text-rose-800 text-xs font-semibold rounded-md"
            >
              {cond}
            </span>
          ))}
          {conditions.length > 4 && (
            <span className="text-xs font-bold text-slate-400">
              +{conditions.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Interventions / Drug Regimens */}
      {interventions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          <Pill size={14} className="text-indigo-500 shrink-0 mr-1" />
          {interventions.slice(0, 3).map((inv, idx) => (
            <span
              key={idx}
              className="px-2.5 py-0.5 bg-indigo-50/60 border border-indigo-100 text-indigo-900 text-xs font-semibold rounded-md truncate max-w-[280px]"
              title={inv}
            >
              {inv}
            </span>
          ))}
          {interventions.length > 3 && (
            <span className="text-xs font-bold text-slate-400">
              +{interventions.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Summary with Expand/Collapse */}
      <div className="text-sm text-slate-600 leading-relaxed mb-4">
        <p className={expanded ? '' : 'line-clamp-3'}>
          {summary}
        </p>
        {summary.length > 180 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
          >
            {expanded ? (
              <>Show Less <ChevronUp size={12} /></>
            ) : (
              <>Read Protocol Summary <ChevronDown size={12} /></>
            )}
          </button>
        )}
      </div>

      {/* Footer Info: Sponsor, Location & Direct Study Link */}
      <div className="mt-auto pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5 font-medium text-slate-700" title={`Lead Sponsor: ${sponsor}`}>
            <Building2 size={14} className="text-slate-400" />
            <span className="truncate max-w-[200px]">{sponsor}</span>
          </div>

          {locations.length > 0 && (
            <div className="flex items-center gap-1.5 text-slate-500" title={locations.join('; ')}>
              <MapPin size={13} className="text-slate-400" />
              <span className="truncate max-w-[180px]">{locations[0]}</span>
              {locations.length > 1 && <span className="text-[10px] font-bold text-slate-400">+{locations.length - 1}</span>}
            </div>
          )}
        </div>

        <a
          href={trial.url || `https://clinicaltrials.gov/study/${nctId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-lg text-xs font-bold border border-slate-200 transition-colors ml-auto"
        >
          <span>View on ClinicalTrials.gov</span>
          <ExternalLink size={12} />
        </a>
      </div>
    </motion.div>
  );
};

export default TrialCard;
