import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useLab } from '../context/LabContext';
import { labApi } from '../utils/labApi';
import { Settings, Building2, Globe, FileText, ShieldAlert, Save, Lock, Info, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LabSettings() {
  const { labId } = useParams();
  const { currentLab, can, userRole, refreshCurrentLab } = useLab();

  const isEditable = can('lab.manage');

  const [form, setForm] = useState({
    name: '',
    institution: '',
    department: '',
    website: '',
    description: ''
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentLab) {
      setForm({
        name: currentLab.name || '',
        institution: currentLab.institution || '',
        department: currentLab.department || '',
        website: currentLab.website || '',
        description: currentLab.description || ''
      });
    }
  }, [currentLab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEditable) {
      toast.error('You do not have permission to modify lab settings.');
      return;
    }
    try {
      setSaving(true);
      const res = await labApi.updateSettings(labId, form);
      if (res && res.lab) {
        toast.success('Lab settings saved and persisted to Supabase database.');
        if (refreshCurrentLab) {
          await refreshCurrentLab();
        }
      }
    } catch (e) {
      toast.error(e.message || 'Failed to update settings in database.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#171717]">Lab Settings & Academic Profile</h2>
        <p className="text-xs text-[#737373] mt-0.5">
          Organization identity, affiliated research institution, and access boundaries stored in Supabase.
        </p>
      </div>

      {/* Role Permission Notice */}
      {!isEditable ? (
        <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start gap-3">
          <Lock size={16} className="text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <span className="font-bold block">View-Only Mode (Role: {userRole ? userRole.toUpperCase() : 'MEMBER'})</span>
            You are browsing this laboratory's academic profile in read-only mode. Only Principal Investigators (PIs) and designated Lab Administrators hold administrative authority to edit organizational identity, institutional domains, and research descriptions.
          </div>
        </div>
      ) : (
        <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-900">
          <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
          <span>
            <strong className="font-bold">Administrative Access Granted:</strong> You hold full administrative authority to update this research laboratory's profile.
          </span>
        </div>
      )}

      <div className="bg-white border border-[#E5E5DF] rounded-2xl p-6 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#525252] block mb-1">
              Lab Organization Name {isEditable && <span className="text-rose-500">*</span>}
            </label>
            <input
              type="text"
              required
              disabled={!isEditable}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={`w-full px-3.5 py-2 border rounded-xl text-xs text-[#171717] focus:outline-none transition-colors ${
                !isEditable 
                  ? 'bg-[#FAFAF8] border-[#E5E5DF] text-[#737373] cursor-not-allowed' 
                  : 'bg-white border-[#E5E5DF] focus:border-[#0F172A]'
              }`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#525252] block mb-1">Institution / University</label>
              <input
                type="text"
                disabled={!isEditable}
                placeholder="e.g. Harvard University"
                value={form.institution}
                onChange={(e) => setForm({ ...form, institution: e.target.value })}
                className={`w-full px-3.5 py-2 border rounded-xl text-xs text-[#171717] focus:outline-none transition-colors ${
                  !isEditable 
                    ? 'bg-[#FAFAF8] border-[#E5E5DF] text-[#737373] cursor-not-allowed' 
                    : 'bg-white border-[#E5E5DF] focus:border-[#0F172A]'
                }`}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#525252] block mb-1">Academic Department</label>
              <input
                type="text"
                disabled={!isEditable}
                placeholder="e.g. Department of Genetics"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className={`w-full px-3.5 py-2 border rounded-xl text-xs text-[#171717] focus:outline-none transition-colors ${
                  !isEditable 
                    ? 'bg-[#FAFAF8] border-[#E5E5DF] text-[#737373] cursor-not-allowed' 
                    : 'bg-white border-[#E5E5DF] focus:border-[#0F172A]'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#525252] block mb-1">Official Lab Website</label>
            <input
              type="url"
              disabled={!isEditable}
              placeholder="https://genomics.harvard.edu"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              className={`w-full px-3.5 py-2 border rounded-xl text-xs text-[#171717] focus:outline-none transition-colors ${
                !isEditable 
                  ? 'bg-[#FAFAF8] border-[#E5E5DF] text-[#737373] cursor-not-allowed' 
                  : 'bg-white border-[#E5E5DF] focus:border-[#0F172A]'
              }`}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#525252] block mb-1">Research Mission & Focus</label>
            <textarea
              rows={4}
              disabled={!isEditable}
              placeholder="Describe your laboratory's overarching research agenda..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={`w-full px-3.5 py-2 border rounded-xl text-xs text-[#171717] focus:outline-none resize-none transition-colors ${
                !isEditable 
                  ? 'bg-[#FAFAF8] border-[#E5E5DF] text-[#737373] cursor-not-allowed' 
                  : 'bg-white border-[#E5E5DF] focus:border-[#0F172A]'
              }`}
            />
          </div>

          {isEditable && (
            <div className="pt-3 border-t border-[#F4F4F0] flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl text-xs font-bold shadow-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Save size={13} />
                <span>{saving ? 'Saving to Database...' : 'Save Lab Profile'}</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
