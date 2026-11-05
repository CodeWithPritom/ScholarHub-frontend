import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useLab } from '../context/LabContext';
import { labApi } from '../utils/labApi';
import { LAB_ROLES } from '../utils/labConstants';
import { 
  Users, 
  UserPlus, 
  Mail, 
  ShieldCheck, 
  Copy, 
  Check, 
  Clock, 
  RotateCw,
  Trash2,
  AlertCircle,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { toast } from 'sonner';

export default function LabMembers({ onOpenInviteModal, refreshTrigger }) {
  const { labId } = useParams();
  const { members, can, userRole } = useLab();

  const [invitations, setInvitations] = useState([]);
  const [loadingInvites, setLoadingInvites] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [revokingId, setRevokingId] = useState(null);

  const fetchInvitations = async () => {
    if (!labId) return;
    setLoadingInvites(true);
    try {
      const res = await labApi.listInvitations(labId);
      if (res && res.invitations) {
        setInvitations(res.invitations);
      }
    } catch (err) {
      console.error('Failed to fetch invitations:', err);
    } finally {
      setLoadingInvites(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, [labId, refreshTrigger]);

  const getTimeRemaining = (expiresAt) => {
    if (!expiresAt) return { text: '3 days valid', isExpired: false, badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' };
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) {
      return { text: 'Expired (3-Day Limit)', isExpired: true, badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' };
    }
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) {
      const remHours = hours % 24;
      return { 
        text: `${days}d ${remHours}h remaining`, 
        isExpired: false, 
        badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200' 
      };
    }
    return { 
      text: `${hours}h remaining`, 
      isExpired: false, 
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-300' 
    };
  };

  const handleCopyInviteLink = async (inv) => {
    if (!inv.invite_url) {
      toast.error('Token is encrypted. Click Invite Researcher to generate a fresh 3-day link.');
      return;
    }
    try {
      await navigator.clipboard.writeText(inv.invite_url);
      setCopiedId(inv.id);
      toast.success('Invitation link copied to clipboard!');
      setTimeout(() => setCopiedId(null), 2500);
    } catch (err) {
      toast.error('Failed to copy link to clipboard.');
    }
  };

  const handleRevoke = async (invitationId) => {
    if (!confirm('Are you sure you want to revoke this invitation? The link will be permanently deactivated.')) return;
    setRevokingId(invitationId);
    try {
      await labApi.revokeInvitation(labId, invitationId);
      toast.success('Invitation revoked successfully.');
      setInvitations(prev => prev.filter(i => i.id !== invitationId));
    } catch (err) {
      toast.error('Failed to revoke invitation.');
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#171717]">Lab Members & Academic Hierarchy</h2>
          <p className="text-xs text-[#737373] mt-0.5">
            8 academic roles, cryptographic invitations with 3-day validity, and customized capability sets.
          </p>
        </div>

        {can('members.invite') && (
          <button
            onClick={onOpenInviteModal}
            className="px-4 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus size={14} />
            <span>Invite Researcher</span>
          </button>
        )}
      </div>

      {/* Active Members Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-slate-700" />
            <h3 className="text-sm font-bold text-[#171717]">Active Laboratory Personnel</h3>
            <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-full text-[10px] font-bold">
              {members.length}
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#E5E5DF] rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFAF8] border-b border-[#E5E5DF] text-[#737373] font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Researcher</th>
                <th className="py-3 px-4">Academic Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Overrides</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F4F0]">
              {members.map((mem) => {
                const roleObj = LAB_ROLES.find(r => r.id === mem.role) || LAB_ROLES[7];
                return (
                  <tr key={mem.id || mem.user_id} className="hover:bg-[#FAFAF8] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {mem.avatar_url ? (
                          <img
                            src={mem.avatar_url}
                            alt={mem.full_name || 'Member'}
                            className="w-8 h-8 rounded-full object-cover border border-slate-300"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center font-bold text-xs text-indigo-700 shadow-xs">
                            {(mem.full_name || mem.email || mem.user_id || 'U').substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-[#171717] block leading-tight">
                            {mem.full_name || (mem.email ? mem.email.split('@')[0] : (mem.user_id?.length > 15 ? `Researcher ${mem.user_id.substring(0, 6)}` : mem.user_id))}
                          </span>
                          <span className="text-[11px] text-[#737373] mt-0.5 block font-medium">
                            {mem.email || (mem.institution ? mem.institution : `ID: ${mem.user_id?.substring(0, 12)}...`)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${roleObj.badgeColor}`}>
                        {roleObj.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {mem.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#737373] font-medium">
                      {mem.joined_at ? new Date(mem.joined_at).toLocaleDateString() : 'Active Member'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="text-[11px] text-[#737373]">
                        {mem.custom_capabilities?.length > 0 ? `+${mem.custom_capabilities.length} custom` : 'Standard'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Invitations Section with 3-Day Expiration & Link Recovery */}
      {can('members.invite') && (
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-indigo-600" />
                <h3 className="text-sm font-bold text-[#171717]">Pending Cryptographic Invitations</h3>
                <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-full text-[10px] font-bold">
                  {invitations.length} issued
                </span>
              </div>
              <p className="text-[11px] text-[#737373] mt-0.5">
                Every invitation includes an auto-dispatched email and a direct link valid for <strong>3 days</strong>. If you closed the modal, you can retrieve, copy, or revoke links here anytime.
              </p>
            </div>

            <button
              onClick={fetchInvitations}
              disabled={loadingInvites}
              className="self-start sm:self-auto px-3 py-1.5 bg-white border border-[#E5E5DF] hover:bg-[#F4F4F0] text-slate-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              title="Refresh Invitations"
            >
              <RotateCw size={12} className={loadingInvites ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="bg-white border border-[#E5E5DF] rounded-2xl overflow-hidden shadow-xs">
            {invitations.length === 0 ? (
              <div className="p-8 text-center">
                <Mail size={28} className="mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-700">No Pending Invitations</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  All issued invitations have been accepted into the lab or have expired.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFAF8] border-b border-[#E5E5DF] text-[#737373] font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Invited Email</th>
                    <th className="py-3 px-4">Assigned Role</th>
                    <th className="py-3 px-4">3-Day Validity / Status</th>
                    <th className="py-3 px-4">Invitation Link</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4F4F0]">
                  {invitations.map((inv) => {
                    const roleObj = LAB_ROLES.find(r => r.id === inv.role) || LAB_ROLES[7];
                    const validity = getTimeRemaining(inv.expires_at);
                    const isAccepted = inv.is_accepted || inv.status === 'accepted';
                    const isExpired = !isAccepted && (inv.is_expired || validity.isExpired);

                    return (
                      <tr key={inv.id} className="hover:bg-[#FAFAF8] transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0">
                              <Mail size={12} />
                            </div>
                            <div>
                              <span className="font-bold text-[#171717] block leading-tight">
                                {inv.email}
                              </span>
                              <span className="text-[10px] text-slate-400 mt-0.5 block">
                                Issued {inv.created_at ? new Date(inv.created_at).toLocaleDateString() : 'Recently'}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${roleObj.badgeColor}`}>
                            {roleObj.label}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          {isAccepted ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                              <Check size={11} /> Accepted &amp; Joined
                            </span>
                          ) : isExpired ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1">
                              <AlertCircle size={11} /> Expired (3-Day Limit)
                            </span>
                          ) : (
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border inline-flex items-center gap-1 ${validity.badgeClass}`}>
                              <Clock size={11} /> {validity.text}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          {inv.invite_url && !isAccepted ? (
                            <div className="flex items-center gap-1.5 max-w-xs">
                              <span className="text-[11px] font-mono text-slate-600 truncate bg-slate-50 border border-slate-200 px-2 py-1 rounded max-w-[200px]" title={inv.invite_url}>
                                {inv.invite_url}
                              </span>
                              <button
                                onClick={() => handleCopyInviteLink(inv)}
                                className="p-1.5 bg-white border border-[#E5E5DF] hover:bg-[#F4F4F0] rounded-md text-slate-700 transition-colors cursor-pointer shrink-0"
                                title="Copy Invitation Link"
                              >
                                {copiedId === inv.id ? (
                                  <Check size={12} className="text-emerald-600" />
                                ) : (
                                  <Copy size={12} />
                                )}
                              </button>
                            </div>
                          ) : isAccepted ? (
                            <span className="text-[11px] text-slate-400 italic">Redeemed</span>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Encrypted token</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {inv.invite_url && !isAccepted && !isExpired && (
                              <button
                                onClick={() => handleCopyInviteLink(inv)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                {copiedId === inv.id ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                                <span>{copiedId === inv.id ? 'Copied' : 'Copy Link'}</span>
                              </button>
                            )}

                            {isExpired && (
                              <button
                                onClick={onOpenInviteModal}
                                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <UserPlus size={11} />
                                <span>Re-Invite</span>
                              </button>
                            )}

                            {!isAccepted && (
                              <button
                                onClick={() => handleRevoke(inv.id)}
                                disabled={revokingId === inv.id}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                title="Revoke Invitation"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

