import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { LabProvider, useLab } from './context/LabContext';
import LabLayout from './LabLayout';
import LabOverview from './pages/LabOverview';
import LabProjects from './pages/LabProjects';
import LabProjectDetail from './pages/LabProjectDetail';
import LabTasks from './pages/LabTasks';
import LabThesis from './pages/LabThesis';
import LabFiles from './pages/LabFiles';
import LabAI from './pages/LabAI';
import LabChat from './pages/LabChat';
import LabMembers from './pages/LabMembers';
import LabSettings from './pages/LabSettings';
import LabBilling from './pages/LabBilling';
import LabGuide from './pages/LabGuide';
import { labApi } from './utils/labApi';
import { Building2, UserPlus, ShieldCheck, Copy, Check, ArrowRight, Loader2, Lock, Mail, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Root Lab Portal Hub & Router Dispatcher
 */
export default function LabPortal({ user, profile, onLogout }) {
  return (
    <Routes>
      {/* Index route: /lab or /lab/ */}
      <Route path="/" element={<LabIndexDispatcher user={user} profile={profile} />} />
      <Route path="/join" element={<LabInvitationAccept user={user} />} />
      <Route path="/:labId/join" element={<LabInvitationAccept user={user} />} />

      {/* Scoped Lab Workspace: /lab/:labId/* */}
      <Route 
        path="/:labId/*" 
        element={
          <LabProvider user={user}>
            <LabWorkspaceRouter user={user} />
          </LabProvider>
        } 
      />
    </Routes>
  );
}

/**
 * Dispatches to user's first authorized lab, or renders the Institutional Admin Permission Gating screen.
 */
function LabIndexDispatcher({ user, profile }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const adminEmail = 'arupbhowmikpritom@gmail.com';
  const isAdmin = user?.email?.toLowerCase() === adminEmail.toLowerCase() || profile?.role === 'admin';

  useEffect(() => {
    async function checkLabs() {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        const res = await labApi.getUserLabs(user.id);
        if (res.success && res.labs?.length > 0) {
          // Navigate to first authorized lab
          navigate(`/lab/${res.labs[0].id}/overview`, { replace: true });
        } else {
          setLoading(false);
        }
      } catch (e) {
        setLoading(false);
      }
    }
    checkLabs();
  }, [user?.id, navigate]);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(adminEmail);
    setCopied(true);
    toast.success('Admin email copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#0F172A]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white border border-[#E5E5DF] rounded-3xl p-8 sm:p-10 shadow-sm text-center">
        
        {/* Top Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-800 border border-amber-200 mb-6">
          <Lock size={11} className="text-amber-600" />
          <span>Institutional Access Control</span>
        </div>

        {/* Icon */}
        <div className="w-16 h-16 rounded-3xl bg-[#0F172A] text-white flex items-center justify-center mx-auto mb-5 shadow-sm">
          <Building2 size={30} className="text-white" />
        </div>

        <h2 className="text-2xl font-black text-[#171717] tracking-tight">
          Custom Research Lab Portal
        </h2>
        
        <p className="text-xs text-[#737373] mt-2.5 max-w-md mx-auto leading-relaxed">
          ScholarHub Custom Research Labs are private, dedicated organizational environments engineered exclusively for universities, research consortia, and verified academic groups.
        </p>

        {/* Admin Permission Required Notice Box */}
        <div className="my-6 p-5 bg-slate-50 border border-slate-200/80 rounded-2xl text-left space-y-3">
          <div className="flex items-center gap-2">
            <ShieldAlert size={16} className="text-amber-600 shrink-0" />
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Administrator Permission Required
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Individual user self-initialization is disabled. Dedicated research laboratories are provisioned custom by the <strong>ScholarHub AI Administration</strong> with multi-seat capacity, CRediT authorship controls, and token quota allocations.
          </p>
          <div className="pt-2 border-t border-slate-200/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Contact Platform Administrator to Request Lab Provisioning:
            </span>
            <div className="flex items-center justify-between bg-white border border-slate-200 px-3 py-2 rounded-xl">
              <span className="text-xs font-mono font-bold text-slate-800 select-all">
                {adminEmail}
              </span>
              <button
                onClick={handleCopyEmail}
                className="text-slate-500 hover:text-slate-900 transition-colors p-1"
                title="Copy Admin Email"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <a
            href={`mailto:${adminEmail}?subject=Request%20for%20Custom%20Research%20Lab%20Access&body=Hello%20ScholarHub%20Admin,%0A%0AI%20would%20like%20to%20request%20provisioning%20of%20a%20Custom%20Research%20Lab%20workspace%20on%20ScholarHub%20AI.%0A%0AUser%20Email:%20${user?.email || ''}%0AInstitution:%20%0ADepartment:%20%0ALab%20/%20Group%20Name:%20%0AResearch%20Focus:%20%0AEstimated%20Seats:%20%0A%0AThank%20you!`}
            className="w-full py-3 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl text-xs font-bold inline-flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <Mail size={15} />
            <span>Email Admin ({adminEmail})</span>
          </a>

          <button
            onClick={handleCopyEmail}
            className="w-full py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Admin Email Address'}</span>
          </button>

          {isAdmin && (
            <div className="pt-2">
              <a
                href="/admin"
                className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-2 transition-colors"
              >
                <ShieldCheck size={14} className="text-indigo-600" />
                <span>Admin: Provision Labs in Admin Panel &rarr;</span>
              </a>
            </div>
          )}

          <a
            href="/research"
            className="block pt-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Return to ScholarHub AI
          </a>
        </div>

      </div>
    </div>
  );
}

/**
 * Invitation Token Accept Screen — Mobile Responsive & Intuitive
 */
function LabInvitationAccept({ user }) {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    if (!token) {
      toast.error('No invitation token found in link.');
      return;
    }
    if (!user?.id) {
      navigate('/auth');
      return;
    }
    try {
      setLoading(true);
      const res = await labApi.acceptInvitation({ token, user_id: user.id });
      toast.success('Joined Lab successfully!');
      navigate(`/lab/${res.lab_id}/overview`);
    } catch (e) {
      toast.error(e.message || 'Invitation acceptance failed');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4">
        <div className="max-w-sm w-full bg-white border border-[#E5E5DF] rounded-2xl p-6 shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
            <Building2 size={22} />
          </div>
          <h3 className="text-base font-bold text-[#171717]">Missing Invitation Token</h3>
          <p className="text-xs text-[#737373] mt-2 mb-5">
            This invitation link appears incomplete. Please request a new invitation link from your lab administrator.
          </p>
          <a
            href="/lab"
            className="block w-full py-2.5 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl text-xs font-bold shadow-xs text-center transition-colors"
          >
            Go to Lab Portal
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-[#E5E5DF] rounded-2xl p-6 sm:p-8 shadow-sm text-center">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
          <ShieldCheck size={28} />
        </div>
        
        <span className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-[10px] font-black uppercase tracking-wider">
          Academic Collaboration
        </span>

        <h3 className="text-lg font-bold text-[#171717] mt-3">Research Lab Invitation</h3>
        <p className="text-xs text-[#737373] mt-2 leading-relaxed">
          You have been invited to collaborate in a dedicated Institutional Research Lab on ScholarHub AI.
        </p>

        {user ? (
          <div className="my-6 p-3.5 bg-[#F8FAF9] rounded-xl border border-[#E5E5DF] text-left">
            <div className="text-[11px] font-semibold text-[#525252]">Accepting As:</div>
            <div className="text-xs font-bold text-[#0F172A] truncate mt-0.5">{user.email}</div>
          </div>
        ) : (
          <div className="my-6 p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-left">
            <div className="text-[11px] font-bold text-amber-800">Authentication Required</div>
            <div className="text-xs text-amber-700 mt-0.5">
              Please sign in or create an account with your institutional email to accept this invitation.
            </div>
          </div>
        )}

        {user ? (
          <button
            onClick={handleAccept}
            disabled={loading}
            className="w-full py-3 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
            <span>{loading ? 'Joining Lab Workspace...' : 'Accept Invitation & Enter Lab'}</span>
          </button>
        ) : (
          <a
            href="/auth"
            className="block w-full py-3 bg-[#315CFF] hover:bg-[#2547d0] text-white rounded-xl text-xs font-bold shadow-xs text-center transition-colors"
          >
            Sign In / Register to Accept Invitation &rarr;
          </a>
        )}

        <a
          href="/research"
          className="block mt-4 text-xs font-semibold text-[#525252] hover:text-[#171717] transition-colors"
        >
          Return to ScholarHub AI
        </a>
      </div>
    </div>
  );
}

/**
 * Inner Workspace Router with Layout Shell and Modals
 */
function LabWorkspaceRouter({ user }) {
  const { labId } = useParams();
  const { refreshMembers } = useLab();
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // New Project Form
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    stage: 'idea',
    target_journal: '',
    visibility: 'lab_members'
  });
  const [creatingProject, setCreatingProject] = useState(false);

  // New Invite Form
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'ra' });
  const [generatedInviteUrl, setGeneratedInviteUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [inviteRefreshTrigger, setInviteRefreshTrigger] = useState(0);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectForm.title.trim()) return;
    try {
      setCreatingProject(true);
      await labApi.createProject(labId, projectForm);
      toast.success('Research project launched!');
      setShowProjectModal(false);
      setProjectForm({ title: '', description: '', stage: 'idea', target_journal: '', visibility: 'lab_members' });
      window.location.reload();
    } catch (e) {
      toast.error('Failed to create project');
    } finally {
      setCreatingProject(false);
    }
  };

  const handleCreateInvite = async (e) => {
    e.preventDefault();
    if (!inviteForm.email.trim()) return;
    try {
      const res = await labApi.inviteMember(labId, { ...inviteForm, expires_days: 3 });
      setGeneratedInviteUrl(res.invite_url);
      setInviteRefreshTrigger(prev => prev + 1);
      toast.success(`Invitation dispatched to ${inviteForm.email}! Valid for 3 days.`);
    } catch (e) {
      toast.error('Failed to generate invite');
    }
  };

  const handleCopyLink = () => {
    if (!generatedInviteUrl) return;
    navigator.clipboard.writeText(generatedInviteUrl);
    setCopied(true);
    toast.success('Copied invitation link to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Routes>
        <Route 
          element={
            <LabLayout 
              onOpenNewProject={() => setShowProjectModal(true)}
              onOpenInviteModal={() => setShowInviteModal(true)}
            />
          }
        >
          <Route path="/" element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<LabOverview onOpenNewProject={() => setShowProjectModal(true)} />} />
          <Route path="projects" element={<LabProjects onOpenNewProject={() => setShowProjectModal(true)} />} />
          <Route path="projects/:projectId" element={<LabProjectDetail />} />
          <Route path="tasks" element={<LabTasks />} />
          <Route path="thesis" element={<LabThesis />} />
          <Route path="files" element={<LabFiles />} />
          <Route path="ai" element={<LabAI />} />
          <Route path="chat" element={<LabChat />} />
          <Route path="members" element={<LabMembers onOpenInviteModal={() => setShowInviteModal(true)} refreshTrigger={inviteRefreshTrigger} />} />
          <Route path="settings" element={<LabSettings />} />
          <Route path="billing" element={<LabBilling />} />
          <Route path="guide" element={<LabGuide />} />
        </Route>
      </Routes>

      {/* Global New Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E5E5DF] max-w-md w-full p-6 shadow-xl">
            <h3 className="text-base font-bold text-[#171717] mb-3">Launch Research Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-[#525252] block mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Epigenetic Modifications in Stem Cells"
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5DF] rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#525252] block mb-1">Description / Hypotheses</label>
                <textarea
                  rows={3}
                  placeholder="Overarching aims and methodologies..."
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5DF] rounded-lg text-xs resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#525252] block mb-1">Target Journal</label>
                  <input
                    type="text"
                    placeholder="e.g. Science"
                    value={projectForm.target_journal}
                    onChange={(e) => setProjectForm({ ...projectForm, target_journal: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E5E5DF] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#525252] block mb-1">Visibility</label>
                  <select
                    value={projectForm.visibility}
                    onChange={(e) => setProjectForm({ ...projectForm, visibility: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E5E5DF] rounded-lg text-xs"
                  >
                    <option value="lab_members">Lab Members</option>
                    <option value="project_team">Project Team Only</option>
                    <option value="private">Private (PI & Lead)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="px-4 py-2 text-xs text-[#737373]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingProject}
                  className="px-4 py-2 bg-[#0F172A] text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  {creatingProject ? 'Initializing...' : 'Launch Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E5E5DF] max-w-md w-full p-6 shadow-xl">
            <h3 className="text-base font-bold text-[#171717] mb-3">Invite Colleague to Lab</h3>
            {!generatedInviteUrl ? (
              <form onSubmit={handleCreateInvite} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-[#525252] block mb-1">Researcher Email</label>
                  <input
                    type="email"
                    required
                    placeholder="researcher@university.edu"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E5E5DF] rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#525252] block mb-1">Assigned Role</label>
                  <select
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E5E5DF] rounded-lg text-xs"
                  >
                    <option value="postdoc">Postdoctoral Fellow</option>
                    <option value="phd_student">PhD Researcher</option>
                    <option value="masters_student">Master’s Student</option>
                    <option value="ra">Research Assistant</option>
                    <option value="observer">Lab Observer / Guest</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 text-xs text-[#737373]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0F172A] text-white rounded-xl text-xs font-bold shadow-xs"
                  >
                    Generate Secure Link
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800">
                  <Check size={16} className="text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold block">Invitation Email Dispatched!</span>
                    <span className="text-[11px] text-emerald-700">
                      An official invitation has been emailed to <strong>{inviteForm.email}</strong>. This secure link is valid for <strong>3 days</strong>.
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">
                    Direct One-Time Access Link (3-Day Validity):
                  </label>
                  <div className="p-3 bg-[#FAFAF8] border border-[#E5E5DF] rounded-xl flex items-center justify-between gap-2 text-xs font-mono break-all">
                    <span className="line-clamp-2 text-slate-800">{generatedInviteUrl}</span>
                    <button
                      onClick={handleCopyLink}
                      className="p-2 bg-white border border-[#E5E5DF] rounded-lg text-[#171717] hover:bg-[#F4F4F0] shrink-0 cursor-pointer shadow-xs"
                      title="Copy Link"
                    >
                      {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    💡 If you close this window, you can always view, copy, or resend this link from the <strong>Members & Roles</strong> tab.
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      setShowInviteModal(false);
                      setGeneratedInviteUrl('');
                      setInviteForm({ email: '', role: 'ra' });
                    }}
                    className="px-5 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
