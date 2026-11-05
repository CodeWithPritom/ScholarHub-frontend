import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLab } from '../context/LabContext';
import { 
  Building2, 
  ChevronDown, 
  Check, 
  Plus, 
  ArrowLeft, 
  ShieldCheck, 
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';

export default function LabSwitcher({ compact = false }) {
  const { currentLab, userLabs, userRole, refreshUserLabs } = useLab();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { labId } = useParams();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLab = (targetLabId) => {
    setIsOpen(false);
    if (targetLabId !== labId) {
      navigate(`/lab/${targetLabId}/overview`);
    }
  };

  const getRoleBadgeColor = (role) => {
    const r = (role || '').toLowerCase();
    if (r.includes('pi') || r.includes('principal')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (r.includes('professor') || r.includes('lead')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (r.includes('postdoc')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (r.includes('phd') || r.includes('student')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const formatRole = (role) => {
    if (!role) return 'Member';
    if (role === 'principal_investigator' || role === 'pi') return 'Principal Investigator';
    if (role === 'co_pi' || role === 'copi') return 'Co-PI';
    if (role === 'research_assistant' || role === 'ra') return 'Research Assistant';
    return role.replace(/_/g, ' ');
  };

  const hasMultiple = (userLabs || []).length > 1;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Switcher Button Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left rounded-xl transition-all duration-150 border ${
          isOpen 
            ? 'bg-slate-50 border-slate-300 shadow-xs' 
            : 'bg-white hover:bg-[#FAFAF8] border-[#E5E5DF]'
        } p-2.5 flex items-center justify-between gap-2.5 group cursor-pointer`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#0F172A] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs group-hover:scale-105 transition-transform">
            {currentLab?.name ? currentLab.name.charAt(0).toUpperCase() : 'L'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs font-bold text-[#171717] truncate leading-tight">
                {currentLab?.name || 'Academic Lab'}
              </h2>
              {currentLab?.is_locked && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" title="Lab Locked / Expired" />
              )}
            </div>
            <p className="text-[10px] text-[#737373] truncate mt-0.5">
              {currentLab?.institution || 'Autonomous Research Node'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 text-slate-400 group-hover:text-slate-700">
          {hasMultiple && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
              {userLabs.length} Labs
            </span>
          )}
          <ChevronDown 
            size={14} 
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-slate-900' : ''}`} 
          />
        </div>
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="px-3.5 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Your Research Workspaces
            </span>
            <span className="text-[10px] font-bold text-indigo-600">
              {userLabs?.length || 1} Total
            </span>
          </div>

          {/* List of Labs */}
          <div className="p-1.5 max-h-64 overflow-y-auto space-y-1">
            {(userLabs || []).length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400">
                No other labs found.
              </div>
            ) : (
              (userLabs || []).map((lab) => {
                const isActive = lab.id === labId || lab.id === currentLab?.id;
                const roleText = formatRole(lab.user_role);
                const isLocked = lab.is_locked || (lab.is_active === false);
                const daysRemaining = lab.subscription?.days_remaining;

                return (
                  <button
                    key={lab.id}
                    onClick={() => handleSelectLab(lab.id)}
                    className={`w-full text-left p-2.5 rounded-xl transition-colors flex items-center justify-between gap-2.5 cursor-pointer ${
                      isActive 
                        ? 'bg-slate-900 text-white' 
                        : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-900'}`}>
                          {lab.name}
                        </span>
                        {isActive && (
                          <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-white text-[9px] font-extrabold uppercase tracking-wide">
                            Active
                          </span>
                        )}
                        {isLocked && !isActive && (
                          <span className="px-1.5 py-0.2 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[9px] font-extrabold uppercase tracking-wide">
                            Locked
                          </span>
                        )}
                      </div>
                      <div className={`text-[10px] truncate mt-0.5 flex items-center gap-1.5 ${
                        isActive ? 'text-slate-300' : 'text-slate-500'
                      }`}>
                        <span>{lab.institution || 'Institutional Lab'}</span>
                        <span>•</span>
                        <span className="capitalize">{roleText}</span>
                      </div>
                      {daysRemaining !== undefined && (
                        <div className={`text-[9px] mt-1 flex items-center gap-1 font-semibold ${
                          isActive ? 'text-emerald-300' : (daysRemaining > 15 ? 'text-emerald-600' : 'text-amber-600')
                        }`}>
                          <Clock size={10} />
                          <span>{daysRemaining > 0 ? `${daysRemaining} days left` : 'Subscription Expired'}</span>
                        </div>
                      )}
                    </div>

                    {isActive && (
                      <Check size={16} className="text-emerald-400 shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Quick Actions Footer */}
          <div className="p-2 border-t border-slate-100 bg-slate-50/50 space-y-1">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/research');
              }}
              className="w-full py-1.5 px-2.5 rounded-lg text-left text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <ArrowLeft size={13} className="text-slate-400" />
              <span>Return to ScholarHub AI</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
