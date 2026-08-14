import React from 'react';
import { Clock } from 'lucide-react';

const DeadlineCountdown = ({ deadline }) => {
  if (!deadline) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
        <Clock size={11} />
        <span>Open Rolling</span>
      </span>
    );
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = new Date(deadline);
    target.setHours(0, 0, 0, 0);

    const diffMs = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          <Clock size={11} />
          <span>Deadline Passed</span>
        </span>
      );
    }

    if (diffDays === 0) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-rose-700 animate-pulse">
          <Clock size={11} />
          <span>Deadline Today!</span>
        </span>
      );
    }

    if (diffDays <= 7) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-700">
          <Clock size={11} />
          <span>{diffDays} {diffDays === 1 ? 'day' : 'days'} left!</span>
        </span>
      );
    }

    if (diffDays <= 14) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
          <Clock size={11} />
          <span>{diffDays} days left</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
        <Clock size={11} />
        <span>{diffDays} days left</span>
      </span>
    );
  } catch {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
        <Clock size={11} />
        <span>{deadline}</span>
      </span>
    );
  }
};

export default DeadlineCountdown;
