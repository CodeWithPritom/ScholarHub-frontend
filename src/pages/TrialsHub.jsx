/**
 * TrialsHub.jsx — NIH Clinical Trials Intelligence Hub
 * Dedicated page at /trials for searching and analyzing 450,000+ clinical studies,
 * drug trials, phases (Phase I - IV), and interventions across 220+ countries.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Search, Loader2, Sparkles, Stethoscope, HeartPulse,
  Filter, RotateCcw, AlertCircle, Building2, Pill, ChevronRight,
  ExternalLink, Globe, ShieldCheck, CheckCircle2
} from 'lucide-react';
import WorkspaceLayout from '../components/WorkspaceLayout';
import AuthModal from '../AuthModal';
import SEOHead from '../components/SEOHead';
import TrialCard from '../components/trials/TrialCard';
import TrialFilterBar from '../components/trials/TrialFilterBar';
import TrialAiModal from '../components/trials/TrialAiModal';
import { BASE_URL } from '../utils/api';

const TRENDING_TRIAL_PILLS = [
  { label: 'mRNA Cancer Vaccines', query: 'mRNA cancer vaccine', icon: '🧬' },
  { label: 'CRISPR Gene Therapy', query: 'CRISPR Cas9 gene therapy', icon: '🧪' },
  { label: 'GLP-1 Agonists', query: 'GLP-1 receptor agonist obesity diabetes', icon: '💊' },
  { label: 'CAR-T Cell Therapy', query: 'CAR-T cell therapy lymphoma leukemia', icon: '🔬' },
  { label: 'Alzheimer’s Antibodies', query: 'Alzheimers monoclonal antibody amyloid', icon: '🧠' },
  { label: 'Autoimmune Stem Cells', query: 'stem cell transplantation autoimmune', icon: '🧫' },
  { label: 'Long COVID Clinical', query: 'Long COVID post-acute sequelae', icon: '🫁' },
  { label: 'Solid Tumor Immunotherapy', query: 'checkpoint inhibitor PD-1 CTLA-4 solid tumor', icon: '🏥' },
];

const TrialsHub = ({ user, profile, onLogout, liveUsersCount }) => {
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  // Search state
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [error, setError] = useState(null);

  // Filters
  const [phase, setPhase] = useState('all');
  const [status, setStatus] = useState('all');

  // Modals
  const [selectedTrialForAi, setSelectedTrialForAi] = useState(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Trending / Featured trials on initial load
  const [featuredTrials, setFeaturedTrials] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(false);

  // ─── Fetch Featured on Mount ───
  useEffect(() => {
    fetchFeatured();
  }, []);

  const fetchFeatured = async () => {
    setFeaturedLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/trials/search?q=immunotherapy+cancer&page_size=6&status=recruiting`);
      if (res.ok) {
        const data = await res.json();
        setFeaturedTrials(data.trials || []);
      }
    } catch (err) {
      console.warn('[TrialsHub] Featured fetch error:', err);
    } finally {
      setFeaturedLoading(false);
    }
  };

  // ─── Search Execution ───
  const performSearch = useCallback(async (searchQuery = query, searchPhase = phase, searchStatus = status) => {
    const q = searchQuery?.trim();
    if (!q) return;

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const params = new URLSearchParams({
        q,
        page_size: '24'
      });
      if (searchPhase && searchPhase !== 'all') params.append('phase', searchPhase);
      if (searchStatus && searchStatus !== 'all') params.append('status', searchStatus);

      const res = await fetch(`${BASE_URL}/api/trials/search?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      setResults(data.trials || []);
      setTotalResults(data.total_count || 0);
    } catch (err) {
      console.error('[TrialsHub] Search error:', err);
      setError('Unable to fetch clinical trials from NIH registry. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, phase, status]);

  const handleSubmit = (e) => {
    e.preventDefault();
    performSearch(query, phase, status);
  };

  const handlePillClick = (pillQuery) => {
    setQuery(pillQuery);
    performSearch(pillQuery, phase, status);
  };

  const handleResetFilters = () => {
    setPhase('all');
    setStatus('all');
    if (searched && query) {
      performSearch(query, 'all', 'all');
    }
  };

  const handleOpenAiInsights = (trial) => {
    setSelectedTrialForAi(trial);
    setAiModalOpen(true);
  };

  return (
    <WorkspaceLayout
      user={user}
      profile={profile}
      onLogout={onLogout}
      liveUsersCount={liveUsersCount}
    >
      <SEOHead
        title="Clinical Trials Hub — Global Medical Studies & NIH Protocol Explorer | ScholarHub AI"
        description="Search 450,000+ clinical trials from NIH ClinicalTrials.gov across 220+ countries. Filter by study phase (Phase I-IV), recruiting status, drugs, and AI synthesis."
      />

      <div className="min-h-screen bg-[#FDFCFB] pb-24">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-b from-indigo-900 via-slate-900 to-[#FDFCFB] pt-12 pb-20 px-4 sm:px-6 lg:px-8 text-white">
          <div className="max-w-5xl mx-auto text-center relative z-10">
            {/* Header Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-black uppercase tracking-widest mb-6 backdrop-blur-md"
            >
              <Activity size={14} className="text-emerald-400" />
              <span>NIH ClinicalTrials.gov Omni-Registry</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4 leading-tight"
            >
              Clinical Trials & Drug Intelligence Hub
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto mb-8 font-medium leading-relaxed"
            >
              Explore <span className="text-white font-bold">450,000+ active clinical studies</span> across 220+ countries.
              Track Phase I–IV pipeline transitions, patient eligibility, intervention regimens, and AI translational summaries.
            </motion.p>

            {/* Search Bar */}
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onSubmit={handleSubmit}
              className="relative max-w-3xl mx-auto"
            >
              <div className="relative flex items-center bg-white rounded-2xl shadow-2xl border-2 border-indigo-200/40 focus-within:border-indigo-500 overflow-hidden transition-all">
                <Search size={20} className="text-slate-400 ml-4 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search diseases, drugs, NCT ID, biological targets (e.g., mRNA vaccine, CRISPR, GLP-1)..."
                  className="w-full py-4 px-4 text-slate-800 placeholder-slate-400 text-sm sm:text-base font-medium outline-none bg-transparent"
                />
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="mr-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all shrink-0 flex items-center gap-2"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <span>Search Trials</span>
                      <ChevronRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </motion.form>

            {/* Trending Discovery Pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto"
            >
              <span className="text-xs font-black uppercase tracking-wider text-indigo-300/80 mr-1">Trending:</span>
              {TRENDING_TRIAL_PILLS.map((pill, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePillClick(pill.query)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white rounded-lg text-xs font-semibold backdrop-blur-sm border border-white/10 transition-colors"
                >
                  <span>{pill.icon}</span>
                  <span>{pill.label}</span>
                </button>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Content Container */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
          {/* Filter Bar (Only shown when results exist or search performed) */}
          {searched && (
            <TrialFilterBar
              phase={phase}
              setPhase={(newPhase) => {
                setPhase(newPhase);
                performSearch(query, newPhase, status);
              }}
              status={status}
              setStatus={(newStatus) => {
                setStatus(newStatus);
                performSearch(query, phase, newStatus);
              }}
              totalResults={totalResults}
              onReset={handleResetFilters}
            />
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <Loader2 size={40} className="text-indigo-600 animate-spin" />
              <p className="text-slate-600 font-bold text-sm animate-pulse">
                Querying NIH ClinicalTrials.gov global database...
              </p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center my-8">
              <AlertCircle size={32} className="text-rose-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-rose-800 mb-1">Search Error</h3>
              <p className="text-xs text-rose-600">{error}</p>
            </div>
          )}

          {/* Search Results Grid */}
          {!loading && searched && results.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {results.map((trial) => (
                <TrialCard
                  key={trial.nct_id || trial.id}
                  trial={trial}
                  onOpenAiInsights={handleOpenAiInsights}
                />
              ))}
            </div>
          )}

          {/* Empty Search Results */}
          {!loading && searched && results.length === 0 && !error && (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center my-8 shadow-sm">
              <Stethoscope size={48} className="text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-black text-slate-800 mb-2">No Clinical Trials Found</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                We couldn't find any clinical studies matching "<span className="font-bold text-slate-700">{query}</span>" with the active filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl text-xs font-bold transition-colors"
              >
                Clear Phase & Status Filters
              </button>
            </div>
          )}

          {/* Featured Trials (Initial State Before Search) */}
          {!searched && !loading && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <HeartPulse size={20} className="text-rose-500" />
                    <span>Featured Active Clinical Trials</span>
                  </h2>
                  <p className="text-xs text-slate-500">Currently recruiting groundbreaking cancer immunotherapy and precision medicine studies</p>
                </div>
              </div>

              {featuredLoading ? (
                <div className="flex justify-center py-16">
                  <Loader2 size={32} className="text-indigo-600 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuredTrials.map((trial) => (
                    <TrialCard
                      key={trial.nct_id || trial.id}
                      trial={trial}
                      onOpenAiInsights={handleOpenAiInsights}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* AI Synthesis Modal */}
      <TrialAiModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        trial={selectedTrialForAi}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </WorkspaceLayout>
  );
};

export default TrialsHub;
