import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, Filter, RefreshCcw, Lock, AlertCircle, Database, ArrowUpRight, ChevronUp, ChevronDown, Calendar, Sparkles, LayoutGrid, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SearchBar = ({
  portal, setPortal, userTier, setArticles, setHasSearched,
  suggestionsRef, searchPubMed, setShowSuggestions, searchTerm, handleSearchInput,
  suggestions, loading, resultLimit, setResultLimit, isSearchBlocked, cooldownTime,
  guestCooldown, handleSuggestionClick, showSuggestions, startDate, setStartDate,
  endDate, setEndDate, sortBy, setSortBy, clearFilters, setStarterUnlockModalOpen,
  isRefining, handleAiRefine
}) => {
  const navigate = useNavigate();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPortalDropdownOpen, setIsPortalDropdownOpen] = useState(false);

  const applyDatePreset = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  };

  return (
    <>

      {/* Search Console */}
      <div className="w-full min-h-[140px] md:min-h-[100px] relative" ref={suggestionsRef}>
        <form onSubmit={(e) => { searchPubMed(e); setShowSuggestions(false); }} className="flex flex-col md:flex-row bg-white border border-slate-200/80 rounded-3xl md:rounded-[2rem] shadow-xl p-3 md:p-2 relative group mb-4 w-full gap-4 md:gap-0">
          {/* Search Input Wrapper */}
          <div className="relative w-full md:flex-1 flex items-center min-w-0">
            <div className="absolute left-3 text-slate-400 group-focus-within:text-slate-600 transition-colors">
              <Search size={22} />
            </div>
            <input
              type="text"
              placeholder="Search across all academic databases (NCBI, arXiv, OpenAlex)..."
              className="w-full pl-11 pr-3 py-3 md:py-4 bg-transparent outline-none text-slate-900 font-semibold placeholder:text-slate-400 border-none focus:ring-0"
              value={searchTerm}
              onChange={handleSearchInput}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              disabled={loading}
              autoComplete="off"
            />
            
            {/* Autocomplete Suggestions Dropdown */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 right-0 top-full mt-3 bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-slate-200/60 overflow-hidden z-50"
                >
                  <div className="px-4 py-2 border-b border-slate-50">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Database size={10} />
                      PubMed Suggestions
                    </span>
                  </div>
                  {suggestions.map((term, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSuggestionClick(term)}
                      className="w-full text-left px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors flex items-center gap-3 group/suggest"
                    >
                      <Search size={14} className="text-slate-300 group-hover/suggest:text-slate-500 shrink-0" />
                      <span className="truncate">{term}</span>
                      <ArrowUpRight size={12} className="ml-auto text-slate-200 group-hover/suggest:text-slate-400 shrink-0" />
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Buttons Section */}
          <div className="flex flex-wrap md:flex-nowrap items-center gap-4 md:gap-2 w-full md:w-auto shrink-0 border-t border-slate-100 md:border-none pt-3 md:pt-0">
            {/* AI Refine Button */}
            <button
              type="button"
              onClick={handleAiRefine}
              disabled={isRefining || !searchTerm.trim() || loading}
              title="Optimize query with AI"
              className="flex-1 md:flex-none px-4 py-3.5 md:p-3 shrink-0 text-amber-500 hover:text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-xl md:rounded-2xl transition-all shadow-sm border border-amber-100/80 disabled:opacity-50 flex items-center justify-center"
            >
              <Sparkles size={18} className={isRefining ? "animate-pulse" : ""} />
            </button>



            {/* Fetch Button */}
            <button 
              type="submit"
              disabled={loading || !searchTerm.trim() || isSearchBlocked}
              className="w-full md:w-auto px-6 py-3.5 md:py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-black rounded-xl md:rounded-2xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2 justify-center shrink-0"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : cooldownTime > 0 ? (
                `${cooldownTime}s`
              ) : guestCooldown > 0 ? (
                `Wait ${guestCooldown}s`
              ) : (
                'FETCH'
              )}
            </button>
          </div>
        </form>
          {/* Cooldown Warnings */}
          <AnimatePresence>
            {cooldownTime > 0 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="absolute -bottom-10 left-0 right-0 text-xs font-black text-red-500 flex items-center gap-1.5 bg-red-50 px-4 py-2 rounded-xl border border-red-100"
              >
                <AlertCircle size={14} /> System Cooling Down. Please wait {cooldownTime > 59 ? '1 minute' : `${cooldownTime}s`}.
              </motion.div>
            )}
            {guestCooldown > 0 && cooldownTime === 0 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="absolute -bottom-10 left-0 text-xs font-black text-amber-600 flex items-center gap-1.5 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100"
              >
                <AlertCircle size={14} /> Free Tier cooldown — next search in {guestCooldown}s. <span className="text-slate-900 underline cursor-pointer font-black" onClick={() => navigate('/pricing')}>Upgrade to PRO for instant search</span>
              </motion.div>
            )}
          </AnimatePresence>

        <div className="flex items-center justify-between px-2">
          <button 
            disabled={userTier === 'free'}
            onClick={() => {
              setIsFilterOpen(!isFilterOpen);
            }}
            className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${userTier === 'free' ? 'opacity-50 cursor-not-allowed text-slate-400' : isFilterOpen ? 'text-slate-950' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Filter size={14} />
            {isFilterOpen ? 'Hide Filters' : 'Advanced Filters'} {userTier === 'free' && '🔒'}
            {(startDate || endDate || sortBy !== 'relevance') && (
              <span className="w-5 h-5 bg-slate-900 text-white rounded-full flex items-center justify-center text-[8px]">
                {(startDate ? 1 : 0) + (endDate ? 1 : 0) + (sortBy !== 'relevance' ? 1 : 0)}
              </span>
            )}
            {isFilterOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          
          {(startDate || endDate || sortBy !== 'relevance') && (
            <button 
              onClick={clearFilters}
              className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:text-red-600 transition-colors flex items-center gap-1"
            >
              <RefreshCcw size={12} />
              Reset All
            </button>
          )}
        </div>

        <AnimatePresence>
          {isFilterOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-6 p-8 bg-white border border-slate-100 rounded-[2rem] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)] space-y-0">
                
                {/* 3-Column Filter Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">

                  {/* Column 1: Quick Range */}
                  <div className="min-w-0 space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Calendar size={12} className="text-slate-500" />
                      Quick Range
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: 'Past 30 Days', days: 30 },
                        { label: 'Past 6 Months', days: 180 },
                        { label: 'Past Year', days: 365 },
                        { label: 'Past 5 Years', days: 1825 }
                      ].map((preset) => (
                        <button
                          key={preset.days}
                          onClick={() => applyDatePreset(preset.days)}
                          className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-xl transition-colors border border-slate-100 hover:border-slate-300"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Column 2: Custom Date Range */}
                  <div className="min-w-0 space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Calendar size={12} className="text-slate-500" />
                      Custom Date Range
                    </label>
                    <div className="flex flex-col gap-3">
                      <div className="relative w-full">
                        <input 
                          type="date" 
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-100 text-slate-600 text-sm font-semibold px-4 py-3 rounded-2xl outline-none focus:border-slate-500 transition-colors"
                        />
                        {startDate && (
                          <button onClick={() => setStartDate('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors">
                            <X size={14} />
                          </button>
                        )}
                      </div>
                      <span className="text-slate-300 text-[10px] font-black uppercase tracking-widest text-center">to</span>
                      <div className="relative w-full">
                        <input 
                          type="date" 
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-100 text-slate-600 text-sm font-semibold px-4 py-3 rounded-2xl outline-none focus:border-slate-500 transition-colors"
                        />
                        {endDate && (
                          <button onClick={() => setEndDate('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors">
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Column 3: Algorithm Priority */}
                  <div className="min-w-0 space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <LayoutGrid size={12} className="text-slate-500" />
                      Algorithm Priority
                    </label>
                    <div className="flex flex-col bg-slate-50 p-1.5 rounded-2xl border border-slate-100 gap-1">
                      <button
                        onClick={() => setSortBy('relevance')}
                        className={`w-full py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
                          sortBy === 'relevance' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        Relevance
                      </button>
                      <button
                        onClick={() => setSortBy('date')}
                        className={`w-full py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
                          sortBy === 'date' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        Latest Date
                      </button>
                    </div>
                  </div>

                </div>

                {/* Bottom Action Bar */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <Sparkles size={12} className="text-amber-500" />
                    STARTER / PRO Exclusive
                  </div>
                  <div className="flex items-center gap-3">
                    {(startDate || endDate || sortBy !== 'relevance') && (
                      <button 
                        onClick={clearFilters}
                        className="px-5 py-2.5 bg-slate-50 text-slate-500 hover:text-red-600 hover:bg-red-50 text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors border border-slate-100 hover:border-red-200 flex items-center gap-1.5"
                      >
                        <RefreshCcw size={12} />
                        Reset All
                      </button>
                    )}
                    <button 
                      onClick={() => setIsFilterOpen(false)}
                      className="px-6 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-colors shadow-md shadow-slate-200"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default SearchBar;
