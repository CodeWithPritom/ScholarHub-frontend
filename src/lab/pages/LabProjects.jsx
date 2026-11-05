import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLab } from '../context/LabContext';
import { labApi } from '../utils/labApi';
import { RESEARCH_STAGES } from '../utils/labConstants';
import { 
  FolderGit2, 
  Plus, 
  Search, 
  Filter, 
  ArrowRight, 
  Calendar, 
  Tag, 
  CheckCircle2, 
  Lock 
} from 'lucide-react';
import { toast } from 'sonner';

export default function LabProjects({ onOpenNewProject }) {
  const { labId } = useParams();
  const navigate = useNavigate();
  const { can } = useLab();

  const [projects, setProjects] = useState([]);
  const [selectedStage, setSelectedStage] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true);
        const res = await labApi.listProjects(labId);
        setProjects(res.projects || []);
      } catch (e) {
        toast.error('Failed to load projects');
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, [labId]);

  const filtered = projects.filter((p) => {
    const matchesStage = selectedStage === 'all' || p.stage === selectedStage;
    const matchesSearch = !searchQuery || 
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStage && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#171717]">Research Projects</h2>
          <p className="text-xs text-[#737373] mt-0.5">
            12-Stage academic lifecycle tracking, milestones, and deliverables.
          </p>
        </div>

        {can('projects.create') && (
          <button
            onClick={onOpenNewProject}
            className="px-4 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-colors shadow-xs"
          >
            <Plus size={14} />
            <span>Create Project</span>
          </button>
        )}
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-[#E5E5DF] p-3 rounded-xl shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
          <input
            type="text"
            placeholder="Search projects by title, methodology or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-[#FAFAF8] border border-[#E5E5DF] rounded-lg text-xs text-[#171717] placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#171717]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="px-3 py-1.5 bg-[#FAFAF8] border border-[#E5E5DF] rounded-lg text-xs text-[#171717] font-medium focus:outline-none focus:border-[#171717]"
          >
            <option value="all">All Stages (12)</option>
            {RESEARCH_STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                Stage {s.step}: {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="text-center py-12 text-xs text-[#737373]">
          Loading research projects...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-dashed border-[#E5E5DF] rounded-2xl p-12 text-center">
          <FolderGit2 size={36} className="text-[#A3A3A3] mx-auto mb-2" />
          <h3 className="text-sm font-bold text-[#171717]">No matching projects found</h3>
          <p className="text-xs text-[#737373] mt-1 max-w-sm mx-auto mb-4">
            Try adjusting your search criteria or create a new research workspace.
          </p>
          {can('projects.create') && (
            <button
              onClick={onOpenNewProject}
              className="px-4 py-2 bg-[#0F172A] text-white rounded-xl text-xs font-semibold"
            >
              + Create New Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((proj) => {
            const stageObj = RESEARCH_STAGES.find((s) => s.id === proj.stage) || RESEARCH_STAGES[0];
            const progress = proj.progress_percent || Math.round((stageObj.step / 12) * 100);

            return (
              <div
                key={proj.id}
                onClick={() => navigate(`/lab/${labId}/projects/${proj.id}`)}
                className="bg-white border border-[#E5E5DF] hover:border-[#D4D4CD] rounded-2xl p-5 shadow-xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                      style={{ backgroundColor: stageObj.bg, color: stageObj.color }}
                    >
                      Stage {stageObj.step}: {stageObj.label}
                    </span>
                    {proj.visibility === 'private' && (
                      <span className="text-[#737373]" title="Private Project">
                        <Lock size={12} />
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-[#171717] group-hover:text-blue-600 transition-colors line-clamp-2">
                    {proj.title}
                  </h3>
                  <p className="text-xs text-[#737373] line-clamp-2 mt-1.5 leading-relaxed">
                    {proj.description || 'No project description documented.'}
                  </p>

                  {proj.tags && proj.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {proj.tags.slice(0, 3).map((t, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-[#F4F4F0] text-[#525252] rounded text-[10px] font-medium">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-[#F4F4F0]">
                  <div className="flex items-center justify-between text-[11px] text-[#737373] mb-1">
                    <span>Research Progress</span>
                    <span className="font-bold text-[#171717]">{progress}%</span>
                  </div>
                  <div className="w-full bg-[#E5E5DF] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${progress}%`, backgroundColor: stageObj.color }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
