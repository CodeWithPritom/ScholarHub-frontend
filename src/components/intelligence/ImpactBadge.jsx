import React from 'react';

const ImpactBadge = ({ level = 'medium' }) => {
  const normLevel = (level || 'medium').toLowerCase();

  const config = {
    high: {
      label: 'High Impact',
      badgeClass: 'bg-slate-900 text-white font-bold'
    },
    medium: {
      label: 'Medium Impact',
      badgeClass: 'bg-slate-100 text-slate-700 border border-slate-200/80 font-medium'
    },
    low: {
      label: 'Standard',
      badgeClass: 'bg-slate-100 text-slate-500 border border-slate-200/60 font-medium'
    }
  };

  const current = config[normLevel] || config.medium;

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] tracking-tight ${current.badgeClass}`}>
      {current.label}
    </span>
  );
};

export default ImpactBadge;
