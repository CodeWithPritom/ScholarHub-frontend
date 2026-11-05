import React from 'react';
import { Compass, ShieldCheck, CheckCircle2, Key, Users, BookOpen, Layers } from 'lucide-react';
import { RESEARCH_STAGES, CREDIT_TAXONOMY } from '../utils/labConstants';

export default function LabGuide() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-[#171717]">Custom Research Lab Portal — User Manual</h2>
        <p className="text-xs text-[#737373] mt-0.5">
          Architecture overview, 12-stage research protocol, CRediT taxonomy, and cryptographic vault.
        </p>
      </div>

      {/* Overview Card */}
      <div className="bg-white border border-[#E5E5DF] rounded-2xl p-6 shadow-xs space-y-4 text-xs leading-relaxed">
        <h3 className="text-sm font-bold text-[#171717] flex items-center gap-2">
          <ShieldCheck size={16} className="text-blue-600" />
          Autonomous Physical & Logical Isolation
        </h3>
        <p className="text-[#525252]">
          The ScholarHub Custom Research Lab Portal is engineered to grant academic research laboratories, universities, and consortia a self-contained operational space. It introduces 18 dedicated, physically isolated tables, Fernet-authenticated key encryption, and an atomic quota engine with row-level locks.
        </p>

        {/* 12-Stage Lifecycle */}
        <div className="pt-3 border-t border-[#F4F4F0]">
          <h4 className="text-xs font-bold text-[#171717] mb-2 flex items-center gap-1.5">
            <Layers size={14} className="text-purple-600" />
            The 12-Stage Academic Research Lifecycle
          </h4>
          <p className="text-[#737373] mb-3">
            Every project advances sequentially through 12 rigorous scientific phases:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {RESEARCH_STAGES.map((s) => (
              <div key={s.id} className="p-2.5 rounded-xl border border-[#E5E5DF] bg-[#FAFAF8] text-xs">
                <span className="font-bold text-[#171717] block">
                  #{s.step}. {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CRediT Taxonomy */}
        <div className="pt-3 border-t border-[#F4F4F0]">
          <h4 className="text-xs font-bold text-[#171717] mb-2 flex items-center gap-1.5">
            <BookOpen size={14} className="text-emerald-600" />
            CRediT Authorship Standard
          </h4>
          <p className="text-[#737373] mb-3">
            To prevent authorship disputes and comply with high-impact journals (Nature, Cell, Science, PLOS), the portal supports all 14 standard Contributor Roles Taxonomy (CRediT) facets.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            {CREDIT_TAXONOMY.map((c) => (
              <div key={c.id} className="p-2 rounded-lg bg-[#FAFAF8] border border-[#E5E5DF]">
                <span className="font-bold text-[#171717] block">{c.label}</span>
                <span className="text-[#737373]">{c.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
