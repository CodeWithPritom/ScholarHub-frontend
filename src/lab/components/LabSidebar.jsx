import React from 'react';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import { useLab } from '../context/LabContext';
import { labTheme } from '../utils/labTheme';
import LabSwitcher from './LabSwitcher';
import { 
  LayoutDashboard, 
  FolderGit2, 
  CheckSquare, 
  BookOpen, 
  FolderTree, 
  Sparkles, 
  MessageSquare, 
  Users, 
  Settings, 
  CreditCard, 
  Compass, 
  ArrowLeft, 
  ShieldCheck, 
  Coins, 
  ChevronDown, 
  Building2,
  Plus,
  Clock,
  CalendarClock
} from 'lucide-react';

export default function LabSidebar({ isOpen, onClose }) {
  const { labId } = useParams();
  const navigate = useNavigate();
  const { currentLab, userRole, quota, userLabs } = useLab();

  const navItems = [
    { to: `/lab/${labId}/overview`, label: 'Lab Overview', icon: LayoutDashboard },
    { to: `/lab/${labId}/projects`, label: 'Research Projects', icon: FolderGit2 },
    { to: `/lab/${labId}/tasks`, label: 'Kanban Tasks', icon: CheckSquare },
    { to: `/lab/${labId}/thesis`, label: 'Thesis & CRediT', icon: BookOpen },
    { to: `/lab/${labId}/files`, label: 'Files Repository', icon: FolderTree },
    { to: `/lab/${labId}/ai`, label: 'AI Copilot & Gateway', icon: Sparkles, accent: true },
    { to: `/lab/${labId}/chat`, label: 'Lab Discussions', icon: MessageSquare },
    { to: `/lab/${labId}/members`, label: 'Members & Roles', icon: Users },
    { to: `/lab/${labId}/settings`, label: 'Settings & Keys', icon: Settings },
    { to: `/lab/${labId}/billing`, label: 'Billing & Invoices', icon: CreditCard },
    { to: `/lab/${labId}/guide`, label: 'Lab User Guide', icon: Compass },
  ];

  const quotaPercent = quota.allocated > 0 
    ? Math.min(100, Math.round((quota.consumed / quota.allocated) * 100)) 
    : 0;

  const daysRemaining = currentLab?.subscription?.days_remaining;
  const isLocked = currentLab?.is_locked || (currentLab?.is_active === false);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#FFFFFF] border-r border-[#E5E5DF] flex flex-col justify-between
        transition-transform duration-200 ease-in-out lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Top: Lab Brand & Switcher */}
        <div>
          <div className="p-3.5 border-b border-[#E5E5DF]">
            <div className="flex items-center justify-between mb-2.5">
              <button
                onClick={() => navigate('/research')}
                className="text-xs font-semibold text-[#525252] hover:text-[#171717] flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Return to ScholarHub AI"
              >
                <ArrowLeft size={13} />
                <span>ScholarHub Core</span>
              </button>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                <ShieldCheck size={11} /> Lab v2.0
              </span>
            </div>

            {/* Interactive Multi-Lab Switcher Dropdown */}
            <LabSwitcher />

            {/* Member Role Pill */}
            <div className="mt-2.5 flex items-center justify-between bg-[#F4F4F0] px-2.5 py-1.5 rounded-lg border border-[#E5E5DF]">
              <span className="text-[11px] font-semibold text-[#525252]">Your Role:</span>
              <span className="text-[11px] font-bold text-[#0F172A] uppercase tracking-wide">
                {userRole.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-0.5 overflow-y-auto max-h-[calc(100vh-320px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) => `
                    flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all
                    ${isActive 
                      ? 'bg-[#0F172A] text-white shadow-xs' 
                      : 'text-[#525252] hover:bg-[#F4F4F0] hover:text-[#171717]'
                    }
                  `}
                >
                  <Icon size={16} className={item.accent ? 'text-amber-500' : ''} />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Widgets */}
        <div className="p-3 border-t border-[#E5E5DF] bg-[#FAFAF8] space-y-2.5">
          {/* Shared Lab Token Quota Widget */}
          <div className="bg-white p-2.5 rounded-xl border border-[#E5E5DF] shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-[#171717] flex items-center gap-1.5">
                <Coins size={13} className="text-amber-600" />
                Lab Tokens
              </span>
              <span className="text-[11px] font-semibold text-[#737373]">
                {quotaPercent}%
              </span>
            </div>
            <div className="w-full bg-[#E5E5DF] h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${quotaPercent > 85 ? 'bg-red-500' : 'bg-emerald-600'}`}
                style={{ width: `${quotaPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#737373] mt-1.5">
              <span>{quota.consumed?.toLocaleString() || 0} used</span>
              <span>{quota.available?.toLocaleString() || 0} avail</span>
            </div>
          </div>

          {/* Dynamic Subscription & Renewal Countdown Widget */}
          <div 
            onClick={() => navigate(`/lab/${labId}/billing`)}
            className="bg-white p-2.5 rounded-xl border border-[#E5E5DF] shadow-xs hover:border-slate-300 transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <CalendarClock size={12} className="text-indigo-600" />
                Subscription Plan
              </span>
              <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full border ${
                isLocked 
                  ? 'bg-rose-50 text-rose-700 border-rose-200' 
                  : (daysRemaining <= 15 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200')
              }`}>
                {isLocked ? 'Locked' : (daysRemaining <= 15 ? 'Expiring' : 'Active')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 truncate">
                {currentLab?.subscription?.plan || 'Enterprise Lab'}
              </span>
              <span className={`text-[10px] font-bold ${
                isLocked 
                  ? 'text-rose-600' 
                  : (daysRemaining <= 15 ? 'text-amber-600 font-extrabold' : 'text-emerald-600')
              }`}>
                {daysRemaining !== undefined ? (daysRemaining > 0 ? `${daysRemaining}d left` : 'Expired') : '365d left'}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
