/**
 * DatasetAiModal.jsx — AI Research Topic Generator Modal
 * Glassmorphic modal displaying AI-generated thesis topics,
 * research gaps, and recommended statistical/ML models.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, X, Lightbulb, AlertTriangle, Brain, BarChart3,
  Loader2, BookOpen, Target, Zap, Lock, ArrowRight
} from 'lucide-react';
import { BASE_URL } from '../../utils/api';

const DatasetAiModal = ({ isOpen, onClose, dataset, userTier = 'free' }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && dataset && !result) {
      fetchAiTopics();
    }
  }, [isOpen, dataset?.id]);

  // Reset when closing
  useEffect(() => {
    if (!isOpen) {
      setResult(null);
      setError(null);
    }
  }, [isOpen]);

  const fetchAiTopics = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${BASE_URL}/api/datasets/ai-topics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataset_title: dataset.title,
          description: dataset.description || '',
          columns: dataset.columns_preview || [],
          source: dataset.source || '',
          formats: dataset.formats || [],
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('[DatasetAiModal] Error:', err);
      setError('AI service temporarily unavailable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Check if feature should be locked (Free tier gets 1 teaser)
  const isLocked = userTier === 'free' && result?.topics?.length > 1;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[640px] md:max-h-[85vh] bg-white rounded-2xl shadow-2xl z-[201] flex flex-col overflow-hidden border border-[#E5E5DF]"
          >
            {/* Header */}
            <div className="relative px-6 pt-6 pb-4 border-b border-[#E5E5DF] bg-gradient-to-r from-violet-50 via-purple-50 to-fuchsia-50">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <Sparkles size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#171717]">AI Research Topics</h2>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5 line-clamp-1 max-w-[400px]">
                      {dataset?.title}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-slate-100 text-slate-500 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {/* Loading State */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center animate-pulse">
                      <Brain size={28} className="text-white" />
                    </div>
                    <Loader2 size={14} className="absolute -bottom-1 -right-1 text-purple-600 animate-spin" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-[#171717]">Analyzing Dataset...</p>
                    <p className="text-xs text-slate-500 mt-1">Generating publishable research topics</p>
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && !loading && (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
                    <AlertTriangle size={24} className="text-red-500" />
                  </div>
                  <p className="text-sm font-semibold text-red-600 text-center">{error}</p>
                  <button
                    onClick={fetchAiTopics}
                    className="px-4 py-2 bg-[#315CFF] text-white rounded-xl text-xs font-bold hover:bg-[#2547d0] transition-colors"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Results */}
              {result && !loading && !error && (
                <div className="space-y-6">
                  {/* Feasibility Score */}
                  {result.feasibility_score && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 rounded-xl border border-emerald-100">
                      <Target size={18} className="text-emerald-600 shrink-0" />
                      <div className="flex-1">
                        <span className="text-xs font-bold text-emerald-700">Research Feasibility Score</span>
                      </div>
                      <span className="text-lg font-black text-emerald-600">{result.feasibility_score}/10</span>
                    </div>
                  )}

                  {/* Topics */}
                  <div>
                    <h3 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                      <Lightbulb size={14} className="text-amber-500" />
                      Publishable Research Topics
                    </h3>
                    <div className="space-y-3">
                      {(result.topics || []).map((topic, i) => (
                        <div
                          key={i}
                          className={`relative p-4 rounded-xl border transition-all ${
                            i === 0 || userTier !== 'free'
                              ? 'bg-white border-[#E5E5DF] hover:border-[#315CFF]/30'
                              : 'bg-slate-50/50 border-slate-100 opacity-60 blur-[1px] pointer-events-none select-none'
                          }`}
                        >
                          <h4 className="text-sm font-bold text-[#171717] mb-2 leading-snug">
                            {topic.title || `Topic ${i + 1}`}
                          </h4>
                          {topic.research_question && (
                            <p className="text-xs text-[#315CFF] font-semibold mb-2">
                              <span className="text-slate-400">RQ:</span> {topic.research_question}
                            </p>
                          )}
                          {topic.methodology && (
                            <p className="text-xs text-slate-500 leading-relaxed mb-2">
                              {topic.methodology}
                            </p>
                          )}
                          {topic.target_journal && (
                            <div className="flex items-center gap-1.5 mt-2">
                              <BookOpen size={11} className="text-violet-500" />
                              <span className="text-[10px] font-semibold text-violet-600">{topic.target_journal}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Free Tier Upgrade CTA */}
                  {userTier === 'free' && result.topics?.length > 1 && (
                    <div className="relative p-5 rounded-2xl bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 border border-purple-200">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
                          <Lock size={18} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-[#171717]">
                            Unlock Full AI Analysis
                          </h4>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            Get all 3 thesis topics, research gap analysis & recommended models with 
                            <strong className="text-[#315CFF]"> Starter Plan (৳199/mo)</strong>.
                          </p>
                          <button
                            onClick={() => window.location.href = '/pricing'}
                            className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-purple-500/20"
                          >
                            <Zap size={13} />
                            Upgrade Now
                            <ArrowRight size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Starter Tier Pro Upgrade Nudge */}
                  {userTier === 'starter' && result.research_gaps?.length > 0 && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                      <Zap size={16} className="text-amber-600 shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-amber-800">
                          Upgrade to <strong>Pro (৳499/mo)</strong> for Research Gap Analysis, Recommended Models & Statistical Advisors.
                        </p>
                      </div>
                      <button
                        onClick={() => window.location.href = '/pricing'}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-bold transition-colors shrink-0"
                      >
                        Go Pro
                      </button>
                    </div>
                  )}

                  {/* Research Gaps (Pro-only) */}
                  {result.research_gaps?.length > 0 && (userTier === 'pro') && (
                    <div>
                      <h3 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                        <AlertTriangle size={14} className="text-orange-500" />
                        Research Gaps Identified
                      </h3>
                      <ul className="space-y-2">
                        {result.research_gaps.map((gap, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                            <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                            {gap}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommended Models (Pro-only) */}
                  {result.recommended_models?.length > 0 && (userTier === 'pro') && (
                    <div>
                      <h3 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                        <BarChart3 size={14} className="text-blue-500" />
                        Recommended Statistical / ML Models
                      </h3>
                      <div className="grid gap-2">
                        {result.recommended_models.map((model, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                            <div className="w-6 h-6 rounded-lg bg-[#315CFF] flex items-center justify-center shrink-0">
                              <Zap size={12} className="text-white" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-[#171717]">{model.name || model}</p>
                              {model.use_case && (
                                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{model.use_case}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DatasetAiModal;
