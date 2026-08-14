import React, { useState } from 'react';
import { MapPin, Building, Banknote, ExternalLink, ShieldCheck, Sparkles, Lock } from 'lucide-react';
import { toast } from 'sonner';
import DeadlineCountdown from './DeadlineCountdown';

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
    <article className="flex flex-col overflow-hidden rounded-[12px] border border-[#E5E5DF] bg-white p-6 transition-all hover:border-slate-300 shadow-2xs relative">
      {/* Header Badge & Deadline */}
      <div className="mb-3 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="rounded-[6px] bg-[#F3F3EF] border border-[#E5E5DF] px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
            {typeLabel}
          </span>
          {tags.map((t) => (
            <span key={t} className="rounded-[6px] bg-white border border-[#E5E5DF] px-2 py-0.5 text-[10px] font-bold text-slate-600">
              {t}
            </span>
          ))}
        </div>
        <DeadlineCountdown deadline={deadline} />
      </div>

      {/* Title */}
      <h3 className="mb-2 text-base font-bold font-sds-content text-[#171717] leading-snug tracking-tight hover:text-[#315CFF] transition-colors">
        {title}
      </h3>

      {/* Organization */}
      {organization && (
        <div className="mb-3 flex items-center gap-1.5 text-xs font-normal text-slate-500">
          <Building size={13} className="text-slate-400 shrink-0" />
          <span className="truncate">{organization}</span>
        </div>
      )}

      {/* Key Details */}
      <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-slate-600 font-normal">
        {location && (
          <div className="flex items-center gap-1">
            <MapPin size={12} className="text-slate-400 shrink-0" />
            <span>{location}</span>
          </div>
        )}
        {funding && (
          <div className="flex items-center gap-1">
            <Banknote size={12} className="text-slate-400 shrink-0" />
            <span>{funding}</span>
          </div>
        )}
      </div>

      {/* Description */}
      {description && (
        <p className="mb-4 text-xs text-slate-600 leading-relaxed font-normal line-clamp-3">
          {description}
        </p>
      )}

      {/* Eligibility Note */}
      {eligibility && (
        <div className="mb-4 rounded-[8px] bg-[#F3F3EF]/60 border border-[#E5E5DF] p-3 text-xs text-slate-600 leading-relaxed font-normal">
          <strong className="text-slate-800 font-semibold">Eligibility:</strong> {eligibility}
        </div>
      )}

      {/* Apply Direct Button */}
      <div className="mt-auto pt-2">
        <button
          onClick={handleApplyClick}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-[8px] px-4 py-2.5 text-xs font-semibold shadow-2xs transition-all cursor-pointer ${
            hasFullAccess
              ? 'bg-[#315CFF] hover:bg-[#2547d0] text-white'
              : 'bg-[#F3F3EF] hover:bg-[#E5E5DF] text-slate-700 border border-[#E5E5DF]'
          }`}
        >
          {hasFullAccess ? (
            <>
              <span>Apply Directly ↗</span>
              <ExternalLink size={13} />
            </>
          ) : (
            <>
              <Lock size={12} className="text-slate-500" />
              <span>View Position (Starter/Pro Feature)</span>
            </>
          )}
        </button>
      </div>

      {/* Gate Modal overlay if clicked by Free user */}
      {showGateModal && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-xs z-20 p-6 flex flex-col items-center justify-center text-center animate-fadeIn rounded-[12px]">
          <Lock size={28} className="text-slate-400 mb-3" />
          <h4 className="text-sm font-bold text-[#171717] mb-1">Direct Portal Link Locked</h4>
          <p className="text-xs text-slate-500 mb-4 max-w-xs leading-relaxed font-normal">
            Direct institutional application links and contact portals are reserved for Starter and Pro members.
          </p>
          <div className="flex gap-2">
            <a
              href="/pricing"
              className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-all"
            >
              Upgrade Plan
            </a>
            <button
              onClick={() => setShowGateModal(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
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
