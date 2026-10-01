/**
 * DatasetCodeModal.jsx — Python/R Starter Code Generator Modal
 * Generates ready-to-run code for loading and cleaning datasets.
 * Features syntax-highlighted code with 1-click copy.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2, X, Copy, Check, Loader2, AlertTriangle,
  Terminal, Lock, Zap, ArrowRight
} from 'lucide-react';
import { BASE_URL } from '../../utils/api';

const DatasetCodeModal = ({ isOpen, onClose, dataset, userTier = 'free' }) => {
  const [language, setLanguage] = useState('python');
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Locked for free tier
  const isLocked = userTier === 'free';

  useEffect(() => {
    if (isOpen && dataset && !isLocked) {
      fetchCode();
    }
  }, [isOpen, dataset?.id, language]);

  useEffect(() => {
    if (!isOpen) {
      setCode('');
      setError(null);
      setCopied(false);
    }
  }, [isOpen]);

  const fetchCode = async () => {
    setLoading(true);
    setError(null);
    setCode('');

    try {
      const res = await fetch(`${BASE_URL}/api/datasets/starter-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataset_title: dataset.title,
          download_url: dataset.download_url || dataset.source_url || '',
          format: (dataset.formats && dataset.formats[0]) || 'CSV',
          language: language,
          source: dataset.source || '',
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setCode(data.code || '');
    } catch (err) {
      console.error('[DatasetCodeModal] Error:', err);
      setError('Code generation temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[680px] md:max-h-[85vh] bg-white rounded-2xl shadow-2xl z-[201] flex flex-col overflow-hidden border border-[#E5E5DF]"
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-[#E5E5DF] bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-lg shadow-slate-500/20">
                    <Terminal size={20} className="text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#171717]">Data Loading Code</h2>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5 line-clamp-1 max-w-[400px]">
                      {dataset?.title}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-slate-100 text-slate-500 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Language Toggle */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => { setLanguage('python'); if (!isLocked) setCode(''); }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    language === 'python'
                      ? 'bg-[#315CFF] text-white shadow-md shadow-blue-500/20'
                      : 'bg-white text-slate-600 border border-[#E5E5DF] hover:border-[#315CFF]/30'
                  }`}
                >
                  🐍 Python (Pandas)
                </button>
                <button
                  onClick={() => { setLanguage('r'); if (!isLocked) setCode(''); }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    language === 'r'
                      ? 'bg-[#315CFF] text-white shadow-md shadow-blue-500/20'
                      : 'bg-white text-slate-600 border border-[#E5E5DF] hover:border-[#315CFF]/30'
                  }`}
                >
                  📊 R (Tidyverse)
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {/* Free Tier Lock */}
              {isLocked && (
                <div className="flex flex-col items-center justify-center py-12 gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 flex items-center justify-center border border-purple-200">
                    <Lock size={28} className="text-purple-500" />
                  </div>
                  <div className="text-center max-w-sm">
                    <h3 className="text-base font-bold text-[#171717] mb-2">
                      Starter Code is a Premium Feature
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Get ready-to-run {language === 'python' ? 'Python Pandas' : 'R Tidyverse'} scripts 
                      for loading, cleaning, and visualizing this dataset.
                    </p>
                  </div>

                  {/* Blurred Preview */}
                  <div className="w-full relative">
                    <div className="bg-slate-900 rounded-xl p-4 blur-[4px] opacity-50 select-none pointer-events-none">
                      <pre className="text-[11px] text-emerald-400 font-mono leading-relaxed">
{language === 'python'
  ? `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# Load dataset
df = pd.read_csv("${dataset?.download_url || 'data.csv'}")

# Preview data
print(df.head())
print(df.info())
print(df.describe())

# Clean missing values
df = df.dropna(subset=['key_column'])
df['date'] = pd.to_datetime(df['date'])

# Visualization
plt.figure(figsize=(10, 6))
df.groupby('category').size().plot(kind='bar')
plt.title('${dataset?.title}')
plt.tight_layout()
plt.show()`
  : `library(tidyverse)
library(readr)

# Load dataset
df <- read_csv("${dataset?.download_url || 'data.csv'}")

# Preview
head(df)
str(df)
summary(df)

# Clean
df <- df %>% drop_na(key_column)

# Visualization
ggplot(df, aes(x = category)) +
  geom_bar(fill = "#315CFF") +
  theme_minimal() +
  labs(title = "${dataset?.title}")`
}
                      </pre>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        onClick={() => window.location.href = '/pricing'}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-xl text-sm font-bold transition-all shadow-xl shadow-purple-500/30"
                      >
                        <Zap size={16} />
                        Unlock with Starter Plan — ৳199/mo
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading */}
              {loading && !isLocked && (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center">
                    <Loader2 size={24} className="text-emerald-400 animate-spin" />
                  </div>
                  <p className="text-sm font-bold text-[#171717]">Generating {language === 'python' ? 'Python' : 'R'} code...</p>
                </div>
              )}

              {/* Error */}
              {error && !loading && !isLocked && (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <AlertTriangle size={24} className="text-red-500" />
                  <p className="text-sm text-red-600 font-semibold">{error}</p>
                  <button onClick={fetchCode} className="px-4 py-2 bg-[#315CFF] text-white rounded-xl text-xs font-bold">
                    Retry
                  </button>
                </div>
              )}

              {/* Code Output */}
              {code && !loading && !isLocked && (
                <div className="relative">
                  {/* Copy Button */}
                  <button
                    onClick={handleCopy}
                    className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-[11px] font-bold transition-colors"
                  >
                    {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>

                  {/* Code Block */}
                  <div className="bg-slate-900 rounded-xl p-5 overflow-x-auto">
                    <pre className="text-[11px] text-emerald-400 font-mono leading-relaxed whitespace-pre-wrap break-words">
                      {code}
                    </pre>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                    <Code2 size={11} />
                    <span>Generated for: {(dataset.formats || ['CSV'])[0]} format from {dataset.source}</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DatasetCodeModal;
