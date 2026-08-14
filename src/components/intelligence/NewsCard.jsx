import React, { useState } from 'react';
import { ExternalLink, Calendar, Tag, Sparkles, Newspaper, Loader2, Unlock, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../supabaseClient';
import { BASE_URL } from '../../utils/api';
import ImpactBadge from './ImpactBadge';

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

  const [showAiInsight, setShowAiInsight] = useState(currentOrigin === 'system');

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
        toast.success(`AI Summary generated & unlocked for Community! (${data.zaps_deducted} Zaps used, ${data.remaining_zaps} Zaps remaining)`);
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

  const isSystemInsight = currentOrigin === 'system';
  const isCommunityInsight = currentOrigin === 'user' || (currentSummary && !isSystemInsight);
  const isInsightLocked = !currentSummary && !isSystemInsight && !isCommunityInsight;

  return (
    <article className="flex flex-col overflow-hidden rounded-[12px] border border-[#E5E5DF] bg-white p-4 sm:p-6 transition-all hover:border-slate-300 shadow-2xs">
      {/* Category & Personalization Match & Insight Badge Header */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Shared Economy Model Insight Badges */}
          {isSystemInsight ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-100 px-2.5 py-0.5 text-[10px] font-black text-[#315CFF] uppercase tracking-wider">
              <Sparkles size={11} className="text-blue-600" />
              <span>⚡ GLOBAL BREAKTHROUGH</span>
            </span>
          ) : isCommunityInsight ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
              <Unlock size={11} className="text-indigo-600" />
              <span>🔓 COMMUNITY UNLOCKED</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#F3F3EF] border border-[#E5E5DF] px-2.5 py-0.5 text-[10px] font-bold text-slate-700 uppercase tracking-wider">
              <Lock size={11} className="text-slate-600" />
              <span>🔒 AI INSIGHT LOCKED</span>
            </span>
          )}

          <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
            {category || 'General'}
          </span>

          {article?.matched_interest && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-[#E5E5DF]/80 px-2.5 py-0.5 text-[10px] font-semibold text-slate-800">
              <Sparkles size={11} className="text-slate-600" />
              <span>Matched: {article.matched_interest}</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ImpactBadge level={impact_level} />
          <span className="text-slate-600 font-normal">{getRelativeTime(published_at)}</span>
        </div>
      </div>

      {/* Article Title */}
      <h3 className="mb-3 text-base font-bold font-sds-content text-[#171717] leading-snug tracking-tight hover:text-[#315CFF] transition-colors">
        <a href={url} target="_blank" rel="noopener noreferrer">
          {title}
        </a>
      </h3>

      {/* Primary Hero Content: Raw Description / News Snippet from Publisher */}
      {description && (
        <p className="mb-4 text-xs text-slate-600 leading-relaxed font-normal">
          {description}
        </p>
      )}

      {/* AI Summary Section */}
      <div className="mt-auto pt-2 space-y-2">
        {currentSummary ? (
          <div>
            <button
              onClick={() => setShowAiInsight(!showAiInsight)}
              className="w-full flex items-center justify-between rounded-[12px] border border-[#E5E5DF] bg-[#F3F3EF]/60 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer mb-2"
            >
              <div className="flex items-center gap-1.5">
                <Sparkles size={13} className="text-blue-600" />
                <span>AI Executive Summary</span>
              </div>
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                {showAiInsight ? 'Hide AI Insight' : 'Show AI Insight'}
              </span>
            </button>

            {showAiInsight && (
              <div className="rounded-[12px] border border-[#E5E5DF]/70 bg-[#F3F3EF]/60 p-6">
                {isCommunityInsight && (
                  <p className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Unlock size={10} />
                    <span>Unlocked for Community by Researcher</span>
                  </p>
                )}
                <p className="text-xs text-slate-700 leading-relaxed font-normal">
                  {currentSummary}
                </p>
              </div>
            )}
          </div>
        ) : user ? (
          <button
            onClick={handleSummarizeOnDemand}
            disabled={summarizing}
            className="w-full flex items-center justify-center gap-2 rounded-[12px] border border-[#E5E5DF] bg-[#F3F3EF]/60 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer disabled:opacity-50"
          >
            {summarizing ? (
              <>
                <Loader2 size={13} className="animate-spin text-slate-700" />
                <span>Generating AI Summary...</span>
              </>
            ) : (
              <>
                <Sparkles size={13} className="text-slate-700" />
                <span>Summarize Article (2 Zaps or Pro)</span>
              </>
            )}
          </button>
        ) : (
          <a
            href="/auth"
            className="w-full flex items-center justify-center gap-2 rounded-[12px] border border-[#E5E5DF] bg-[#F3F3EF]/60 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <Sparkles size={13} className="text-slate-600" />
            <span>Sign Up to Unlock AI Summaries</span>
          </a>
        )}
      </div>

      {/* Footer Details */}
      <div className="mt-5 flex items-center justify-between border-t border-[#E5E5DF] pt-3 text-xs">
        <span className="text-[11px] font-medium text-slate-700">
          Source: {formattedSource}
        </span>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-[#171717] transition-colors"
        >
          <span>Read Paper</span>
          <ExternalLink size={12} />
        </a>
      </div>
    </article>
  );
};

export default NewsCard;
