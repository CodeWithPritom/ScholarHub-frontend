import React, { useState } from 'react';
import { Search, Building, GraduationCap, Award, ExternalLink, Sparkles, Loader2, UserCheck, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../supabaseClient';
import { BASE_URL } from '../../utils/api';

const SupervisorDiscovery = () => {
  const [query, setQuery] = useState('');
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        toast.error('Authentication required to discover supervisors.');
        setLoading(false);
        return;
      }

      const res = await fetch(`${BASE_URL}/api/intelligence/supervisors/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: query.trim(), limit: 12 })
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.detail || 'Failed to search supervisors.');
        return;
      }

      setSupervisors(data.supervisors || []);
    } catch (err) {
      toast.error(err.message || 'Error executing supervisor search.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white border border-slate-800 shadow-xl space-y-4">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-[10px] font-black uppercase tracking-widest text-indigo-300">
            <Sparkles size={11} className="text-indigo-400 animate-pulse" />
            <span>OPENALEX & ORCID INTEL ENGINE</span>
          </span>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Supervisor & Lab Discovery Engine
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xl leading-relaxed">
            Discover active Principal Investigators (PIs), lab heads, and potential thesis supervisors based on open-source research metadata.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 pt-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by topic (e.g. CRISPR Gene Editing, Nanomedicine, Quantum Computing)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-inner"
            />
            <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 shrink-0"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
            <span>Find Supervisors</span>
          </button>
        </form>
      </div>

      {/* Grid Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-56 rounded-2xl bg-white border border-slate-200 p-6 animate-pulse space-y-4">
              <div className="h-4 w-1/3 rounded bg-slate-100" />
              <div className="h-6 w-3/4 rounded bg-slate-200" />
              <div className="h-16 w-full rounded bg-slate-100" />
            </div>
          ))}
        </div>
      ) : searched && supervisors.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-3">
          <GraduationCap size={32} className="mx-auto text-slate-400" />
          <h4 className="text-base font-bold text-slate-800">No Supervisors Found</h4>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            Try refining your topic query or searching for broader scientific disciplines.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {supervisors.map((s) => (
            <div key={s.id} className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:border-indigo-300 hover:shadow-xl flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-black uppercase tracking-wider text-emerald-800">
                    <UserCheck size={11} className="text-emerald-600" />
                    <span>ACTIVE PI</span>
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                    <Award size={13} className="text-amber-500" />
                    <span>h-index: {s.h_index}</span>
                  </div>
                </div>

                <h3 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug mb-1">
                  {s.name}
                </h3>

                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-3">
                  <Building size={14} className="text-slate-400 shrink-0" />
                  <span className="truncate">{s.institution} ({s.country})</span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 mb-4">
                  {s.topics.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-700 border border-slate-200/60">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-1 text-[11px]">
                  <BookOpen size={13} className="text-slate-400" />
                  <span>{s.works_count} Works ({s.citations?.toLocaleString()} Citing)</span>
                </span>

                {s.orcid_url ? (
                  <a
                    href={s.orcid_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-black text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    <span>ORCID</span>
                    <ExternalLink size={13} />
                  </a>
                ) : (
                  <span className="text-[11px] font-bold text-slate-400">OpenAlex Verified</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupervisorDiscovery;
