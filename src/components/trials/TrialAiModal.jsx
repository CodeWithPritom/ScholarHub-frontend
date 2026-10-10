import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Sparkles, Loader2, Copy, Check, Activity,
  Stethoscope, ShieldCheck, HeartPulse, Building2, BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { BASE_URL } from '../../utils/api';

const TrialAiModal = ({ isOpen, onClose, trial }) => {
  const [loading, setLoading] = useState(false);
  const [insightMarkdown, setInsightMarkdown] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && trial) {
      fetchAiInsight();
    } else {
      setInsightMarkdown('');
    }
  }, [isOpen, trial]);

  const fetchAiInsight = async () => {
    if (!trial) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/trials/ai-insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nct_id: trial.nct_id || trial.id,
          title: trial.title || trial.official_title,
          conditions: trial.conditions || [],
          interventions: trial.interventions || [],
          phase: trial.phase || 'Phase N/A',
          status: trial.status || 'Unknown',
          summary: trial.brief_summary || ''
        })
      });

      if (res.ok) {
        const data = await res.json();
        setInsightMarkdown(data.insight_markdown || 'No clinical briefing available.');
      } else {
        setInsightMarkdown('Unable to generate AI briefing at this time. Please try again.');
      }
    } catch (err) {
      console.error('[TrialAiModal Error]', err);
      setInsightMarkdown('Failed to connect to AI synthesis service.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!insightMarkdown) return;
    navigator.clipboard.writeText(insightMarkdown);
    setCopied(true);
    toast.success('Clinical synthesis copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen || !trial) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-900 text-white flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 bg-indigo-500/30 text-indigo-200 text-[11px] font-mono font-bold rounded border border-indigo-400/30">
                  {trial.nct_id || trial.id}
                </span>
                <span className="px-2.5 py-0.5 bg-purple-500/30 text-purple-200 text-[11px] font-bold rounded border border-purple-400/30">
                  {trial.phase}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black leading-tight text-white line-clamp-2">
                {trial.title || trial.official_title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-8 overflow-y-auto flex-1 text-slate-700 leading-relaxed text-sm">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="relative">
                  <Loader2 size={36} className="text-indigo-600 animate-spin" />
                  <Sparkles size={16} className="text-amber-400 absolute -top-1 -right-1 animate-pulse" />
                </div>
                <p className="text-sm font-bold text-slate-600 animate-pulse">
                  Synthesizing clinical trial rationale & translational impact...
                </p>
              </div>
            ) : (
              <div className="prose prose-slate max-w-none prose-headings:font-black prose-headings:text-slate-900 prose-p:text-slate-600 prose-li:text-slate-600">
                <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
                  <Sparkles size={18} className="text-indigo-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-indigo-950">
                    <span className="font-bold">AI Clinical Briefing:</span> Generated via deep reasoning analysis of NIH study design, biological pathways, and intervention modality.
                  </div>
                </div>

                <div className="whitespace-pre-line font-medium leading-relaxed">
                  {insightMarkdown}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              onClick={handleCopy}
              disabled={loading || !insightMarkdown}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-700 hover:text-indigo-600 rounded-xl text-xs font-bold border border-slate-200 hover:border-indigo-300 shadow-sm transition-all"
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              <span>{copied ? 'Copied Briefing' : 'Copy Synthesis'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TrialAiModal;
