import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Loader2, Award, Search, GraduationCap } from 'lucide-react';
import WorkspaceLayout from '../components/WorkspaceLayout';
import OpportunityCard from '../components/intelligence/OpportunityCard';
import { BASE_URL } from '../utils/api';
import { supabase } from '../supabaseClient';

const OPPORTUNITY_TYPES = [
  { id: 'all', label: 'All Positions' },
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

  return (
    <WorkspaceLayout user={user} profile={profile} onLogout={onLogout} hideNav={true}>
      <div className="w-full px-4 sm:px-6 md:px-8 2xl:px-12 space-y-8 py-4">
        
        {/* Header Section */}
        <div className="pb-6 border-b border-[#E5E5DF]/80">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-700 block mb-1">
            Academic Grants & Positions
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#171717] tracking-tight">
            Research Grants & Fellowships
          </h1>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed font-normal max-w-xl">
            EURAXESS, DAAD, MSCA, and university research opportunities curated for researchers.
          </p>
        </div>

        {/* Type Filter & Search Bar */}
        <div className="space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search by institution, discipline, or country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#E5E5DF] rounded-[8px] py-2.5 pl-10 pr-4 text-xs font-normal text-[#171717] placeholder:text-slate-600 focus:outline-none focus:border-slate-400 shadow-2xs"
            />
            <Search size={14} className="absolute left-3.5 top-3 text-slate-600" />
          </form>

          <div className="flex flex-wrap items-center gap-2">
            {OPPORTUNITY_TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => handleTypeChange(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeType === t.id
                    ? 'bg-[#315CFF] text-white font-semibold shadow-xs rounded-[8px]'
                    : 'bg-white border border-[#E5E5DF] text-slate-700 hover:bg-[#F3F3EF] rounded-[8px]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Area */}
        {loading ? (
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
