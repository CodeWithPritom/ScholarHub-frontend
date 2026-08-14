import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';

const ConversionWall = ({
  type = 'signup',
  headline = 'Unlock Complete Content',
  description = 'Sign up or upgrade your plan to access full research frameworks and materials.',
  ctaText = 'Upgrade Plan',
  ctaLink = '/pricing'
}) => {
  return (
    <div className="rounded-[12px] border border-slate-200 bg-white p-6 shadow-2xs text-center flex flex-col items-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[12px] bg-slate-100 text-slate-700">
        {type === 'upgrade' ? (
          <Sparkles size={18} />
        ) : (
          <Lock size={18} />
        )}
      </div>

      <h4 className="text-base font-bold tracking-tight text-slate-900">
        {headline}
      </h4>

      <p className="mt-1.5 max-w-md text-xs font-normal text-slate-600 leading-relaxed">
        {description}
      </p>

      <Link
        to={ctaLink}
        className="mt-4 inline-flex items-center gap-1.5 rounded-[12px] bg-slate-900 hover:bg-slate-800 px-5 py-2.5 text-xs font-semibold text-white shadow-2xs transition-all cursor-pointer"
      >
        <span>{ctaText}</span>
        <ArrowRight size={14} />
      </Link>
    </div>
  );
};

export default ConversionWall;
