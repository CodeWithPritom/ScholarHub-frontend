import React, { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, Circle } from 'lucide-react';

const ModuleSidebar = ({ 
  modules = [], 
  currentModuleId, 
  currentLessonId, 
  lessonsMap = {}, 
  onSelectLesson, 
  onToggleProgress,
  onExpandModule,
  user
}) => {
  const [expandedModules, setExpandedModules] = useState({
    [currentModuleId || 'research-fundamentals']: true
  });

  const toggleExpand = (modId) => {
    const isExpanding = !expandedModules[modId];
    setExpandedModules(prev => ({
      ...prev,
      [modId]: isExpanding
    }));

    if (isExpanding && (!lessonsMap[modId] || lessonsMap[modId].length === 0)) {
      if (onExpandModule) {
        onExpandModule(modId);
      }
    }
  };

  return (
    <aside className="w-full lg:w-80 shrink-0 space-y-4">
      <div className="px-1">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Curriculum & Modules
        </h3>
      </div>

      <div className="space-y-3">
        {modules.map((mod) => {
          const isExpanded = expandedModules[mod.id] || mod.id === currentModuleId;
          const modLessons = lessonsMap[mod.id];

          return (
            <div
              key={mod.id}
              className={`overflow-hidden rounded-2xl border bg-white shadow-2xs transition-all ${
                mod.id === currentModuleId ? 'border-slate-300' : 'border-slate-200/80'
              }`}
            >
              {/* Module Header Card */}
              <button
                onClick={() => toggleExpand(mod.id)}
                className="flex w-full items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-900 tracking-tight leading-snug">
                    {mod.title}
                  </h4>
                  <p className="text-xs text-slate-500 font-normal mt-0.5">
                    {mod.completed_lessons || 0} of {mod.total_lessons || 0} completed
                  </p>
                </div>

                <div className="text-slate-400">
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
              </button>

              {/* Collapsible Lessons List */}
              {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-2 space-y-1">
                  {modLessons === undefined ? (
                    <p className="p-3 text-xs text-slate-400 text-center font-normal animate-pulse">
                      Loading lessons...
                    </p>
                  ) : modLessons.length === 0 ? (
                    <p className="p-3 text-xs text-slate-400 text-center font-normal">
                      No lessons available.
                    </p>
                  ) : (
                    modLessons.map((les) => {
                      const isSelected = les.id === currentLessonId;

                      return (
                        <div
                          key={les.id}
                          onClick={() => onSelectLesson && onSelectLesson(mod.id, les.id)}
                          className={`group flex items-center justify-between rounded-xl px-3 py-2 text-xs transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                              : 'text-slate-700 hover:bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onToggleProgress && user) {
                                  onToggleProgress(les.id, !les.completed);
                                }
                              }}
                              className="shrink-0 transition-transform active:scale-90 cursor-pointer"
                              title={user ? 'Click to mark complete' : 'Login to save progress'}
                            >
                              {les.completed ? (
                                <CheckCircle2 size={15} className={isSelected ? 'text-white' : 'text-slate-700'} />
                              ) : (
                                <Circle size={15} className={isSelected ? 'text-white/60' : 'text-slate-300 group-hover:text-slate-400'} />
                              )}
                            </button>

                            <span className="truncate">{les.title}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default ModuleSidebar;
