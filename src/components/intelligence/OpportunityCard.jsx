import React, { useState } from 'react';
import { MapPin, Building, Banknote, ExternalLink, ShieldCheck, Sparkles, Lock, Clock, Calendar, ArrowUpRight, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import DeadlineCountdown from './DeadlineCountdown';

const TYPE_STYLES = {
  scholarship: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  fellowship: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  ra: 'bg-blue-50 text-blue-800 border-blue-200',
  phd: 'bg-purple-50 text-purple-800 border-purple-200',
  postdoc: 'bg-amber-50 text-amber-800 border-amber-200',
  faculty: 'bg-rose-50 text-rose-800 border-rose-200',
  DEFAULT: 'bg-slate-100 text-slate-800 border-slate-200'
};

const TYPE_LABELS = {
  scholarship: 'Scholarship',
  fellowship: 'Fellowship',
  ra: 'Research Assistant',
  phd: 'PhD Position',
  postdoc: 'Postdoc Position',
  faculty: 'Faculty Job'
};

const OpportunityCard = ({ opportunity, user, profile }) => {
  const [showGateModal, setShowGateModal] = useState(false);
  if (!opportunity) return null;

  const {
    title,
    organization,
    description,
    apply_url,
    location,
    opportunity_type,
    funding,
    deadline,
    eligibility,
    tags = []
  } = opportunity;

  const userTier = profile?.user_tier || user?.user_tier || 'free';
  const hasFullAccess = userTier === 'starter' || userTier === 'pro';

  const normType = (opportunity_type || 'scholarship').toLowerCase();
  const typeLabel = TYPE_LABELS[normType] || 'Grant Opportunity';
  const styleClass = TYPE_STYLES[normType] || TYPE_STYLES.DEFAULT;

  const targetUrl = apply_url || `https://www.google.com/search?q=${encodeURIComponent(title + ' ' + (organization || ''))}`;

  const handleApplyClick = (e) => {
    if (!hasFullAccess) {
      e.preventDefault();
      toast.error('Direct Portal Redirection is a Starter/Pro feature. Upgrade your plan to access application links.', {
        action: {
          label: 'Upgrade Plan',
          onClick: () => window.location.href = '/pricing'
        }
      });
      setShowGateModal(true);
    } else {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <article className="group flex flex-col h-full overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 transition-all duration-300 hover:border-indigo-300 hover:shadow-xl hover:-translate-y-1 relative">
      
      {/* Header Badges & Deadline */}
      <div className="mb-4 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${styleClass}`}>
            {typeLabel}
          </span>
          {tags.map((t) => (
            <span key={t} className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-700">
              {t}
            </span>
          ))}
        </div>
        <DeadlineCountdown deadline={deadline} />
      </div>

      {/* Title */}
      <h3 className="mb-2 text-base sm:text-lg font-black text-slate-900 leading-snug tracking-tight group-hover:text-indigo-600 transition-colors">
        {title}
      </h3>

      {/* Organization */}
      {organization && (
        <div className="mb-3 flex items-center gap-1.5 text-xs font-bold text-slate-600">
          <Building size={14} className="text-slate-400 shrink-0" />
          <span className="truncate">{organization}</span>
        </div>
      )}

      {/* Key Details Pills */}
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
        {location && (
          <div className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700 font-medium">
            <MapPin size={12} className="text-rose-500 shrink-0" />
            <span>{location}</span>
          </div>
        )}
        {funding && (
          <div className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg text-emerald-800 font-bold">
            <Banknote size={12} className="text-emerald-600 shrink-0" />
            <span>{funding}</span>
          </div>
        )}
      </div>

      {/* Description */}
      {description && (
        <p className="mb-4 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium line-clamp-3">
          {description}
        </p>
      )}

      {/* Eligibility Box */}
      {eligibility && (
        <div className="mb-4 rounded-xl bg-slate-50 border border-slate-200/80 p-3 text-xs text-slate-700 leading-relaxed font-medium">
          <span className="font-bold text-slate-900 block mb-0.5 text-[10px] uppercase tracking-wider text-indigo-600">Eligibility Criteria</span>
          {eligibility}
        </div>
      )}

      {/* Apply Direct Button */}
      <div className="mt-auto pt-2">
        <button
          onClick={handleApplyClick}
          className={`w-full py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 ${
            hasFullAccess
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-indigo-100'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
          }`}
        >
          {hasFullAccess ? (
            <>
              <span>Apply Directly</span>
              <ArrowUpRight size={14} />
            </>
          ) : (
            <>
              <Lock size={13} className="text-slate-500" />
              <span>View Position (Starter/Pro Feature)</span>
            </>
          )}
        </button>
      </div>

      {/* Gate Modal overlay if clicked by Free user */}
      {showGateModal && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-xs z-20 p-6 flex flex-col items-center justify-center text-center animate-fadeIn rounded-2xl border border-slate-200">
          <Lock size={32} className="text-amber-500 mb-3" />
          <h4 className="text-base font-black text-slate-900 mb-1">Direct Application Link Locked</h4>
          <p className="text-xs text-slate-600 mb-4 max-w-xs leading-relaxed font-medium">
            Direct institutional application links and contact portals are reserved for Starter and Pro members.
          </p>
          <div className="flex gap-2">
            <a
              href="/pricing"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md"
            >
              Upgrade Now 🚀
            </a>
            <button
              onClick={() => setShowGateModal(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </article>
  );
};

export default OpportunityCard;
