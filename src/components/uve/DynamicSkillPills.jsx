import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, FlaskConical, Calculator, Globe, Box, Share2, 
  BarChart3, Workflow, Dna, Sparkles, ArrowRight 
} from 'lucide-react';
import { detectContextualSkills } from '../../utils/scientificSkills';

const ICON_MAP = {
  Zap,
  FlaskConical,
  Calculator,
  Globe,
  Box,
  Share2,
  BarChart3,
  Workflow,
  Dna
};

export const DynamicSkillPills = React.memo(({ conversationText, onSelectSkill, disabled }) => {
  const suggestedSkills = useMemo(() => {
    return detectContextualSkills(conversationText);
  }, [conversationText]);

  if (!suggestedSkills || suggestedSkills.length === 0) return null;

  return (
    <div className="w-full flex items-center justify-between gap-2 px-3 py-1.5 bg-slate-50/80 border-b border-slate-200/60 text-xs overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-1.5 shrink-0 text-slate-500 font-extrabold text-[10px] uppercase tracking-wider">
        <Sparkles size={12} className="text-indigo-600 animate-pulse" />
        <span>Contextual Scientific Skills:</span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {suggestedSkills.map((skill) => {
          const IconComp = ICON_MAP[skill.iconName] || Sparkles;

          return (
            <button
              key={skill.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectSkill(skill.promptTemplate)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-2xs ${skill.badgeColor} hover:scale-102 hover:shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
              title={skill.description}
            >
              <IconComp size={13} style={{ color: skill.accentColor }} />
              <span>{skill.name}</span>
              <ArrowRight size={11} className="opacity-60" />
            </button>
          );
        })}
      </div>
    </div>
  );
});

export default DynamicSkillPills;
