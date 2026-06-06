import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, Filter, RefreshCcw, Lock, AlertCircle, Database, ArrowUpRight, ChevronUp, ChevronDown, Calendar, Sparkles, LayoutGrid, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const getPortalTheme = (p) => {
  switch (p) {
    case 'geb': return { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-800', textHover: 'text-emerald-600', icon: 'text-emerald-400' }
    case 'pharma': return { bg: 'bg-violet-50', border: 'border-violet-100', text: 'text-violet-800', textHover: 'text-violet-600', icon: 'text-violet-400' }
    case 'chem': return { bg: 'bg-teal-50', border: 'border-teal-100', text: 'text-teal-800', textHover: 'text-teal-600', icon: 'text-teal-400' }
    case 'law': return { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-800', textHover: 'text-slate-600', icon: 'text-slate-400' }
    case 'social': return { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-800', textHover: 'text-amber-600', icon: 'text-amber-400' }
    case 'eng': return { bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-800', textHover: 'text-indigo-600', icon: 'text-indigo-400' }
    case 'physics': return { bg: 'bg-cyan-50', border: 'border-cyan-100', text: 'text-cyan-800', textHover: 'text-cyan-600', icon: 'text-cyan-400' }
    case 'math': return { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-800', textHover: 'text-rose-600', icon: 'text-rose-400' }
    default: return { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-800', textHover: 'text-emerald-600', icon: 'text-emerald-400' }
  }
};

const getPortalDetails = (p) => {
  switch (p) {
    case 'geb': return { name: 'GEB', longName: 'Genetic Eng. & Biotech', icon: '🧬' }
    case 'pharma': return { name: 'Pharmacy', longName: 'Pharmacy & Pharmacology', icon: '💊' }
    case 'eng': return { name: 'Engineering', longName: 'Engineering Workspace', icon: '⚙️' }
    case 'physics': return { name: 'Physics', longName: 'Physics Workspace', icon: '⚛️' }
    case 'math': return { name: 'Mathematics', longName: 'Mathematics Workspace', icon: '📐' }
    case 'social': return { name: 'Social Sci', longName: 'Social Sciences', icon: '🏛️' }
    case 'chem': return { name: 'Chemical Sci', longName: 'Chemical Sciences', icon: '🧪' }
    case 'law': return { name: 'Law & Legal', longName: 'Law & Legal Studies', icon: '⚖️' }
    default: return { name: 'GEB', longName: 'Genetic Eng. & Biotech', icon: '🧬' }
  }
};

const SearchBar = ({
  portal, setPortal, userTier, unlockedPortalState, setArticles, setHasSearched,
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
      {/* Portal Selector */}
      <div className="w-full mb-8 relative">
        {userTier !== 'pro' ? (
          <div className="flex overflow-x-auto whitespace-nowrap scrollbar-hide gap-2 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className={`inline-flex items-center gap-2 px-4 py-2.5 border rounded-2xl shadow-sm ${getPortalTheme(portal).bg} ${getPortalTheme(portal).border}`}>
              <span className="text-sm">
                {getPortalDetails(portal).icon}
              </span>
              <span className={`text-xs font-black uppercase tracking-widest ${getPortalTheme(portal).text}`}>
                {getPortalDetails(portal).name} - {userTier}
              </span>
              <Lock size={12} className={`${getPortalTheme(portal).icon} ml-1`} />
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Dropdown */}
            <div className="hidden md:inline-block relative text-left">
              <button
                type="button"
                onClick={() => setIsPortalDropdownOpen(!isPortalDropdownOpen)}
                className="inline-flex items-center gap-3 px-5 py-3 bg-white border-2 border-slate-100 hover:border-blue-200 rounded-2xl shadow-sm text-sm font-black text-slate-700 uppercase tracking-widest transition-all"
              >
                <span className="flex items-center gap-2">
                  <span>{getPortalDetails(portal).icon}</span>
                  {getPortalDetails(portal).name}
                </span>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${isPortalDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
  
              <AnimatePresence>
                {isPortalDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute left-0 mt-2 w-56 rounded-2xl bg-white shadow-2xl shadow-slate-200 border border-slate-200 z-[100] overflow-y-auto max-h-80 scrollbar-hide"
                  >
                    <div className="p-2 space-y-1">
                      {['geb', 'pharma', 'eng', 'physics', 'math', 'social', 'law', 'chem'].map(pId => {
                        const details = getPortalDetails(pId);
                        const theme = getPortalTheme(pId);
                        const isSelected = portal === pId;
                        return (
                          <button
                            key={pId}
                            onClick={() => {
                              setPortal(pId);
                              setIsPortalDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                              isSelected 
                                ? `${theme.bg} ${theme.textHover}`
                                : 'hover:bg-slate-50 text-slate-600'
                            }`}
                          >
                            <span className="text-sm">{details.icon}</span>
                            {details.name}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Swipeable List */}
            <div className="md:hidden flex overflow-x-auto whitespace-nowrap scrollbar-hide gap-2 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              {['geb', 'pharma', 'eng', 'physics', 'math', 'social', 'law', 'chem'].map(pId => {
                const details = getPortalDetails(pId);
                const theme = getPortalTheme(pId);
                const isSelected = portal === pId;
                return (
                  <button
                    key={pId}
                    onClick={() => setPortal(pId)}
                    className={`inline-flex items-center shrink-0 gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${
                      isSelected 
                        ? `${theme.bg} ${theme.border} ${theme.textHover} shadow-sm`
                        : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-sm">{details.icon}</span>
                    {details.name}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Search Console */}
      <div className="w-full" ref={suggestionsRef}>
        <form onSubmit={(e) => { searchPubMed(e); setShowSuggestions(false); }} className="relative group mb-4">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
            <Search size={22} />
          </div>
          <input
            type="text"
            placeholder="Query topic (e.g., Cancer Genomics)..."
            className="w-full pl-12 pr-4 md:pr-48 py-5 bg-white border-2 border-slate-100 rounded-3xl shadow-2xl shadow-slate-200/50 outline-none focus:border-blue-500 transition-all placeholder:text-slate-400 font-semibold"
            value={searchTerm}
            onChange={handleSearchInput}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            disabled={loading}
            autoComplete="off"
          />
          <div className="relative md:absolute md:right-2 md:inset-y-0 mt-3 md:mt-0 flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full md:w-auto">
            <button
              type="button"
              onClick={handleAiRefine}
              disabled={isRefining || !searchTerm.trim() || loading}
              title="Optimize query with AI"
              className="w-full md:w-auto p-4 md:p-3 text-amber-500 hover:text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-2xl transition-all shadow-sm border border-amber-100 disabled:opacity-50 flex items-center justify-center"
            >
              <Sparkles size={18} className={isRefining ? "animate-pulse" : ""} />
            </button>
            <select 
              value={resultLimit}
              onChange={(e) => setResultLimit(Number(e.target.value))}
              className="w-full md:w-auto appearance-none bg-slate-50 border border-slate-100 text-slate-600 text-xs font-black px-4 py-4 md:py-3 rounded-2xl outline-none hover:border-blue-200 transition-colors cursor-pointer"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50" disabled={userTier === 'free'} className={userTier === 'free' ? 'text-slate-300' : ''}>
                {userTier === 'free' ? '50 🔒' : '50'}
              </option>
              <option value="100" disabled={userTier === 'free' || userTier === 'starter'} className={userTier === 'free' || userTier === 'starter' ? 'text-slate-300' : ''}>
                {userTier === 'free' || userTier === 'starter' ? '100 🔒' : '100'}
              </option>
            </select>
            <button 
              type="submit"
              disabled={loading || !searchTerm.trim() || isSearchBlocked}
              className="w-full md:w-auto px-6 py-4 md:py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black rounded-2xl transition-all shadow-lg shadow-blue-300 disabled:opacity-50 flex items-center gap-2 min-w-[100px] justify-center"
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
                <AlertCircle size={14} /> Guest rate limit — next search in {guestCooldown}s. <span className="text-blue-600 underline cursor-pointer" onClick={() => navigate('/auth')}>Login for unlimited access.</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Autocomplete Suggestions Dropdown */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-slate-200/60 overflow-hidden z-50"
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
                    className="w-full text-left px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-3 group/suggest"
                  >
                    <Search size={14} className="text-slate-300 group-hover/suggest:text-blue-500 shrink-0" />
                    <span className="truncate">{term}</span>
                    <ArrowUpRight size={12} className="ml-auto text-slate-200 group-hover/suggest:text-blue-400 shrink-0" />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        <div className="flex items-center justify-between px-2">
          <button 
            onClick={() => {
              if (userTier === 'free') {
                setStarterUnlockModalOpen(true);
              } else {
                setIsFilterOpen(!isFilterOpen);
              }
            }}
            className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${isFilterOpen ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Filter size={14} />
            {isFilterOpen ? 'Hide Filters' : 'Advanced Filters'}
            {(startDate || endDate || sortBy !== 'relevance') && (
              <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[8px]">
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
              <div className="mt-6 p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl shadow-slate-200/40 space-y-8">
                
                {/* Quick Date Presets */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Calendar size={12} className="text-blue-500" />
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
                        className="px-4 py-2 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 text-xs font-bold rounded-xl transition-colors border border-slate-100 hover:border-blue-200"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Custom Date Filter */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Custom Date Range</label>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="relative w-full sm:flex-1">
                        <input 
                          type="date" 
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-100 text-slate-600 text-sm font-semibold px-4 py-3 rounded-2xl outline-none focus:border-blue-500 transition-colors"
                        />
                        {startDate && (
                          <button onClick={() => setStartDate('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors">
                            <X size={14} />
                          </button>
                        )}
                      </div>
                      <span className="text-slate-300 font-bold hidden sm:inline text-center">to</span>
                      <div className="relative w-full sm:flex-1">
                        <input 
                          type="date" 
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-100 text-slate-600 text-sm font-semibold px-4 py-3 rounded-2xl outline-none focus:border-blue-500 transition-colors"
                        />
                        {endDate && (
                          <button onClick={() => setEndDate('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors">
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sort Selection */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <LayoutGrid size={12} className="text-blue-500" />
                      Algorithm Priority
                    </label>
                    <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
                      <button
                        onClick={() => setSortBy('relevance')}
                        className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
                          sortBy === 'relevance' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        Relevance
                      </button>
                      <button
                        onClick={() => setSortBy('date')}
                        className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
                          sortBy === 'date' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        Latest Date
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <Sparkles size={12} className="text-amber-500" />
                    STARTER / PRO Exclusive
                  </div>
                  <button 
                    onClick={() => setIsFilterOpen(false)}
                    className="px-6 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-200"
                  >
                    Apply Filters
                  </button>
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
