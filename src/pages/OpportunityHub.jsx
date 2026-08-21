import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Loader2, Award, Search, GraduationCap } from 'lucide-react';
import WorkspaceLayout from '../components/WorkspaceLayout';
import OpportunityCard from '../components/intelligence/OpportunityCard';
import SupervisorDiscovery from '../components/intelligence/SupervisorDiscovery';
import SEOHead from '../components/SEOHead';
import { BASE_URL } from '../utils/api';
import { supabase } from '../supabaseClient';

const OPPORTUNITY_TYPES = [
  { id: 'all', label: 'All Positions' },
  { id: 'supervisors', label: '🔬 Find Supervisors & Labs' },
  { id: 'scholarship', label: 'Scholarships' },
  { id: 'fellowship', label: 'Fellowships' },
  { id: 'phd', label: 'PhD Positions' },
  { id: 'postdoc', label: 'Postdocs' },
  { id: 'ra', label: 'Research Assistants' },
  { id: 'faculty', label: 'Faculty Jobs' }
];

const OpportunityHub = ({ user, profile, onLogout, liveUsersCount }) => {
  const navigate = useNavigate();

  // Opportunity states
  const [opportunities, setOpportunities] = useState([]);
  const [activeType, setActiveType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Helper to fetch auth token
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

  const fetchOpportunities = useCallback(async (type = 'all', query = '') => {
    try {
      setLoading(true);
      const headers = await getAuthHeader();
      const typeParam = type !== 'all' ? `&type=${type}` : '';
      const queryParam = query ? `&search=${encodeURIComponent(query)}` : '';
      const url = `${BASE_URL}/api/intelligence/opportunities?limit=24${typeParam}${queryParam}`;

      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        setOpportunities(data.opportunities || []);
      }
    } catch (e) {
      console.error('[OpportunityHub] Fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOpportunities(activeType, searchQuery);
  }, [activeType, fetchOpportunities, user?.id]);

  const handleTypeChange = (typeId) => {
    setActiveType(typeId);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOpportunities(activeType, searchQuery);
  };

  // Construct Dynamic Schema.org JSON-LD for Academic Grants & Scholarships
  const oppSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Global Research Grants, Fellowships & PhD Positions Directory | ScholarHub AI",
    "url": "https://scholarhub-ai.com/opportunities",
    "description": "Curated global academic opportunities from EURAXESS, DAAD, Marie Skłodowska-Curie Actions (MSCA), and leading university research labs.",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": opportunities.slice(0, 15).map((opp, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "item": {
          "@type": "JobPosting",
          "title": opp.title,
          "description": opp.description || opp.full_description || opp.title,
          "datePosted": opp.published_at || new Date().toISOString(),
          "validThrough": opp.deadline ? `${opp.deadline}T23:59:59Z` : undefined,
          "hiringOrganization": {
            "@type": "Organization",
            "name": opp.organization || opp.source_name || "Academic Institution"
          },
          "jobLocation": {
            "@type": "Place",
            "address": opp.location || "Global / Remote"
          },
          "url": `https://scholarhub-ai.com/opportunities?id=${opp.id}`
        }
      }))
    }
  };

  return (
    <WorkspaceLayout user={user} profile={profile} onLogout={onLogout} hideNav={true}>
      <SEOHead
        title="Academic Opportunities, Scholarships & Research Grants | ScholarHub AI"
        description="Search vetted PhD funding, postdoctoral fellowships, laboratory positions, and international research grants on ScholarHub AI."
        canonicalPath="/opportunities"
        schemaJson={oppSchema}
      />
      <div className="w-full px-4 sm:px-6 md:px-8 2xl:px-12 space-y-8 pt-6 pb-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200/90">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-black uppercase tracking-widest text-emerald-800">
              <Award size={11} className="text-emerald-600" />
              <span>ACADEMIC POSITIONS & GRANTS</span>
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Research Grants & Fellowships
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium max-w-2xl">
              Curated global academic opportunities from <strong className="text-slate-800">EURAXESS</strong>, <strong className="text-slate-800">DAAD</strong>, <strong className="text-slate-800">Marie Skłodowska-Curie Actions (MSCA)</strong>, and top global university portals.
            </p>
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80 shrink-0">
            <input
              type="text"
              placeholder="Search by institution, country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 shadow-sm"
            />
            <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
          </form>
        </div>

        {/* Type Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {OPPORTUNITY_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => handleTypeChange(t.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeType === t.id
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-xs'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Grid Area */}
        {activeType === 'supervisors' ? (
          <SupervisorDiscovery />
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-56 rounded-[12px] bg-white border border-[#E5E5DF]/80 p-5 animate-pulse flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="h-4 w-1/4 rounded bg-slate-100" />
                  <div className="h-6 w-3/4 rounded bg-slate-200" />
                  <div className="h-12 w-full rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : opportunities.length === 0 ? (
          <div className="rounded-[12px] border border-[#E5E5DF]/80 bg-white p-12 text-center space-y-3">
            <GraduationCap size={28} className="mx-auto text-slate-600" />
            <h4 className="text-base font-bold text-slate-800">No Positions Found</h4>
            <p className="text-xs text-slate-700 max-w-xs mx-auto leading-relaxed">
              No active grants or fellowships match your search criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {opportunities.map((opp, idx) => (
              <div key={opp.id} className={idx === 0 ? "md:col-span-2 md:row-span-2" : ""}>
                <OpportunityCard opportunity={opp} user={user} profile={profile} />
              </div>
            ))}
          </div>
        )}

      </div>
    </WorkspaceLayout>
  );
};

export default OpportunityHub;
