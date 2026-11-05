import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLab } from '../context/LabContext';
import { labApi } from '../utils/labApi';
import { RESEARCH_STAGES } from '../utils/labConstants';
import { 
  FolderGit2, 
  CheckSquare, 
  BookOpen, 
  Coins, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  Activity, 
  Plus, 
  ExternalLink 
} from 'lucide-react';

export default function LabOverview({ onOpenNewProject }) {
  const { labId } = useParams();
  const navigate = useNavigate();
  const { currentLab, quota, userRole } = useLab();

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [thesisList, setThesisList] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      if (!labId) return;
      try {
        setLoading(true);
        const [projRes, taskRes, thesisRes, actRes] = await Promise.all([
          labApi.listProjects(labId).catch(() => ({ projects: [] })),
          labApi.listTasks(labId).catch(() => ({ tasks: [] })),
          labApi.listThesis(labId).catch(() => ({ thesis_works: [] })),
          labApi.getActivity(labId, 8).catch(() => ({ activity: [] })),
        ]);

        setProjects(projRes.projects || []);
        setTasks(taskRes.tasks || []);
        setThesisList(thesisRes.thesis_works || []);
        setActivities(actRes.activity || []);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, [labId]);

  const activeProjects = projects.filter(p => p.stage !== 'archived');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');

  return (
    <div className="space-y-6">
      {/* Banner / Welcome Header */}
      <div className="bg-white border border-[#E5E5DF] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              Autonomous Academic Workspace
            </span>
            <span className="text-xs text-[#737373]">ID: {currentLab?.slug || labId}</span>
          </div>
          <h2 className="text-xl font-bold text-[#171717]">
            {currentLab?.name || 'Academic Research Portal'}
          </h2>
          <p className="text-xs text-[#525252] mt-1 max-w-2xl">
            {currentLab?.description || 'A unified platform for multi-disciplinary scientific collaboration, versioned data assets, and high-performance AI inference.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => navigate(`/lab/${labId}/ai`)}
            className="px-4 py-2 bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-colors shadow-xs"
          >
            <Sparkles size={14} className="text-purple-600" />
            <span>Launch AI Gateway</span>
          </button>
          <button
            onClick={onOpenNewProject}
            className="px-4 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-colors shadow-xs"
          >
            <Plus size={14} />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          onClick={() => navigate(`/lab/${labId}/projects`)}
          className="bg-white border border-[#E5E5DF] p-4 rounded-xl shadow-xs cursor-pointer hover:border-[#D4D4CD] transition-all"
        >
          <div className="flex items-center justify-between text-[#737373] mb-2">
            <span className="text-xs font-semibold">Active Projects</span>
            <FolderGit2 size={16} className="text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-[#171717]">{activeProjects.length}</div>
          <p className="text-[11px] text-[#737373] mt-1">Across 12 research stages</p>
        </div>

        <div 
          onClick={() => navigate(`/lab/${labId}/tasks`)}
          className="bg-white border border-[#E5E5DF] p-4 rounded-xl shadow-xs cursor-pointer hover:border-[#D4D4CD] transition-all"
        >
          <div className="flex items-center justify-between text-[#737373] mb-2">
            <span className="text-xs font-semibold">Tasks in Flight</span>
            <CheckSquare size={16} className="text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-[#171717]">{inProgressTasks.length}</div>
          <p className="text-[11px] text-[#737373] mt-1">Of {tasks.length} total tasks</p>
        </div>

        <div 
          onClick={() => navigate(`/lab/${labId}/thesis`)}
          className="bg-white border border-[#E5E5DF] p-4 rounded-xl shadow-xs cursor-pointer hover:border-[#D4D4CD] transition-all"
        >
          <div className="flex items-center justify-between text-[#737373] mb-2">
            <span className="text-xs font-semibold">Manuscripts</span>
            <BookOpen size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-[#171717]">{thesisList.length}</div>
          <p className="text-[11px] text-[#737373] mt-1">With CRediT authorship</p>
        </div>

        <div 
          onClick={() => navigate(`/lab/${labId}/billing`)}
          className="bg-white border border-[#E5E5DF] p-4 rounded-xl shadow-xs cursor-pointer hover:border-[#D4D4CD] transition-all"
        >
          <div className="flex items-center justify-between text-[#737373] mb-2">
            <span className="text-xs font-semibold">Lab Tokens</span>
            <Coins size={16} className="text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-[#171717]">
            {quota.available?.toLocaleString() || 0}
          </div>
          <p className="text-[11px] text-[#737373] mt-1">Shared compute pool</p>
        </div>
      </div>

      {/* Main Grid: Projects & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Projects List (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#171717] flex items-center gap-2">
              <FolderGit2 size={16} className="text-blue-600" />
              Active Research Projects
            </h3>
            <button
              onClick={() => navigate(`/lab/${labId}/projects`)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>View all ({projects.length})</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="bg-white border border-dashed border-[#E5E5DF] rounded-xl p-8 text-center">
              <FolderGit2 size={32} className="text-[#A3A3A3] mx-auto mb-2" />
              <h4 className="text-sm font-bold text-[#171717]">No research projects created yet</h4>
              <p className="text-xs text-[#737373] max-w-sm mx-auto mt-1 mb-4">
                Initialize your first project to track the 12-stage research lifecycle and assign Kanban deliverables.
              </p>
              <button
                onClick={onOpenNewProject}
                className="px-3.5 py-1.5 bg-[#0F172A] text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                + Create First Project
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.slice(0, 4).map((proj) => {
                const stageObj = RESEARCH_STAGES.find(s => s.id === proj.stage) || RESEARCH_STAGES[0];
                return (
                  <div
                    key={proj.id}
                    onClick={() => navigate(`/lab/${labId}/projects/${proj.id}`)}
                    className="bg-white border border-[#E5E5DF] hover:border-[#D4D4CD] p-4 rounded-xl shadow-xs transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h4 className="text-sm font-bold text-[#171717] group-hover:text-blue-600 transition-colors">
                          {proj.title}
                        </h4>
                        <p className="text-xs text-[#737373] line-clamp-1 mt-0.5">
                          {proj.description || 'No description provided.'}
                        </p>
                      </div>
                      <span 
                        className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0"
                        style={{ backgroundColor: stageObj.bg, color: stageObj.color }}
                      >
                        {stageObj.label}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[11px] text-[#737373] mb-1">
                        <span>Lifecycle Progress (Stage {stageObj.step} of 12)</span>
                        <span className="font-semibold text-[#171717]">{proj.progress_percent || Math.round((stageObj.step / 12) * 100)}%</span>
                      </div>
                      <div className="w-full bg-[#E5E5DF] h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-300"
                          style={{ 
                            width: `${proj.progress_percent || Math.round((stageObj.step / 12) * 100)}%`,
                            backgroundColor: stageObj.color
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Lab Activity (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#171717] flex items-center gap-2">
              <Activity size={16} className="text-emerald-600" />
              Audit Stream
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Live
            </span>
          </div>

          <div className="bg-white border border-[#E5E5DF] rounded-xl p-4 shadow-xs space-y-3">
            {activities.length === 0 ? (
              <p className="text-xs text-[#737373] text-center py-6">
                No recent activity recorded yet.
              </p>
            ) : (
              activities.map((act) => (
                <div key={act.id} className="flex items-start gap-2.5 text-xs pb-3 border-b border-[#F4F4F0] last:border-0 last:pb-0">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[#171717] truncate">
                      {act.action.replace('.', ' ')}
                    </p>
                    <p className="text-[11px] text-[#737373] truncate">
                      {act.details?.title || act.details?.name || act.entity_type}
                    </p>
                    <span className="text-[10px] text-[#A3A3A3] mt-0.5 block">
                      {act.created_at ? new Date(act.created_at).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
