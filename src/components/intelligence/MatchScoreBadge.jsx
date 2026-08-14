import React from 'react';
import { Target, Sparkles } from 'lucide-react';

const MatchScoreBadge = ({ score = 0, size = 'md' }) => {
  if (score === undefined || score === null || score < 1) {
    return null;
  }

  // Determine color scheme based on score range
  let ringColor = '#10b981'; // emerald-500
  let textColor = 'text-emerald-700';
  let bgColor = 'bg-emerald-50/90 border-emerald-200/80';

  if (score < 50) {
    ringColor = '#64748b'; // slate-500
    textColor = 'text-slate-700';
    bgColor = 'bg-slate-50/90 border-slate-200/80';
  } else if (score < 80) {
    ringColor = '#2563eb'; // blue-600
    textColor = 'text-blue-700';
    bgColor = 'bg-blue-50/90 border-blue-200/80';
  }

  const radius = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 backdrop-blur-xs transition-all ${bgColor}`}>
      <div className="relative flex items-center justify-center w-5 h-5">
        <svg className="w-5 h-5 -rotate-90 transform" viewBox="0 0 24 24">
          {/* Background circle */}
          <circle
            cx="12"
            cy="12"
            r={radius}
            stroke="currentColor"
            strokeWidth="2.5"
            className="text-slate-200 opacity-40"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="12"
            cy="12"
            r={radius}
            stroke={ringColor}
            strokeWidth="2.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <Sparkles size={9} className="absolute text-slate-700 opacity-60" />
      </div>
      <span className={`text-[11px] font-black tracking-tight ${textColor}`}>
        {score}% <span className="text-[9px] font-bold opacity-80 uppercase">Match</span>
      </span>
    </div>
  );
};

export default MatchScoreBadge;
