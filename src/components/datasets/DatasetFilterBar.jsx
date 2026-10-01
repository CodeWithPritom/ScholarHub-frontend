/**
 * DatasetFilterBar.jsx — Search Filters for Dataset Hub
 * Discipline, format, source, and sort filters with responsive design.
 * Mobile: Collapsible drawer. Desktop: Horizontal inline bar.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SlidersHorizontal, X, Beaker, Cpu, TrendingUp, Cloud,
  Users, Wrench, ChevronDown, RotateCcw, Database
} from 'lucide-react';

const DISCIPLINES = [
  { id: '', label: 'All Fields', icon: Database },
  { id: 'biomedical', label: 'Biomedical', icon: Beaker },
  { id: 'computer science', label: 'Computer Science / AI', icon: Cpu },
  { id: 'economics', label: 'Economics', icon: TrendingUp },
  { id: 'climate', label: 'Climate / Earth Science', icon: Cloud },
  { id: 'social science', label: 'Social Sciences', icon: Users },
  { id: 'engineering', label: 'Engineering', icon: Wrench },
];

const FORMATS = [
  { id: '', label: 'All Formats' },
  { id: 'CSV', label: 'CSV' },
  { id: 'JSON', label: 'JSON' },
  { id: 'PARQUET', label: 'Parquet' },
  { id: 'ZIP', label: 'ZIP' },
  { id: 'XLSX', label: 'Excel' },
  { id: 'FASTA', label: 'FASTA' },
];

const SOURCES = [
  { id: 'all', label: 'All Sources' },
  { id: 'zenodo', label: 'Zenodo (CERN)' },
  { id: 'huggingface', label: 'Hugging Face' },
  { id: 'dataverse', label: 'Harvard Dataverse' },
  { id: 'ncbi_geo', label: 'NCBI GEO' },
];

const SORTS = [
  { id: 'relevance', label: 'Most Relevant' },
  { id: 'downloads', label: 'Most Downloaded' },
  { id: 'recent', label: 'Most Recent' },
];

const DatasetFilterBar = ({
  discipline, setDiscipline,
  format, setFormat,
  source, setSource,
  sort, setSort,
  onReset,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const hasActiveFilters = discipline || format || source !== 'all' || sort !== 'relevance';

  const FilterSelect = ({ label, value, onChange, options, className = '' }) => (
    <div className={`relative ${className}`}>
      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-white border border-[#E5E5DF] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#171717] cursor-pointer hover:border-[#315CFF]/40 focus:border-[#315CFF] focus:ring-2 focus:ring-[#315CFF]/10 transition-all outline-none pr-8"
        >
          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none mt-[2px]" />
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Filter Bar */}
      <div className="hidden md:flex items-end gap-4 flex-wrap">
        <FilterSelect label="Discipline" value={discipline} onChange={setDiscipline} options={DISCIPLINES} className="min-w-[160px]" />
        <FilterSelect label="Format" value={format} onChange={setFormat} options={FORMATS} className="min-w-[120px]" />
        <FilterSelect label="Source" value={source} onChange={setSource} options={SOURCES} className="min-w-[160px]" />
        <FilterSelect label="Sort By" value={sort} onChange={setSort} options={SORTS} className="min-w-[140px]" />

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold text-slate-500 hover:text-red-500 transition-colors mb-[1px]"
          >
            <RotateCcw size={13} />
            Reset
          </button>
        )}
      </div>

      {/* Mobile Filter Toggle */}
      <div className="md:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
            hasActiveFilters
              ? 'bg-[#315CFF]/10 text-[#315CFF] border-[#315CFF]/30'
              : 'bg-white text-slate-600 border-[#E5E5DF] hover:border-[#315CFF]/30'
          }`}
        >
          <SlidersHorizontal size={14} />
          Filters
          {hasActiveFilters && (
            <span className="w-5 h-5 bg-[#315CFF] text-white rounded-full text-[10px] font-black flex items-center justify-center">
              {[discipline, format, source !== 'all' ? source : '', sort !== 'relevance' ? sort : ''].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 md:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 md:hidden max-h-[80vh] overflow-y-auto"
            >
              <div className="p-6">
                {/* Handle bar */}
                <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />

                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-bold text-[#171717]">Filter Datasets</h3>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-5">
                  <FilterSelect label="Discipline" value={discipline} onChange={setDiscipline} options={DISCIPLINES} />
                  <FilterSelect label="Format" value={format} onChange={setFormat} options={FORMATS} />
                  <FilterSelect label="Source" value={source} onChange={setSource} options={SOURCES} />
                  <FilterSelect label="Sort By" value={sort} onChange={setSort} options={SORTS} />
                </div>

                <div className="flex gap-3 mt-8">
                  {hasActiveFilters && (
                    <button
                      onClick={() => { onReset(); setMobileOpen(false); }}
                      className="flex-1 py-3 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                      Reset All
                    </button>
                  )}
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 py-3 rounded-xl text-xs font-bold text-white bg-[#315CFF] hover:bg-[#2547d0] transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default DatasetFilterBar;
