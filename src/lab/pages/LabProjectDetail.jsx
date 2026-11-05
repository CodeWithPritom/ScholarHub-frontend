import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLab } from '../context/LabContext';
import { labApi } from '../utils/labApi';
import { RESEARCH_STAGES, TASK_STATUSES } from '../utils/labConstants';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  CheckSquare, 
  BookOpen, 
  MessageSquare, 
  FolderTree, 
  Plus, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

export default function LabProjectDetail() {
  const { labId, projectId } = useParams();
  const navigate = useNavigate();
  const { can } = useLab();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [thesisList, setThesisList] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [activeTab, setActiveTab] = useState('tasks');
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  // New task form state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');

  useEffect(() => {
    async function loadData() {
      if (!projectId) return;
      try {
        setLoading(true);
        const [pRes, tRes, thRes, dRes] = await Promise.all([
          labApi.getProject(labId, projectId),
          labApi.listTasks(labId, projectId).catch(() => ({ tasks: [] })),
          labApi.listThesis(labId, projectId).catch(() => ({ thesis_works: [] })),
          labApi.listDiscussions(labId, 'project', projectId).catch(() => ({ discussions: [] }))
        ]);
        setProject(pRes.project);
        setTasks(tRes.tasks || []);
        setThesisList(thRes.thesis_works || []);
        setDiscussions(dRes.discussions || []);
      } catch (e) {
        toast.error('Failed to load project details');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [labId, projectId]);

  const handleStageChange = async (newStage) => {
    try {
      const res = await labApi.updateProjectStage(labId, projectId, newStage);
      setProject(res.project);
      toast.success(`Advanced project to ${newStage.replace('_', ' ')}`);
    } catch (e) {
      toast.error(e.message || 'Stage transition failed');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    try {
      const res = await labApi.createTask(labId, {
        project_id: projectId,
        title: taskTitle.trim(),
        priority: taskPriority,
        status: 'todo'
      });
      setTasks([res.task, ...tasks]);
      setTaskTitle('');
      setShowTaskModal(false);
      toast.success('Task created successfully');
    } catch (e) {
      toast.error('Failed to create task');
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await labApi.createDiscussion(labId, {
        entity_type: 'project',
        entity_id: projectId,
        content: newComment.trim()
      });
      setDiscussions([...discussions, res.discussion]);
      setNewComment('');
      toast.success('Note posted');
    } catch (e) {
      toast.error('Failed to post discussion');
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-xs text-[#737373]">Loading research workspace...</div>;
  }

  if (!project) {
    return <div className="text-center py-12 text-xs text-red-500">Project not found</div>;
  }

  const currentStageObj = RESEARCH_STAGES.find(s => s.id === project.stage) || RESEARCH_STAGES[0];

  return (
    <div className="space-y-6">
      {/* Header & Back Button */}
      <div>
        <button
          onClick={() => navigate(`/lab/${labId}/projects`)}
          className="text-xs font-semibold text-[#525252] hover:text-[#171717] flex items-center gap-1.5 transition-colors mb-3"
        >
          <ArrowLeft size={13} />
          <span>Back to Projects</span>
        </button>

        <div className="bg-white border border-[#E5E5DF] rounded-2xl p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  style={{ backgroundColor: currentStageObj.bg, color: currentStageObj.color }}
                >
                  Stage {currentStageObj.step}: {currentStageObj.label}
                </span>
                <span className="text-xs text-[#737373]">{project.progress_percent}% Complete</span>
              </div>
              <h1 className="text-xl font-bold text-[#171717]">{project.title}</h1>
              <p className="text-xs text-[#525252] mt-1 max-w-3xl leading-relaxed">
                {project.description || 'No description provided.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTaskModal(true)}
                className="px-3.5 py-1.5 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-lg text-xs font-semibold shadow-xs inline-flex items-center gap-1.5"
              >
                <Plus size={13} />
                <span>Add Task</span>
              </button>
            </div>
          </div>

          {/* 12-Stage Interactive Lifecycle Stepper */}
          <div className="mt-6 pt-5 border-t border-[#F4F4F0]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#171717] uppercase tracking-wider">
                12-Stage Research Protocol Stepper
              </span>
              <span className="text-[10px] text-[#737373]">
                Click an adjacent stage to transition
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-1.5">
              {RESEARCH_STAGES.map((s) => {
                const isCurrent = s.id === project.stage;
                const isPast = s.step < currentStageObj.step;
                return (
                  <button
                    key={s.id}
                    onClick={() => handleStageChange(s.id)}
                    title={`Stage ${s.step}: ${s.label}`}
                    className={`
                      p-2 rounded-lg text-left transition-all border text-xs
                      ${isCurrent 
                        ? 'border-[#171717] bg-[#0F172A] text-white shadow-xs' 
                        : isPast 
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-800' 
                          : 'border-[#E5E5DF] bg-[#FAFAF8] text-[#737373] hover:border-[#171717]'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold">#{s.step}</span>
                      {isPast && <CheckCircle2 size={11} className="text-emerald-600" />}
                    </div>
                    <p className="text-[10px] font-semibold truncate leading-tight">
                      {s.label.split(' ')[0]}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E5E5DF]">
        {[
          { id: 'tasks', label: `Tasks (${tasks.length})`, icon: CheckSquare },
          { id: 'thesis', label: `Manuscripts (${thesisList.length})`, icon: BookOpen },
          { id: 'discussions', label: `Discussions (${discussions.length})`, icon: MessageSquare }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-2.5 text-xs font-bold border-b-2 inline-flex items-center gap-2 transition-all
                ${activeTab === tab.id
                  ? 'border-[#0F172A] text-[#0F172A]'
                  : 'border-transparent text-[#737373] hover:text-[#171717]'
                }
              `}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === 'tasks' && (
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="bg-white border border-dashed border-[#E5E5DF] rounded-xl p-8 text-center text-xs text-[#737373]">
              No tasks assigned yet. Click "Add Task" to track deliverables.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {tasks.map((t) => (
                <div key={t.id} className="bg-white border border-[#E5E5DF] p-3.5 rounded-xl shadow-xs">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase mb-2">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {t.status}
                    </span>
                    <span className="text-amber-600 font-semibold">{t.priority}</span>
                  </div>
                  <h4 className="text-xs font-bold text-[#171717]">{t.title}</h4>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'thesis' && (
        <div className="space-y-3">
          {thesisList.length === 0 ? (
            <div className="bg-white border border-dashed border-[#E5E5DF] rounded-xl p-8 text-center text-xs text-[#737373]">
              No thesis or publication drafts connected to this project.
            </div>
          ) : (
            thesisList.map((th) => (
              <div key={th.id} className="bg-white border border-[#E5E5DF] p-4 rounded-xl shadow-xs flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#171717]">{th.title}</h4>
                  <p className="text-xs text-[#737373] mt-0.5">Target: {th.target_journal || 'Unassigned'}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700">
                  {th.status}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'discussions' && (
        <div className="bg-white border border-[#E5E5DF] rounded-2xl p-5 shadow-xs space-y-4">
          <form onSubmit={handlePostComment} className="flex gap-2">
            <input
              type="text"
              placeholder="Add project discussion comment or review note..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 px-3.5 py-2 bg-[#FAFAF8] border border-[#E5E5DF] rounded-xl text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#0F172A] text-white rounded-xl text-xs font-bold"
            >
              Post Note
            </button>
          </form>

          <div className="space-y-3 pt-3">
            {discussions.map((d) => (
              <div key={d.id} className="p-3 bg-[#FAFAF8] rounded-xl border border-[#E5E5DF] text-xs">
                <p className="text-[#171717]">{d.content}</p>
                <span className="text-[10px] text-[#737373] mt-1 block">
                  {new Date(d.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E5E5DF] max-w-sm w-full p-5 shadow-xl">
            <h3 className="text-sm font-bold text-[#171717] mb-3">Create Kanban Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-[#525252] block mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sequence cDNA libraries"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#E5E5DF] rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#525252] block mb-1">Priority</label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#E5E5DF] rounded-lg text-xs"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-3 py-1.5 text-xs text-[#737373]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-[#0F172A] text-white rounded-lg text-xs font-semibold"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
