/**
 * Dedicated API Client for Custom Research Lab Portal
 * Interacts with /api/lab/* endpoints with automatic token attachment.
 */

import { getBaseUrl } from '../../utils/api';
import { supabase } from '../../supabaseClient';

async function getAuthHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
      headers['X-User-Id'] = session.user.id;
      if (session.user.email) {
        headers['X-User-Email'] = session.user.email;
      }
    }
  } catch (e) {
    // Ignore error in public views
  }
  return headers;
}

async function request(endpoint, options = {}) {
  const baseUrl = getBaseUrl();
  const headers = await getAuthHeaders();
  const res = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {})
    }
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || data.message || `Request failed with status ${res.status}`);
  }
  return data;
}

export const labApi = {
  // Organizations
  createLab: (payload) => request('/api/lab/create', { method: 'POST', body: JSON.stringify(payload) }),
  getUserLabs: (userId) => request(`/api/lab/user-labs${userId ? `?user_id=${userId}` : ''}`),
  getLab: (labId) => request(`/api/lab/${labId}`),
  updateSettings: (labId, payload) => request(`/api/lab/${labId}/settings`, { method: 'PATCH', body: JSON.stringify(payload) }),

  // Members & Invites
  listMembers: (labId) => request(`/api/lab/${labId}/members`),
  listInvitations: (labId) => request(`/api/lab/${labId}/invitations`),
  inviteMember: (labId, payload) => request(`/api/lab/${labId}/invite`, { method: 'POST', body: JSON.stringify(payload) }),
  revokeInvitation: (labId, invitationId) => request(`/api/lab/${labId}/invitations/${invitationId}`, { method: 'DELETE' }),
  acceptInvitation: (payload) => request('/api/lab/invitations/accept', { method: 'POST', body: JSON.stringify(payload) }),
  updateMemberRole: (labId, userId, payload) => request(`/api/lab/${labId}/members/${userId}/role`, { method: 'PATCH', body: JSON.stringify(payload) }),

  // Projects
  listProjects: (labId) => request(`/api/lab/${labId}/projects`),
  createProject: (labId, payload) => request(`/api/lab/${labId}/projects`, { method: 'POST', body: JSON.stringify(payload) }),
  getProject: (labId, projectId) => request(`/api/lab/${labId}/projects/${projectId}`),
  updateProjectStage: (labId, projectId, stage) => request(`/api/lab/${labId}/projects/${projectId}/stage`, { method: 'PATCH', body: JSON.stringify({ stage }) }),

  // Tasks
  listTasks: (labId, projectId) => request(`/api/lab/${labId}/tasks${projectId ? `?project_id=${projectId}` : ''}`),
  createTask: (labId, payload) => request(`/api/lab/${labId}/tasks`, { method: 'POST', body: JSON.stringify(payload) }),
  updateTaskStatus: (labId, taskId, status) => request(`/api/lab/${labId}/tasks/${taskId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Discussions
  listDiscussions: (labId, entityType, entityId) => request(`/api/lab/${labId}/discussions?entity_type=${entityType}&entity_id=${entityId}`),
  createDiscussion: (labId, payload) => request(`/api/lab/${labId}/discussions`, { method: 'POST', body: JSON.stringify(payload) }),

  // Manuscripts & CRediT Authorship
  listThesis: (labId, projectId) => request(`/api/lab/${labId}/thesis${projectId ? `?project_id=${projectId}` : ''}`),
  createThesis: (labId, payload) => request(`/api/lab/${labId}/thesis`, { method: 'POST', body: JSON.stringify(payload) }),
  listThesisAuthors: (labId, thesisId) => request(`/api/lab/${labId}/thesis/${thesisId}/authors`),
  setThesisAuthor: (labId, thesisId, payload) => request(`/api/lab/${labId}/thesis/${thesisId}/authors`, { method: 'POST', body: JSON.stringify(payload) }),

  // AI Gateway & Keys
  listAIProviders: (labId) => request(`/api/lab/${labId}/ai/providers`),
  addAIProvider: (labId, payload) => request(`/api/lab/${labId}/ai/providers`, { method: 'POST', body: JSON.stringify(payload) }),
  deleteAIProvider: (labId, providerId) => request(`/api/lab/${labId}/ai/providers/${providerId}`, { method: 'DELETE' }),
  testAIConnection: (labId, payload) => request(`/api/lab/${labId}/ai/test-connection`, { method: 'POST', body: JSON.stringify(payload) }),
  chatAI: (labId, payload) => request(`/api/lab/${labId}/ai/chat`, { method: 'POST', body: JSON.stringify(payload) }),

  // Quota & Activity
  getQuota: (labId) => request(`/api/lab/${labId}/quota`),
  getActivity: (labId, limit = 50) => request(`/api/lab/${labId}/activity?limit=${limit}`),

  // Versioned Research Files & Artifacts
  listFiles: (labId, projectId, parentFolderId) => {
    let url = `/api/lab/${labId}/files`;
    const params = [];
    if (projectId) params.push(`project_id=${projectId}`);
    if (parentFolderId) params.push(`parent_folder_id=${parentFolderId}`);
    if (params.length) url += `?${params.join('&')}`;
    return request(url);
  },
  createFile: (labId, payload) => request(`/api/lab/${labId}/files`, { method: 'POST', body: JSON.stringify(payload) }),
  deleteFile: (labId, fileId) => request(`/api/lab/${labId}/files/${fileId}`, { method: 'DELETE' }),
};
