import React, { useState } from 'react';
import { ExternalLink, Calendar, Tag, Sparkles, Newspaper, Loader2, Unlock, Lock, Globe, ArrowUpRight, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../supabaseClient';
import { BASE_URL } from '../../utils/api';
import ImpactBadge from './ImpactBadge';

const SOURCE_COLORS = {
  NATURE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  SCIENCE: 'bg-blue-50 text-blue-700 border-blue-200',
  EUREKALERT: 'bg-amber-50 text-amber-700 border-amber-200',
  PUBMED: 'bg-purple-50 text-purple-700 border-purple-200',
  DEFAULT: 'bg-slate-100 text-slate-700 border-slate-200'
};

const NewsCard = ({ article, user }) => {
  const [imageError, setImageError] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [currentSummary, setCurrentSummary] = useState(article?.ai_summary || null);
  const [currentOrigin, setCurrentOrigin] = useState(
    article?.origin || (article?.is_featured ? 'system' : article?.ai_summary ? 'user' : 'none')
  );

  if (!article) return null;

  const {
    id,
    title,
    description,
    url,
    image_url,
    source_name,
    category,
    impact_level,
    published_at,
    tags = [],
    is_gated = false,
    needs_ai = false,
    can_summarize = false
  } = article;

  const [showAiInsight, setShowAiInsight] = useState(currentOrigin === 'system' || !!currentSummary);

  const handleSummarizeOnDemand = async () => {
    setSummarizing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        toast.error('Authentication required');
        return;
      }
      const res = await fetch(`${BASE_URL}/api/intelligence/news/${id}/summarize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.detail || 'Failed to generate AI summary.');
        return;
      }
      setCurrentSummary(data.ai_summary);
      setCurrentOrigin('user');
      setShowAiInsight(true);
      window.dispatchEvent(new Event('user-credits-updated'));
      if (data.zaps_deducted > 0) {
        toast.success(`AI Summary unlocked for Community! (${data.zaps_deducted} Zaps used, ${data.remaining_zaps} Zaps remaining)`);
      } else {
        toast.success('AI Summary generated for Pro member!');
      }
    } catch (err) {
      toast.error(err.message || 'Error generating summary.');
    } finally {
      setSummarizing(false);
    }
  };

  const getRelativeTime = (isoDate) => {
    if (!isoDate) return 'Recently';
    try {
      const now = new Date();
      const then = new Date(isoDate);
      const diffMs = now - then;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffHours < 1) return 'Just now';
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 30) return `${diffDays}d ago`;
      return then.toLocaleDateString();
    } catch {
      return 'Recently';
    }
  };

  const formattedSource = (source_name || 'Science').toUpperCase();
  const sourceColorClass = SOURCE_COLORS[formattedSource] || SOURCE_COLORS.DEFAULT;

  const isSystemInsight = currentOrigin === 'system';
  const isCommunityInsight = currentOrigin === 'user' || (currentSummary && !isSystemInsight);

  return (
    <article className="group flex flex-col h-full overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 transition-all duration-300 hover:border-indigo-300 hover:shadow-xl hover:-translate-y-1 relative">
      
      {/* Category & Status Badges */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-wider ${sourceColorClass}`}>
            <Globe size={11} />
            <span>{formattedSource}</span>
          </span>

          <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/70">
            {category || 'General'}
          </span>

          {isSystemInsight ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[10px] font-black text-blue-700 uppercase tracking-wider">
              <Sparkles size={11} className="text-blue-600 animate-pulse" />
              <span>⚡ GLOBAL BREAKTHROUGH</span>
            </span>
          ) : isCommunityInsight ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
              <Unlock size={11} className="text-emerald-600" />
              <span>🔓 COMMUNITY UNLOCKED</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 uppercase tracking-wider">
              <Lock size={11} className="text-amber-600" />
              <span>🔒 AI INSIGHT</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold shrink-0">
          <ImpactBadge level={impact_level} />
          <span>{getRelativeTime(published_at)}</span>
        </div>
      </div>

      {/* Article Title */}
      <h3 className="mb-3 text-base sm:text-lg font-black text-slate-900 leading-snug tracking-tight group-hover:text-indigo-600 transition-colors">
        <a href={url} target="_blank" rel="noopener noreferrer" className="focus:outline-none">
          {title}
        </a>
      </h3>

      {/* Primary Content Snippet */}
      {description && (
        <p className="mb-5 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium line-clamp-3">
          {description}
        </p>
      )}

      {/* AI Executive Summary Drawer */}
      <div className="mt-auto space-y-3">
        {currentSummary ? (
          <div className="space-y-2">
            <button
              onClick={() => setShowAiInsight(!showAiInsight)}
              className="w-full flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50/70 px-3.5 py-2.5 text-xs font-bold text-indigo-900 hover:bg-indigo-100/70 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-indigo-600" />
                <span>AI Executive Summary</span>
              </div>
              <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider">
                {showAiInsight ? 'Collapse' : 'Expand'}
              </span>
            </button>

            {showAiInsight && (
              <div className="rounded-xl bg-slate-900 text-slate-100 p-4 border border-slate-800 shadow-inner space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                    <Sparkles size={11} />
                    Executive Neural Synthesis
                  </span>
                  {isCommunityInsight && (
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                      <Unlock size={10} /> Unlocked
                    </span>
                  )}
                </div>
                <p className="text-xs leading-relaxed font-normal text-slate-300">
                  {currentSummary}
                </p>
              </div>
            )}
          </div>
        ) : user ? (
          <button
            onClick={handleSummarizeOnDemand}
            disabled={summarizing}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md hover:shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {summarizing ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Synthesizing...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} className="text-amber-300" />
                <span>Summarize Article (2 Zaps)</span>
              </>
            )}
          </button>
        ) : (
          <a
            href="/auth"
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2"
          >
            <Sparkles size={14} className="text-indigo-600" />
            <span>Sign In to Unlock AI Summaries</span>
          </a>
        )}

        {/* Footer Details */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
            <BookOpen size={12} className="text-slate-400" />
            <span>{formattedSource}</span>
          </span>

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-black text-indigo-600 hover:text-indigo-800 transition-colors group-hover:translate-x-0.5"
          >
            <span>Read Paper</span>
            <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </article>
  );
};

export default NewsCard;
