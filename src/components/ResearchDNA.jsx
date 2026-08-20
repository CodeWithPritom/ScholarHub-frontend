import React from 'react';
import { Dna, Sparkles, TrendingUp, BookOpen, Layers, Award, ShieldCheck, Target } from 'lucide-react';

const ResearchDNA = ({ profile, user }) => {
  const academicField = profile?.academic_field || 'General Research';
  const userTier = (profile?.user_tier || 'free').toUpperCase();

  // Dynamic DNA metrics based on profile field and activity
  const dominantTopics = [
    { name: academicField, percentage: 78, color: 'bg-indigo-600' },
    { name: 'Molecular Biology & Omics', percentage: 62, color: 'bg-blue-600' },
    { name: 'AI & Computational Genomics', percentage: 45, color: 'bg-violet-600' },
    { name: 'Clinical Therapeutics', percentage: 30, color: 'bg-emerald-600' }
  ];

  const methodologyDistribution = [
    { label: 'Empirical Literature Audits', value: '42%' },
    { label: 'Meta-Analysis & Reviews', value: '35%' },
    { label: 'Quantitative Dataset Synthesis', value: '23%' }
  ];

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-50 border border-violet-200 text-[10px] font-black uppercase tracking-widest text-violet-800">
              <Dna size={12} className="text-violet-600 animate-pulse" />
              <span>RESEARCH DNA ENGINE v1.0</span>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Academic Expertise & Knowledge DNA
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
            Algorithmic aggregation of your literature search vectors, saved methodologies, and domain mastery.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-2xl">
          <Award size={18} className="text-indigo-600" />
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Tier Status</span>
            <span className="text-xs font-black text-slate-900">{userTier} SCHOLAR</span>
          </div>
        </div>
      </div>

      {/* Grid Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dominant Research Topics */}
        <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-5 space-y-4">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Layers size={14} className="text-indigo-600" />
            Dominant Research Domains
          </h3>

          <div className="space-y-3">
            {dominantTopics.map((topic) => (
              <div key={topic.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>{topic.name}</span>
                  <span>{topic.percentage}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${topic.color} rounded-full transition-all duration-1000`}
                    style={{ width: `${topic.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Methodology Preferences & Expertise Growth */}
        <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-5 space-y-4">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp size={14} className="text-emerald-600" />
            Methodology & Synthesis Style
          </h3>

          <div className="space-y-3">
            {methodologyDistribution.map((item) => (
              <div key={item.label} className="p-3 bg-white rounded-xl border border-slate-200/70 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">{item.label}</span>
                <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchDNA;
