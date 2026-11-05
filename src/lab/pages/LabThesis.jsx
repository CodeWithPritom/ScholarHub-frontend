import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useLab } from '../context/LabContext';
import { labApi } from '../utils/labApi';
import { CREDIT_TAXONOMY } from '../utils/labConstants';
import { 
  BookOpen, 
  Plus, 
  Users, 
  Award, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  FileText 
} from 'lucide-react';
import { toast } from 'sonner';

export default function LabThesis() {
  const { labId } = useParams();
  const { can } = useLab();

  const [thesisList, setThesisList] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State for New Manuscript
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    abstract: '',
    target_journal: '',
    project_id: ''
  });

  // Modal State for CRediT Authorship
  const [selectedThesis, setSelectedThesis] = useState(null);
  const [authors, setAuthors] = useState([]);
  const [showAuthorsModal, setShowAuthorsModal] = useState(false);
  const [authorForm, setAuthorForm] = useState({
    author_name: '',
    position: 1,
    role_type: 'first_author',
    contribution_roles: [],
    affiliation: ''
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [pRes, thRes] = await Promise.all([
          labApi.listProjects(labId).catch(() => ({ projects: [] })),
          labApi.listThesis(labId).catch(() => ({ thesis_works: [] }))
        ]);
        setProjects(pRes.projects || []);
        setThesisList(thRes.thesis_works || []);
        if (pRes.projects?.length > 0) {
          setForm(prev => ({ ...prev, project_id: pRes.projects[0].id }));
        }
      } catch (e) {
        toast.error('Failed to load thesis works');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [labId]);

  const handleOpenAuthors = async (thesis) => {
    setSelectedThesis(thesis);
    try {
      const res = await labApi.listThesisAuthors(labId, thesis.id);
      setAuthors(res.authors || []);
      setAuthorForm(prev => ({ ...prev, position: (res.authors?.length || 0) + 1 }));
      setShowAuthorsModal(true);
    } catch (e) {
      toast.error('Failed to load CRediT authors');
    }
  };

  const handleAddAuthor = async (e) => {
    e.preventDefault();
    if (!authorForm.author_name.trim() || !selectedThesis) return;
    try {
      const res = await labApi.setThesisAuthor(labId, selectedThesis.id, authorForm);
      setAuthors([...authors, res.author]);
      setAuthorForm({
        author_name: '',
        position: authors.length + 2,
        role_type: 'co_author',
        contribution_roles: [],
        affiliation: ''
      });
      toast.success('CRediT author assigned');
    } catch (e) {
      toast.error('Failed to add author');
    }
  };

  const handleCreateThesis = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    try {
      const res = await labApi.createThesis(labId, {
        ...form,
        project_id: form.project_id || (projects[0]?.id || '')
      });
      setThesisList([res.thesis_work, ...thesisList]);
      setShowCreateModal(false);
      setForm({ title: '', abstract: '', target_journal: '', project_id: projects[0]?.id || '' });
      toast.success('Manuscript registered for publication tracking');
    } catch (e) {
      toast.error('Failed to create manuscript');
    }
  };

  const toggleCreditRole = (roleId) => {
    setAuthorForm(prev => {
      const exists = prev.contribution_roles.includes(roleId);
      return {
        ...prev,
        contribution_roles: exists 
          ? prev.contribution_roles.filter(r => r !== roleId)
          : [...prev.contribution_roles, roleId]
      };
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#171717]">Thesis, Manuscripts & CRediT Authorship</h2>
          <p className="text-xs text-[#737373] mt-0.5">
            Contributor Roles Taxonomy (CRediT) standard enforcement and journal submissions.
          </p>
        </div>

        {can('thesis.create') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-xs"
          >
            <Plus size={14} />
            <span>New Manuscript</span>
          </button>
        )}
      </div>

      {/* Manuscript Cards */}
      {loading ? (
        <div className="text-center py-12 text-xs text-[#737373]">Loading manuscripts...</div>
      ) : thesisList.length === 0 ? (
        <div className="bg-white border border-dashed border-[#E5E5DF] rounded-2xl p-12 text-center">
          <BookOpen size={36} className="text-[#A3A3A3] mx-auto mb-2" />
          <h3 className="text-sm font-bold text-[#171717]">No manuscripts documented yet</h3>
          <p className="text-xs text-[#737373] mt-1 max-w-sm mx-auto mb-4">
            Register your thesis or journal submissions to map author contributions accurately.
          </p>
          {can('thesis.create') && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-[#0F172A] text-white rounded-xl text-xs font-semibold"
            >
              + Register Manuscript
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {thesisList.map((th) => (
            <div key={th.id} className="bg-white border border-[#E5E5DF] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700">
                    {th.status}
                  </span>
                  {th.target_journal && (
                    <span className="text-xs font-semibold text-[#525252]">
                      Target: {th.target_journal}
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-[#171717]">{th.title}</h3>
                {th.abstract && (
                  <p className="text-xs text-[#737373] line-clamp-3 mt-1.5 leading-relaxed">
                    {th.abstract}
                  </p>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-[#F4F4F0] flex items-center justify-between">
                <span className="text-[11px] text-[#737373] flex items-center gap-1">
                  <Award size={13} className="text-amber-600" />
                  CRediT Compliant
                </span>

                <button
                  onClick={() => handleOpenAuthors(th)}
                  className="px-3 py-1.5 bg-[#FAFAF8] hover:bg-[#F4F4F0] text-[#171717] border border-[#E5E5DF] rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                >
                  <Users size={12} />
                  <span>Authors & Roles</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Authorship & CRediT Taxonomy Modal */}
      {showAuthorsModal && selectedThesis && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E5E5DF] max-w-2xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F4F4F0]">
              <div>
                <h3 className="text-sm font-bold text-[#171717]">
                  CRediT Authorship — {selectedThesis.title}
                </h3>
                <p className="text-[11px] text-[#737373]">
                  Contributors Roles Taxonomy standard (14 certified roles).
                </p>
              </div>
              <button onClick={() => setShowAuthorsModal(false)} className="text-xs text-[#737373]">
                Close
              </button>
            </div>

            {/* Existing Authors List */}
            <div className="space-y-2 mb-6">
              <h4 className="text-xs font-bold text-[#525252]">Authors Ordered by Contribution Position</h4>
              {authors.length === 0 ? (
                <p className="text-xs text-[#A3A3A3] italic">No authors attributed yet.</p>
              ) : (
                authors.map((a, idx) => (
                  <div key={a.id || idx} className="p-3 bg-[#FAFAF8] border border-[#E5E5DF] rounded-xl text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#171717]">
                        #{a.position}: {a.author_name}
                      </span>
                      <span className="text-[10px] font-bold uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                        {a.role_type}
                      </span>
                    </div>
                    {a.contribution_roles?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {a.contribution_roles.map((r) => (
                          <span key={r} className="px-2 py-0.5 bg-white border border-[#E5E5DF] text-[10px] rounded text-[#525252]">
                            {r.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Add Author Form */}
            {can('authors.manage') && (
              <form onSubmit={handleAddAuthor} className="border-t border-[#F4F4F0] pt-4 space-y-3">
                <h4 className="text-xs font-bold text-[#171717]">Add Contributing Author</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#525252] block mb-1">Author Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Eleanor Vance"
                      value={authorForm.author_name}
                      onChange={(e) => setAuthorForm({ ...authorForm, author_name: e.target.value })}
                      className="w-full px-3 py-1.5 border border-[#E5E5DF] rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#525252] block mb-1">Author Role</label>
                    <select
                      value={authorForm.role_type}
                      onChange={(e) => setAuthorForm({ ...authorForm, role_type: e.target.value })}
                      className="w-full px-3 py-1.5 border border-[#E5E5DF] rounded-lg text-xs"
                    >
                      <option value="first_author">First Author</option>
                      <option value="co_first_author">Co-First Author</option>
                      <option value="co_author">Co-Author</option>
                      <option value="corresponding">Corresponding Author</option>
                      <option value="senior_author">Senior Author (Last)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#525252] block mb-1.5">
                    CRediT Contributor Roles (Select all applicable)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {CREDIT_TAXONOMY.map((c) => {
                      const selected = authorForm.contribution_roles.includes(c.id);
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => toggleCreditRole(c.id)}
                          className={`
                            px-2 py-1.5 rounded text-[10px] text-left border transition-colors
                            ${selected 
                              ? 'bg-[#0F172A] text-white border-[#0F172A]' 
                              : 'bg-white border-[#E5E5DF] text-[#525252] hover:bg-[#FAFAF8]'
                            }
                          `}
                        >
                          {c.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0F172A] text-white rounded-xl text-xs font-bold"
                  >
                    Save CRediT Attribution
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* New Manuscript Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E5E5DF] max-w-md w-full p-6 shadow-xl">
            <h3 className="text-base font-bold text-[#171717] mb-3">Register Manuscript Draft</h3>
            <form onSubmit={handleCreateThesis} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#525252] block mb-1">Project</label>
                <select
                  value={form.project_id}
                  onChange={(e) => setForm({ ...form, project_id: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5DF] rounded-lg text-xs"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#525252] block mb-1">Manuscript Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Genomic profiling of oncogenic mutations in lung adenocarcinoma"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5DF] rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#525252] block mb-1">Target Journal</label>
                <input
                  type="text"
                  placeholder="e.g. Nature Biotechnology or Cell"
                  value={form.target_journal}
                  onChange={(e) => setForm({ ...form, target_journal: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5DF] rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs text-[#737373]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0F172A] text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Save Manuscript
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
