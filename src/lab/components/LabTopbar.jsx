import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useLab } from '../context/LabContext';
import { Menu, Plus, User, Sparkles, FolderPlus, UserPlus } from 'lucide-react';

export default function LabTopbar({ onToggleSidebar, onOpenNewProject, onOpenInviteModal }) {
  const { currentLab, userRole, quota } = useLab();
  const location = useLocation();
  const navigate = useNavigate();
  const { labId } = useParams();

  // Extract page title from pathname
  const pathParts = location.pathname.split('/');
  const currentTab = pathParts[3] || 'overview';
  const tabTitles = {
    overview: 'Lab Overview & Workspace',
    projects: 'Research Projects',
    tasks: 'Kanban Tasks & Workflows',
    thesis: 'Theses, Manuscripts & CRediT',
    files: 'Versioned Files Repository',
    ai: 'AI Research Copilot & Gateway',
    chat: 'Lab Discussions',
    members: 'Members & Capabilities',
    settings: 'Lab Settings & AI Keys',
    billing: 'Billing & Token Allocations',
    guide: 'Interactive User Guide'
  };

  const pageTitle = tabTitles[currentTab] || 'Workspace';

  return (
    <header className="h-14 bg-white border-b border-[#E5E5DF] px-4 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-[#525252] hover:bg-[#F4F4F0] lg:hidden"
        >
          <Menu size={20} />
        </button>

        <div>
          <h1 className="text-sm font-bold text-[#171717] capitalize">
            {pageTitle}
          </h1>
          <p className="text-[10px] text-[#737373] hidden sm:block">
            {currentLab?.name || 'Lab'} • {currentLab?.institution || 'Autonomous Academic Node'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {onOpenNewProject && (
          <button
            onClick={onOpenNewProject}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <FolderPlus size={13} />
            <span>New Project</span>
          </button>
        )}

        {onOpenInviteModal && (
          <button
            onClick={onOpenInviteModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F4F4F0] text-[#171717] border border-[#E5E5DF] rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <UserPlus size={13} />
            <span className="hidden sm:inline">Invite Colleague</span>
          </button>
        )}

        <div className="h-4 w-[1px] bg-[#E5E5DF] mx-1 hidden sm:block" />

        {/* User Pill */}
        <div className="flex items-center gap-2 pl-1">
          <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-xs font-bold text-slate-700">
            <User size={13} />
          </div>
          <div className="hidden md:block text-left">
            <span className="block text-xs font-bold text-[#171717] leading-tight">
              {userRole.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
