/**
 * DataHub.jsx — Open Research Data Hub
 * Dedicated page at /datasets for searching, discovering, and analyzing
 * open-access scientific datasets across Zenodo, HuggingFace, Harvard Dataverse, and NCBI GEO.
 * 
 * Integrated into WorkspaceLayout like Academy & Opportunity Hubs.
 * Accessible to both guest (unauthenticated) and authenticated users.
 * Guest users can browse & search, with auth prompts for AI synthesis and code generation.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, Database, Loader2, Sparkles, TrendingUp,
  ChevronRight, RefreshCw, AlertCircle, ServerCrash,
  Globe, FileSpreadsheet, Beaker, Cpu
} from 'lucide-react';
import WorkspaceLayout from '../components/WorkspaceLayout';
import AuthModal from '../AuthModal';
import SEOHead from '../components/SEOHead';
import DatasetCard from '../components/datasets/DatasetCard';
import DatasetFilterBar from '../components/datasets/DatasetFilterBar';
import DatasetAiModal from '../components/datasets/DatasetAiModal';
import DatasetCodeModal from '../components/datasets/DatasetCodeModal';
import { BASE_URL } from '../utils/api';

// ─── Trending discovery pills ───
const TRENDING_PILLS = [
  { label: 'COVID-19', query: 'COVID-19', icon: '🧬' },
  { label: 'Machine Learning', query: 'machine learning', icon: '🤖' },
  { label: 'Climate Change', query: 'climate change temperature', icon: '🌍' },
  { label: 'Genomics', query: 'genomics RNA-seq', icon: '🧪' },
  { label: 'NLP', query: 'natural language processing', icon: '📝' },
  { label: 'Economics', query: 'economics GDP', icon: '📊' },
  { label: 'Customer Churn', query: 'customer churn prediction', icon: '📈' },
  { label: 'Chest X-Ray', query: 'chest x-ray medical imaging', icon: '🫁' },
];

const DataHub = ({ user, profile, onLogout, liveUsersCount }) => {
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const debounceRef = useRef(null);

  // Search state
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [cachedHit, setCachedHit] = useState(false);
  const [sourcesQueried, setSourcesQueried] = useState([]);
  const [error, setError] = useState(null);

  // Filters
  const [discipline, setDiscipline] = useState('');
  const [format, setFormat] = useState('');
  const [source, setSource] = useState('all');
  const [sort, setSort] = useState('relevance');

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Modals
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState(null);

  // Trending datasets
  const [trendingDatasets, setTrendingDatasets] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(false);

  // User tier
  const userTier = profile?.user_tier || profile?.tier || (user ? 'free' : 'guest');

  // ─── Fetch Trending on Mount ───
  useEffect(() => {
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    setTrendingLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/datasets/trending?limit=6`);
      if (res.ok) {
        const data = await res.json();
        setTrendingDatasets(data.datasets || []);
      }
    } catch (err) {
      console.warn('[DataHub] Trending fetch error:', err);
    } finally {
      setTrendingLoading(false);
    }
  };

  // ─── Search Function ───
  const performSearch = useCallback(async (searchQuery, searchPage = 1) => {
    const q = searchQuery?.trim();
    if (!q) return;

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const params = new URLSearchParams({
        q,
        source,
        format,
        discipline,
        sort,
        page: searchPage.toString(),
        page_size: pageSize.toString(),
      });

      const res = await fetch(`${BASE_URL}/api/datasets/search?${params}`);

      if (!res.ok) {
        throw new Error(`Search failed: HTTP ${res.status}`);
      }

      const data = await res.json();
      setResults(data.datasets || []);
      setTotalResults(data.total_results || 0);
      setCachedHit(data.cached || false);
      setSourcesQueried(data.sources_queried || []);
    } catch (err) {
      console.error('[DataHub] Search error:', err);
      setError('Search failed. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [source, format, discipline, sort, pageSize]);

  // ─── Debounced Search ───
  const handleSearchInput = (value) => {
    setQuery(value);
    setPage(1);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length >= 2) {
      debounceRef.current = setTimeout(() => {
        performSearch(value, 1);
      }, 500);
    }
  };

  // ─── Enter key handler ───
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      performSearch(query, 1);
    }
  };

  // ─── Filter change triggers re-search ───
  useEffect(() => {
    if (searched && query.trim()) {
      performSearch(query, 1);
      setPage(1);
    }
  }, [source, format, discipline, sort]);

  // ─── Pill click ───
  const handlePillClick = (pillQuery) => {
    setQuery(pillQuery);
    setPage(1);
    performSearch(pillQuery, 1);
  };

  // ─── Reset filters ───
  const handleResetFilters = () => {
    setDiscipline('');
    setFormat('');
    setSource('all');
    setSort('relevance');
  };

  // ─── Modal handlers with Guest Protection ───
  const handleAiTopics = (dataset) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    setSelectedDataset(dataset);
    setAiModalOpen(true);
  };

  const handleStarterCode = (dataset) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    setSelectedDataset(dataset);
    setCodeModalOpen(true);
  };

  // ─── SEO Schema ───
  const hubSchema = {
    "@context": "https://schema.org",
    "@type": "DataCatalog",
    "name": "Open Research Data Hub — ScholarHub AI",
    "url": "https://scholarhub-ai.com/datasets",
    "description": "Search and discover 1.8M+ open-access scientific datasets from Zenodo, Hugging Face, Harvard Dataverse, and NCBI GEO. AI-powered research topic generation and starter code.",
    "provider": {
      "@type": "Organization",
      "name": "ScholarHub AI",
      "url": "https://scholarhub-ai.com",
    },
  };

  return (
    <WorkspaceLayout user={user} profile={profile} onLogout={onLogout} hideNav={true}>
      <SEOHead
        title="Open Research Data Hub — Search 1.8M+ Scientific Datasets | ScholarHub AI"
        description="Discover, analyze, and download open-access research datasets from Zenodo, Hugging Face, Harvard Dataverse, and NCBI GEO. AI thesis topic generation and Python/R starter code."
        canonicalPath="/datasets"
        schemaJson={hubSchema}
      />

      {/* Main Content inside Workspace */}
      <div className="w-full px-4 sm:px-6 md:px-8 2xl:px-12 space-y-8 pt-4 pb-12">
        <div className="max-w-7xl mx-auto">

          {/* ═══ Hero Section ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-8 md:mb-12"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#315CFF]/10 border border-[#315CFF]/20 rounded-full mb-4 shadow-sm">
              <Database size={14} className="text-[#315CFF]" />
              <span className="text-[11px] font-black text-[#315CFF] uppercase tracking-wider">
                Open Research Data Hub
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-[#171717] tracking-tight leading-tight mb-3">
              Search <span className="text-[#315CFF]">1.8M+</span> Scientific Datasets
            </h1>
            <p className="text-sm md:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Discover open-access datasets from Zenodo (CERN), Hugging Face, Harvard Dataverse, and NCBI GEO. 
              Generate publishable thesis topics and instant Python/R loading code.
            </p>

            {/* Source Logos Row */}
            <div className="flex items-center justify-center gap-4 md:gap-6 mt-5 flex-wrap">
              {[
                { name: 'Zenodo (CERN)', icon: Globe, color: 'text-blue-600' },
                { name: 'Hugging Face', icon: Database, color: 'text-amber-600' },
                { name: 'Harvard Dataverse', icon: Beaker, color: 'text-red-600' },
                { name: 'NCBI GEO', icon: FileSpreadsheet, color: 'text-emerald-600' },
              ].map((src) => (
                <div key={src.name} className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-slate-200/80 shadow-xs">
                  <src.icon size={13} className={src.color} />
                  <span className="text-[11px] font-bold text-slate-600">{src.name}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ═══ Search Console ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="max-w-3xl mx-auto mb-8"
          >
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => handleSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search datasets — e.g., 'COVID-19 chest x-ray', 'climate change temperature CSV'..."
                className="w-full pl-11 pr-28 py-4 bg-white border border-[#E5E5DF] rounded-2xl text-sm font-medium text-[#171717] placeholder:text-slate-400 focus:border-[#315CFF] focus:ring-2 focus:ring-[#315CFF]/10 outline-none transition-all shadow-sm"
                autoFocus
              />
              <button
                onClick={() => { if (query.trim()) performSearch(query, 1); }}
                disabled={!query.trim() || loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-[#315CFF] hover:bg-[#2547d0] disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : 'Search'}
              </button>
            </div>

            {/* Trending Pills */}
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {TRENDING_PILLS.map((pill) => (
                <button
                  key={pill.query}
                  onClick={() => handlePillClick(pill.query)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-[#E5E5DF] hover:border-[#315CFF]/40 rounded-xl text-xs font-medium text-slate-600 hover:text-[#315CFF] transition-all shadow-2xs cursor-pointer"
                >
                  <span>{pill.icon}</span>
                  <span>{pill.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* ═══ Filter Bar ═══ */}
          <div className="mb-8">
            <DatasetFilterBar
              discipline={discipline}
              setDiscipline={setDiscipline}
              format={format}
              setFormat={setFormat}
              source={source}
              setSource={setSource}
              sort={sort}
              setSort={setSort}
              onReset={handleResetFilters}
            />
          </div>

          {/* ═══ Results Meta Header ═══ */}
          {searched && !loading && results.length > 0 && (
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
              <div className="flex items-center gap-3">
                <span className="px-3.5 py-1.5 rounded-full bg-[#315CFF] text-white text-xs font-bold shadow-sm">
                  {totalResults.toLocaleString()} Datasets Found
                </span>
                {cachedHit && (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                    ⚡ Instant Cache
                  </span>
                )}
                {sourcesQueried.length > 0 && (
                  <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                    Aggregated from {sourcesQueried.join(', ')}
                  </span>
                )}
              </div>

              <span className="text-xs text-slate-500 font-medium">
                Page {page} of {Math.max(1, Math.ceil(totalResults / pageSize))}
              </span>
            </div>
          )}

          {/* ═══ Loading Skeleton ═══ */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#E5E5DF] p-5 animate-pulse">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-16 h-5 bg-slate-100 rounded-full" />
                    <div className="w-12 h-4 bg-slate-50 rounded ml-auto" />
                  </div>
                  <div className="w-full h-4 bg-slate-100 rounded mb-2" />
                  <div className="w-3/4 h-4 bg-slate-100 rounded mb-3" />
                  <div className="w-full h-3 bg-slate-50 rounded mb-1" />
                  <div className="w-5/6 h-3 bg-slate-50 rounded mb-4" />
                  <div className="flex gap-2 mb-3">
                    <div className="w-10 h-5 bg-green-50 rounded" />
                    <div className="w-10 h-5 bg-yellow-50 rounded" />
                    <div className="w-10 h-5 bg-purple-50 rounded" />
                  </div>
                  <div className="border-t border-slate-100 pt-3 flex gap-2">
                    <div className="w-20 h-7 bg-blue-50 rounded-lg" />
                    <div className="w-20 h-7 bg-violet-50 rounded-lg" />
                    <div className="w-16 h-7 bg-slate-50 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ═══ Error State ═══ */}
          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
                <ServerCrash size={28} className="text-red-500" />
              </div>
              <p className="text-sm font-bold text-red-600">{error}</p>
              <button
                onClick={() => performSearch(query, page)}
                className="px-5 py-2.5 bg-[#315CFF] text-white rounded-xl text-xs font-bold hover:bg-[#2547d0] transition-colors"
              >
                Retry Search
              </button>
            </div>
          )}

          {/* ═══ Results Grid ═══ */}
          {!loading && !error && results.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {results.map((dataset, index) => (
                <DatasetCard
                  key={dataset.id || index}
                  dataset={dataset}
                  index={index}
                  onAiTopics={handleAiTopics}
                  onStarterCode={handleStarterCode}
                />
              ))}
            </div>
          )}

          {/* ═══ Empty State (After Search) ═══ */}
          {searched && !loading && !error && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                <AlertCircle size={28} className="text-slate-400" />
              </div>
              <div className="text-center">
                <h3 className="text-base font-bold text-[#171717] mb-1">No Datasets Found</h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  Try a different search term or adjust your filters. 
                  Open datasets are available across biomedical, AI/ML, climate, economics, and more.
                </p>
              </div>
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#315CFF] hover:bg-[#315CFF]/5 rounded-xl transition-colors"
              >
                <RefreshCw size={13} />
                Reset Filters
              </button>
            </div>
          )}

          {/* ═══ Pre-Search: Trending Section ═══ */}
          {!searched && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Trending Header */}
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp size={16} className="text-[#315CFF]" />
                <h2 className="text-lg font-bold text-[#171717]">Trending Datasets</h2>
              </div>

              {/* Trending Grid */}
              {trendingLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-[#E5E5DF] p-5 animate-pulse">
                      <div className="w-20 h-5 bg-slate-100 rounded-full mb-3" />
                      <div className="w-full h-4 bg-slate-100 rounded mb-2" />
                      <div className="w-3/4 h-4 bg-slate-100 rounded mb-4" />
                      <div className="w-full h-3 bg-slate-50 rounded" />
                    </div>
                  ))}
                </div>
              ) : trendingDatasets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {trendingDatasets.map((dataset, index) => (
                    <DatasetCard
                      key={dataset.id || index}
                      dataset={dataset}
                      index={index}
                      onAiTopics={handleAiTopics}
                      onStarterCode={handleStarterCode}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-sm text-slate-500">
                    Start searching to discover millions of open-access datasets.
                  </p>
                </div>
              )}

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-12">
                {[
                  {
                    icon: Sparkles,
                    color: 'from-violet-500 to-purple-600',
                    shadow: 'shadow-purple-500/20',
                    title: 'AI Topic Generator',
                    desc: 'Get 3 publishable thesis topics, research gaps, and recommended models from any dataset.',
                  },
                  {
                    icon: Cpu,
                    color: 'from-slate-700 to-slate-900',
                    shadow: 'shadow-slate-500/20',
                    title: 'Python / R Starter Code',
                    desc: 'Ready-to-run Pandas or Tidyverse scripts for loading, cleaning, and visualizing data.',
                  },
                  {
                    icon: Globe,
                    color: 'from-[#315CFF] to-blue-600',
                    shadow: 'shadow-blue-500/20',
                    title: 'Zero-Storage Downloads',
                    desc: 'Files download directly from source CDNs (CERN, HuggingFace, Harvard) — no server proxy.',
                  },
                ].map((feat, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-[#E5E5DF] p-6 hover:border-[#315CFF]/20 hover:shadow-lg hover:shadow-blue-500/5 transition-all"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center shadow-lg ${feat.shadow} mb-4`}>
                      <feat.icon size={20} className="text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-[#171717] mb-1.5">{feat.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{feat.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ═══ Modals ═══ */}
      <DatasetAiModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        dataset={selectedDataset}
        userTier={userTier}
      />
      <DatasetCodeModal
        isOpen={codeModalOpen}
        onClose={() => setCodeModalOpen(false)}
        dataset={selectedDataset}
        userTier={userTier}
      />
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </WorkspaceLayout>
  );
};

export default DataHub;
