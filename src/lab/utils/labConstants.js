/**
 * Lab Domain Constants
 * Academic taxonomy, research stages, roles, and status mappings.
 */

export const RESEARCH_STAGES = [
  { id: 'idea', label: 'Idea & Conceptualization', color: '#6366F1', bg: '#EEF2FF', step: 1 },
  { id: 'literature_review', label: 'Literature Review', color: '#3B82F6', bg: '#EFF6FF', step: 2 },
  { id: 'hypothesis', label: 'Hypothesis Formulation', color: '#06B6D4', bg: '#ECFEFF', step: 3 },
  { id: 'methodology', label: 'Methodology & Protocol', color: '#10B981', bg: '#ECFDF5', step: 4 },
  { id: 'ethics_approval', label: 'Ethics / IRB Approval', color: '#84CC16', bg: '#F7FEE7', step: 5 },
  { id: 'data_collection', label: 'Data Collection', color: '#EAB308', bg: '#FEFCE8', step: 6 },
  { id: 'analysis', label: 'Analysis & Computation', color: '#F97316', bg: '#FFF7ED', step: 7 },
  { id: 'drafting', label: 'Manuscript Drafting', color: '#EC4899', bg: '#FDF2F8', step: 8 },
  { id: 'peer_review', label: 'Internal Peer Review', color: '#A855F7', bg: '#FAF5FF', step: 9 },
  { id: 'revision', label: 'Revision & Response', color: '#F43F5E', bg: '#FFF1F2', step: 10 },
  { id: 'published', label: 'Published / Landed', color: '#059669', bg: '#ECFDF5', step: 11 },
  { id: 'archived', label: 'Archived Dataset', color: '#64748B', bg: '#F8FAFC', step: 12 },
];

export const LAB_ROLES = [
  { id: 'pi', label: 'Principal Investigator (PI)', badgeColor: 'bg-purple-100 text-purple-800 border-purple-200' },
  { id: 'professor', label: 'Professor / Advisor', badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { id: 'copi', label: 'Co-PI', badgeColor: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'postdoc', label: 'Postdoctoral Fellow', badgeColor: 'bg-teal-100 text-teal-800 border-teal-200' },
  { id: 'phd_student', label: 'PhD Researcher', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { id: 'masters_student', label: 'Master’s Student', badgeColor: 'bg-amber-100 text-amber-800 border-amber-200' },
  { id: 'ra', label: 'Research Assistant', badgeColor: 'bg-orange-100 text-orange-800 border-orange-200' },
  { id: 'observer', label: 'Lab Observer / Guest', badgeColor: 'bg-slate-100 text-slate-800 border-slate-200' },
];

export const PROJECT_ROLES = [
  { id: 'lead', label: 'Project Lead', color: '#4F46E5' },
  { id: 'contributor', label: 'Contributor', color: '#059669' },
  { id: 'reviewer', label: 'Reviewer / Auditor', color: '#D97706' },
  { id: 'observer', label: 'Observer', color: '#64748B' },
];

export const CREDIT_TAXONOMY = [
  { id: 'conceptualization', label: 'Conceptualization', desc: 'Ideas; formulation of overarching research goals and aims.' },
  { id: 'data_curation', label: 'Data Curation', desc: 'Management activities to annotate, clean, and maintain data.' },
  { id: 'formal_analysis', label: 'Formal Analysis', desc: 'Statistical, mathematical, or computational techniques.' },
  { id: 'funding_acquisition', label: 'Funding Acquisition', desc: 'Financial support for the project.' },
  { id: 'investigation', label: 'Investigation', desc: 'Conducting research and data/evidence collection.' },
  { id: 'methodology', label: 'Methodology', desc: 'Development or design of methodology; creation of models.' },
  { id: 'project_administration', label: 'Project Administration', desc: 'Management and coordination for research execution.' },
  { id: 'resources', label: 'Resources', desc: 'Provision of study materials, reagents, patients, laboratory samples.' },
  { id: 'software', label: 'Software', desc: 'Programming, software development; designing computer programs.' },
  { id: 'supervision', label: 'Supervision', desc: 'Oversight and leadership responsibility for research activity.' },
  { id: 'validation', label: 'Validation', desc: 'Verification of results/experiments and research outputs.' },
  { id: 'visualization', label: 'Visualization', desc: 'Preparation and presentation of published work / data figures.' },
  { id: 'writing_original', label: 'Writing – Original Draft', desc: 'Preparation of the initial published draft.' },
  { id: 'writing_review_editing', label: 'Writing – Review & Editing', desc: 'Critical review, commentary, or revision.' },
];

export const TASK_STATUSES = [
  { id: 'backlog', label: 'Backlog', color: '#64748B', bg: '#F8FAFC' },
  { id: 'todo', label: 'To Do', color: '#3B82F6', bg: '#EFF6FF' },
  { id: 'in_progress', label: 'In Progress', color: '#EAB308', bg: '#FEFCE8' },
  { id: 'review', label: 'Review', color: '#A855F7', bg: '#FAF5FF' },
  { id: 'done', label: 'Completed', color: '#059669', bg: '#ECFDF5' },
  { id: 'blocked', label: 'Blocked', color: '#DC2626', bg: '#FEF2F2' },
];

export const TASK_PRIORITIES = [
  { id: 'low', label: 'Low', color: '#64748B' },
  { id: 'medium', label: 'Medium', color: '#3B82F6' },
  { id: 'high', label: 'High', color: '#F97316' },
  { id: 'urgent', label: 'Urgent', color: '#DC2626' },
];
