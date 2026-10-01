/**
 * DatasetCard.jsx — Rich Dataset Result Card
 * Displays normalized dataset metadata with format badges, source icons,
 * download buttons, AI topic trigger, and code snippet trigger.
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  Download, ExternalLink, Sparkles, Code2, Copy, Check,
  Calendar, HardDrive, Scale, Tag, Users, TrendingUp,
  Database, Globe, Beaker, FileSpreadsheet
} from 'lucide-react';

// Source configuration with colors and icons
const SOURCE_CONFIG = {
  zenodo: {
    name: 'Zenodo',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    dotColor: 'bg-blue-500',
    icon: Globe,
  },
  huggingface: {
    name: 'Hugging Face',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    dotColor: 'bg-amber-500',
    icon: Database,
  },
  dataverse: {
    name: 'Harvard Dataverse',
    color: 'bg-red-100 text-red-700 border-red-200',
    dotColor: 'bg-red-500',
    icon: Beaker,
  },
  ncbi_geo: {
    name: 'NCBI GEO',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    dotColor: 'bg-emerald-500',
    icon: FileSpreadsheet,
  },
};

// Format badge color mapping
const FORMAT_COLORS = {
  CSV: 'bg-green-100 text-green-700 border-green-200',
  JSON: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  PARQUET: 'bg-purple-100 text-purple-700 border-purple-200',
  ZIP: 'bg-slate-200 text-slate-700 border-slate-300',
  XLSX: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  XLS: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  TSV: 'bg-teal-100 text-teal-700 border-teal-200',
  TXT: 'bg-gray-100 text-gray-600 border-gray-200',
  GZ: 'bg-orange-100 text-orange-700 border-orange-200',
  TAR: 'bg-orange-100 text-orange-700 border-orange-200',
  HDF5: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  FASTA: 'bg-pink-100 text-pink-700 border-pink-200',
  CEL: 'bg-rose-100 text-rose-700 border-rose-200',
  NETCDF: 'bg-sky-100 text-sky-700 border-sky-200',
  DATA: 'bg-slate-100 text-slate-600 border-slate-200',
};

const DatasetCard = ({ dataset, onAiTopics, onStarterCode, index = 0 }) => {
  const [doiCopied, setDoiCopied] = React.useState(false);
  const src = SOURCE_CONFIG[dataset.source] || SOURCE_CONFIG.zenodo;
  const SourceIcon = src.icon;

  const handleCopyDoi = () => {
    if (dataset.doi) {
      navigator.clipboard.writeText(`https://doi.org/${dataset.doi}`);
      setDoiCopied(true);
      setTimeout(() => setDoiCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (dataset.download_url) {
      window.open(dataset.download_url, '_blank', 'noopener,noreferrer');
    } else if (dataset.source_url) {
      window.open(dataset.source_url, '_blank', 'noopener,noreferrer');
    }
  };

  // Strip HTML tags from description
  const cleanDescription = (desc) => {
    if (!desc) return '';
    return desc.replace(/<[^>]*>/g, '').replace(/&[a-zA-Z]+;/g, ' ').trim();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group relative bg-white rounded-2xl border border-[#E5E5DF] hover:border-[#315CFF]/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300"
    >
      {/* Top Section: Source Badge + Title */}
      <div className="p-5 pb-3">
        {/* Source Badge */}
        <div className="flex items-center justify-between mb-3">
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${src.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${src.dotColor}`} />
            {src.name}
          </div>
          {dataset.license && dataset.license !== 'Unknown' && (
            <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
              <Scale size={11} />
              <span className="max-w-[80px] truncate">{dataset.license}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-[#171717] leading-snug line-clamp-2 mb-2 group-hover:text-[#315CFF] transition-colors cursor-pointer"
            onClick={() => window.open(dataset.source_url, '_blank', 'noopener,noreferrer')}
            title={dataset.title}
        >
          {dataset.title}
        </h3>

        {/* Description */}
        {dataset.description && (
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3">
            {cleanDescription(dataset.description)}
          </p>
        )}

        {/* Authors */}
        {dataset.authors && dataset.authors.length > 0 && (
          <div className="flex items-center gap-1.5 mb-3">
            <Users size={12} className="text-slate-400 shrink-0" />
            <span className="text-[11px] text-slate-500 truncate">
              {dataset.authors.slice(0, 3).join(', ')}
              {dataset.authors.length > 3 && ` +${dataset.authors.length - 3}`}
            </span>
          </div>
        )}

        {/* Format Badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {(dataset.formats || []).slice(0, 5).map((fmt) => (
            <span
              key={fmt}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border ${FORMAT_COLORS[fmt.toUpperCase()] || FORMAT_COLORS.DATA}`}
            >
              {fmt}
            </span>
          ))}
        </div>

        {/* Tags */}
        {dataset.tags && dataset.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {dataset.tags.slice(0, 4).map((tag, i) => (
              <span key={i} className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded-md text-[10px] font-medium border border-slate-100 truncate max-w-[120px]">
                {tag}
              </span>
            ))}
            {dataset.tags.length > 4 && (
              <span className="px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
                +{dataset.tags.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Metadata Row */}
        <div className="flex items-center flex-wrap gap-3 text-[11px] text-slate-400 font-medium">
          {dataset.published_date && (
            <div className="flex items-center gap-1">
              <Calendar size={11} />
              <span>{dataset.published_date}</span>
            </div>
          )}
          {dataset.size_human && dataset.size_human !== 'Unknown' && (
            <div className="flex items-center gap-1">
              <HardDrive size={11} />
              <span>{dataset.size_human}</span>
            </div>
          )}
          {dataset.downloads_count != null && dataset.downloads_count > 0 && (
            <div className="flex items-center gap-1">
              <TrendingUp size={11} />
              <span>{dataset.downloads_count.toLocaleString()} downloads</span>
            </div>
          )}
          {dataset.citation_count != null && dataset.citation_count > 0 && (
            <div className="flex items-center gap-1">
              <Tag size={11} />
              <span>{dataset.citation_count.toLocaleString()} citations</span>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#E5E5DF]" />

      {/* Action Buttons */}
      <div className="px-4 py-3 flex items-center gap-2 flex-wrap">
        {/* Download */}
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#315CFF] hover:bg-[#2547d0] text-white rounded-lg text-[11px] font-bold transition-colors"
        >
          <Download size={12} />
          Download
        </button>

        {/* AI Topics */}
        <button
          onClick={() => onAiTopics?.(dataset)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-lg text-[11px] font-bold transition-all"
        >
          <Sparkles size={12} />
          AI Topics
        </button>

        {/* Starter Code */}
        <button
          onClick={() => onStarterCode?.(dataset)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-colors border border-slate-200"
        >
          <Code2 size={12} />
          Code
        </button>

        {/* DOI Copy */}
        {dataset.doi && (
          <button
            onClick={handleCopyDoi}
            className="inline-flex items-center gap-1 px-2 py-1.5 text-[10px] font-semibold text-slate-400 hover:text-[#315CFF] transition-colors ml-auto"
            title={`DOI: ${dataset.doi}`}
          >
            {doiCopied ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
            {doiCopied ? 'Copied!' : 'DOI'}
          </button>
        )}

        {/* View Source */}
        <button
          onClick={() => window.open(dataset.source_url, '_blank', 'noopener,noreferrer')}
          className="inline-flex items-center gap-1 px-2 py-1.5 text-[10px] font-semibold text-slate-400 hover:text-[#315CFF] transition-colors"
          title="Open in source repository"
        >
          <ExternalLink size={11} />
          Source
        </button>
      </div>
    </motion.div>
  );
};

export default DatasetCard;
