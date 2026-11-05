import React, { useState } from 'react';
import { Outlet, useParams, useLocation, useNavigate } from 'react-router-dom';
import LabSidebar from './components/LabSidebar';
import LabTopbar from './components/LabTopbar';
import { useLab } from './context/LabContext';
import { Loader2, AlertCircle, Lock, CalendarClock, ArrowLeft, Send, CreditCard } from 'lucide-react';
import LabSwitcher from './components/LabSwitcher';

export default function LabLayout({ onOpenNewProject, onOpenInviteModal }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { loading, error, currentLab, userRole } = useLab();
  const location = useLocation();
  const navigate = useNavigate();
  const { labId } = useParams();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-[#0F172A]" />
          <p className="text-xs font-bold text-[#525252] uppercase tracking-wider">
            Loading Research Lab Workspace...
          </p>
        </div>
      </div>
    );
  }

  if (error && !currentLab) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-6 rounded-2xl border border-red-200 shadow-sm text-center">
          <AlertCircle size={36} className="text-red-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-[#171717] mb-1">
            Unable to Access Lab
          </h2>
          <p className="text-xs text-[#737373] mb-4">
            {error || 'This lab does not exist or you do not have permission to view it.'}
          </p>
          <a
            href="/research"
            className="inline-flex items-center justify-center px-4 py-2 bg-[#0F172A] text-white text-xs font-semibold rounded-lg hover:bg-[#1E293B] transition-colors"
          >
            Return to ScholarHub
          </a>
        </div>
      </div>
    );
  }

  // Check subscription validity & lock status
  const isLocked = currentLab && (currentLab.is_active === false || currentLab.subscription?.is_expired === true || currentLab.is_locked === true);
  const isBillingTab = location.pathname.endsWith('/billing');

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#171717]">
      <LabSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <LabTopbar 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenNewProject={isLocked ? null : onOpenNewProject}
          onOpenInviteModal={isLocked ? null : onOpenInviteModal}
        />

        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {isLocked && !isBillingTab ? (
            /* Locked Workspace Screen */
            <div className="max-w-2xl mx-auto my-12 bg-white rounded-3xl border border-rose-200 p-8 shadow-sm text-center space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
                <Lock size={32} />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
                  Lab Inactive / Subscription Expired
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-3">
                  {currentLab?.name || 'Lab'} Workspace is Locked
                </h2>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
                  The institutional subscription for this research lab has expired or has not been renewed. 
                  Collaborative pipelines, manuscript repositories, and dedicated AI compute nodes are frozen for all members.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-left text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Institution Node:</span>
                  <strong className="text-slate-800">{currentLab?.institution || 'Autonomous Academic Node'}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Plan:</span>
                  <strong className="text-slate-800">{currentLab?.subscription?.plan || 'Institutional Enterprise'}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Renewal Status:</span>
                  <span className="text-rose-600 font-bold">Past Due / Deactivated</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => navigate(`/lab/${labId}/billing`)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CreditCard size={14} />
                  <span>View Renewal Invoice</span>
                </button>
                <button
                  onClick={() => navigate('/research')}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>Return to ScholarHub AI</span>
                </button>
              </div>

              {/* Lab Switcher for switching to other active labs */}
              <div className="pt-4 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Belong to another research lab? Switch workspace:
                </span>
                <div className="max-w-xs mx-auto">
                  <LabSwitcher />
                </div>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
}
