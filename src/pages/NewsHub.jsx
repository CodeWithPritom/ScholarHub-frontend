import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Newspaper, RefreshCw, Loader2, Sparkles, Filter, 
  ChevronRight, Compass, Settings
} from 'lucide-react';
import WorkspaceLayout from '../components/WorkspaceLayout';
import NewsCard from '../components/intelligence/NewsCard';
import CategoryFilter from '../components/intelligence/CategoryFilter';
import InterestSelector from '../components/intelligence/InterestSelector';
import { BASE_URL } from '../utils/api';
import { supabase } from '../supabaseClient';

const NewsHub = ({ user, profile, onLogout, liveUsersCount }) => {
  const navigate = useNavigate();

  // News states
  const [articles, setArticles] = useState([]);
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isMember, setIsMember] = useState(!!user);

  // Interest onboarding states
  const [userInterests, setUserInterests] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Helper to fetch auth token for backend request
  const getAuthHeader = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        return { Authorization: `Bearer ${session.access_token}` };
      }
    } catch (e) {
      /* ignore */
    }
    return {};
  };

  // Check user interests on load
  const checkUserInterests = useCallback(async () => {
    if (!user) return;
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${BASE_URL}/api/intelligence/user-interests`, { headers });
      if (res.ok) {
        const data = await res.json();
        const interestsObj = data.interests;
        setUserInterests(interestsObj);

        // Show onboarding modal if user has no stored interests or empty disciplines array
        if (!interestsObj || !interestsObj.disciplines || interestsObj.disciplines.length === 0) {
          setShowOnboarding(true);
        }
      }
    } catch (e) {
      console.warn('[NewsHub] Error checking user interests:', e);
    }
  }, [user?.id]);

  // Save User Interests
  const handleSaveInterests = async (selectedDisciplines) => {
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${BASE_URL}/api/intelligence/user-interests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({ disciplines: selectedDisciplines })
      });

      if (res.ok) {
        setShowOnboarding(false);
        setUserInterests({ disciplines: selectedDisciplines });
        // Refresh feed
        fetchNews(1, activeCategory, false);
      }
    } catch (e) {
      console.error('[NewsHub] Error saving interests:', e);
    }
  };

  // Fetch Featured Articles
  const fetchFeatured = useCallback(async () => {
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${BASE_URL}/api/intelligence/news/featured`, { headers });
      if (res.ok) {
        const data = await res.json();
        setFeaturedArticles(data.featured || []);
        if (data.is_member !== undefined) setIsMember(data.is_member);
      }
    } catch (e) {
      console.warn('[NewsHub] Error fetching featured news:', e);
    }
  }, []);

  // Fetch News Feed
  const fetchNews = useCallback(async (pageNum = 1, category = 'all', append = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const headers = await getAuthHeader();
      const categoryParam = category !== 'all' ? `&category=${category}` : '';
      const url = `${BASE_URL}/api/intelligence/news?page=${pageNum}&limit=12${categoryParam}`;

      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        const newItems = data.articles || [];
        setHasMore(data.has_more || false);
        if (data.is_member !== undefined) setIsMember(data.is_member);

        if (append) {
          setArticles(prev => [...prev, ...newItems]);
        } else {
          setArticles(newItems);
        }
      }
    } catch (e) {
      console.error('[NewsHub] Error fetching news feed:', e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchFeatured();
    fetchNews(1, activeCategory, false);
    checkUserInterests();
  }, [activeCategory, fetchFeatured, fetchNews, checkUserInterests, user?.id]);

  // Handle Category Change
  const handleCategoryChange = (catId) => {
    setActiveCategory(catId);
    setPage(1);
  };

  // Handle Load More
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNews(nextPage, activeCategory, true);
  };

  // Handle Manual Trigger Refresh
  const handleTriggerRefresh = async () => {
    setRefreshing(true);
    try {
      const headers = await getAuthHeader();
      await fetch(`${BASE_URL}/api/intelligence/trigger-fetch`, {
        method: 'POST',
        headers
      });
      await fetchNews(1, activeCategory, false);
      await fetchFeatured();
    } catch (e) {
      console.error('[NewsHub] Refresh error:', e);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <WorkspaceLayout user={user} profile={profile} onLogout={onLogout} hideNav={true}>
      <div className="w-full px-4 sm:px-6 md:px-8 2xl:px-12 space-y-8 py-4">
        
        {/* 1. Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200/80">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-700 block mb-1">
              Literature Intelligence & Personalization
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#171717] tracking-tight">
              Scientific Discoveries & Feed
            </h1>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed font-normal max-w-xl">
              Autonomously aggregated and AI-summarized literature breakthroughs from Nature, Science, EurekAlert, and PubMed.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {user && (
              <button
                onClick={() => setShowOnboarding(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs cursor-pointer"
              >
                <Compass size={14} className="text-slate-700" />
                <span>Interests</span>
              </button>
            )}

            <button
              onClick={handleTriggerRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-all shadow-2xs cursor-pointer disabled:opacity-60"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin text-slate-600' : 'text-slate-600'} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh Feeds'}</span>
            </button>
          </div>
        </div>

        {/* 2. Guest Preview Box */}
        {!user && (
          <div className="rounded-2xl bg-white border border-slate-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-700 block">
                Guest Mode
              </span>
              <h2 className="text-base font-bold text-[#171717]">
                Unlock Full Executive AI Summaries
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed max-w-lg">
                Join ScholarHub AI to access multi-paper comparative analysis, AI summaries, and automated keyword monitoring.
              </p>
            </div>
            <button
              onClick={() => navigate('/auth')}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold tracking-wide transition-all shadow-2xs flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <span>Sign Up Free</span>
              <ChevronRight size={14} />
            </button>
          </div>
        )}

        {/* 3. Category Filters */}
        <div className="space-y-3">
          <CategoryFilter
            activeCategory={activeCategory}
            onChange={handleCategoryChange}
          />

          {/* Personalization Active Status */}
          {user && (
            <div className="flex items-center justify-between text-xs text-slate-700 pt-1 font-normal">
              <span>
                Personalize your feed: {userInterests?.disciplines?.length ? `${userInterests.disciplines.length} interests active` : 'No interests selected'}
              </span>
            </div>
          )}
        </div>

        {/* 4. Article Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-64 rounded-2xl bg-white border border-slate-200/80 p-5 animate-pulse flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="h-4 w-1/3 rounded bg-slate-100" />
                  <div className="h-6 w-3/4 rounded bg-slate-200" />
                  <div className="h-16 w-full rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center space-y-3">
            <Newspaper size={28} className="mx-auto text-slate-600" />
            <h4 className="text-base font-bold text-slate-800">No News Items Found</h4>
            <p className="text-xs text-slate-700 max-w-xs mx-auto leading-relaxed">
              No articles matched this category. Click 'Refresh Feeds' above to fetch latest publications.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {articles.map((art, idx) => (
              <div key={art.id} className={idx === 0 ? "md:col-span-2 md:row-span-2" : ""}>
                <NewsCard article={art} user={user} />
              </div>
            ))}
          </div>
        )}

        {/* 5. Load More Button */}
        {!loading && hasMore && (
          <div className="pt-4 text-center">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer disabled:opacity-60"
            >
              {loadingMore ? (
                <>
                  <Loader2 size={14} className="animate-spin text-slate-700" />
                  <span>Loading More...</span>
                </>
              ) : (
                <span>Load More Discoveries</span>
              )}
            </button>
          </div>
        )}

        {/* First-Time Interest Onboarding Modal Overlay */}
        {showOnboarding && user && (
          <InterestSelector
            initialSelected={userInterests?.disciplines || []}
            onSave={handleSaveInterests}
            onClose={() => setShowOnboarding(false)}
            isModal={true}
          />
        )}

      </div>
    </WorkspaceLayout>
  );
};

export default NewsHub;
