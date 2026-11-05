import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useLab } from '../context/LabContext';
import { labApi } from '../utils/labApi';
import { TASK_STATUSES, TASK_PRIORITIES } from '../utils/labConstants';
import { 
  CheckSquare, 
  Plus, 
  Clock, 
  MoreVertical, 
  AlertCircle, 
  ChevronRight,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';

export default function LabTasks() {
  const { labId } = useParams();
  const { can } = useLab();

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [loading, setLoading] = useState(true);

  // Create Task Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    project_id: '',
    priority: 'medium',
    status: 'todo',
    due_date: ''
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [pRes, tRes] = await Promise.all([
          labApi.listProjects(labId).catch(() => ({ projects: [] })),
          labApi.listTasks(labId, selectedProjectId || undefined).catch(() => ({ tasks: [] }))
        ]);
        setProjects(pRes.projects || []);
        setTasks(tRes.tasks || []);
        if (pRes.projects?.length > 0 && !taskForm.project_id) {
          setTaskForm(prev => ({ ...prev, project_id: pRes.projects[0].id }));
        }
      } catch (e) {
        toast.error('Failed to load Kanban tasks');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [labId, selectedProjectId]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await labApi.updateTaskStatus(labId, taskId, newStatus);
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      toast.success('Task status updated');
    } catch (e) {
      toast.error('Failed to move task');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;
    try {
      const res = await labApi.createTask(labId, {
        ...taskForm,
        project_id: taskForm.project_id || (projects[0]?.id || '')
      });
      setTasks([res.task, ...tasks]);
      setShowCreateModal(false);
      setTaskForm({
        title: '',
        description: '',
        project_id: projects[0]?.id || '',
        priority: 'medium',
        status: 'todo',
        due_date: ''
      });
      toast.success('Task scheduled on Kanban board');
    } catch (e) {
      toast.error(e.message || 'Failed to create task');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#171717]">Research Kanban Workflow</h2>
          <p className="text-xs text-[#737373] mt-0.5">
            Deliverable tracking, protocol stages, and dependency state machines.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-1.5 bg-white border border-[#E5E5DF] rounded-xl text-xs font-medium text-[#171717] focus:outline-none"
          >
            <option value="">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>

          {can('tasks.create') && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-xs"
            >
              <Plus size={14} />
              <span>New Task</span>
            </button>
          )}
        </div>
      </div>

      {/* 6-Column Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3.5 items-start">
        {TASK_STATUSES.map((statusObj) => {
          const colTasks = tasks.filter(t => (t.status || 'todo') === statusObj.id);

          return (
            <div
              key={statusObj.id}
              className="bg-white border border-[#E5E5DF] rounded-2xl p-3 shadow-xs flex flex-col min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#F4F4F0]">
                <div className="flex items-center gap-1.5">
                  <div 
                    className="w-2.5 h-2.5 rounded-full" 
                    style={{ backgroundColor: statusObj.color }}
                  />
                  <span className="text-xs font-bold text-[#171717]">
                    {statusObj.label}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F4F4F0] text-[#737373]">
                  {colTasks.length}
                </span>
              </div>

              {/* Task Cards */}
              <div className="space-y-2.5 flex-1">
                {colTasks.length === 0 ? (
                  <div className="h-24 border border-dashed border-[#E5E5DF] rounded-xl flex items-center justify-center text-[11px] text-[#A3A3A3]">
                    Empty
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const priorityObj = TASK_PRIORITIES.find(p => p.id === task.priority) || TASK_PRIORITIES[1];
                    const nextStatuses = TASK_STATUSES.filter(s => s.id !== task.status);

                    return (
                      <div
                        key={task.id}
                        className="p-3 bg-[#FAFAF8] hover:bg-white border border-[#E5E5DF] hover:border-[#D4D4CD] rounded-xl shadow-xs transition-all text-xs group"
                      >
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span 
                            className="text-[10px] font-bold uppercase tracking-wider"
                            style={{ color: priorityObj.color }}
                          >
                            {priorityObj.label}
                          </span>

                          {/* Quick Move Dropdown */}
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task.id, e.target.value)}
                            className="text-[10px] bg-transparent text-[#737373] hover:text-[#171717] focus:outline-none cursor-pointer"
                          >
                            <option value={task.status}>Move...</option>
                            {nextStatuses.map(s => (
                              <option key={s.id} value={s.id}>{s.label}</option>
                            ))}
                          </select>
                        </div>

                        <h4 className="font-bold text-[#171717] leading-snug">
                          {task.title}
                        </h4>

                        {task.description && (
                          <p className="text-[11px] text-[#737373] line-clamp-2 mt-1">
                            {task.description}
                          </p>
                        )}

                        {task.due_date && (
                          <div className="flex items-center gap-1 text-[10px] text-[#737373] mt-2">
                            <Clock size={11} />
                            <span>{new Date(task.due_date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E5E5DF] max-w-md w-full p-6 shadow-xl">
            <h3 className="text-base font-bold text-[#171717] mb-4">Create Kanban Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-[#525252] block mb-1">Project</label>
                <select
                  required
                  value={taskForm.project_id}
                  onChange={(e) => setTaskForm({ ...taskForm, project_id: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5DF] rounded-lg text-xs"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#525252] block mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Perform CRISPR Cas9 knockout assay"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5DF] rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#525252] block mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Specific instructions, reagents, or protocol references..."
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5DF] rounded-lg text-xs resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#525252] block mb-1">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E5E5DF] rounded-lg text-xs"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#525252] block mb-1">Due Date</label>
                  <input
                    type="date"
                    value={taskForm.due_date}
                    onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E5E5DF] rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs text-[#737373] hover:text-[#171717]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0F172A] text-white rounded-xl text-xs font-bold shadow-xs"
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
