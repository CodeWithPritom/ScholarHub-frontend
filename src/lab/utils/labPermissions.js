/**
 * Client-Side 3-Layer Capability Resolver
 * Enables instant optimistic UI rendering for authorized capabilities.
 */

const ROLE_DEFAULT_CAPABILITIES = {
  pi: ['*'], // Wildcard - all capabilities
  professor: [
    'lab.manage',
    'members.invite', 'members.manage', 'members.view',
    'projects.create', 'projects.manage', 'projects.delete', 'projects.view_all',
    'tasks.create', 'tasks.assign', 'tasks.manage', 'tasks.review',
    'files.upload', 'files.manage', 'files.download', 'files.view_versions',
    'thesis.create', 'thesis.review', 'thesis.approve', 'thesis.manage',
    'authors.manage', 'authors.self',
    'discussions.create', 'discussions.moderate',
    'sharing.manage', 'sharing.external',
    'ai.use', 'ai.manage',
    'quota.view', 'quota.manage',
    'billing.view', 'billing.manage',
    'audit.view'
  ],
  copi: [
    'lab.manage',
    'members.invite', 'members.manage', 'members.view',
    'projects.create', 'projects.manage', 'projects.view_all',
    'tasks.create', 'tasks.assign', 'tasks.manage', 'tasks.review',
    'files.upload', 'files.manage', 'files.download', 'files.view_versions',
    'thesis.create', 'thesis.review', 'thesis.approve', 'thesis.manage',
    'authors.manage', 'authors.self',
    'discussions.create', 'discussions.moderate',
    'ai.use', 'ai.manage',
    'quota.view',
    'billing.view',
    'audit.view'
  ],
  postdoc: [
    'members.view',
    'projects.create', 'projects.manage', 'projects.view_all',
    'tasks.create', 'tasks.assign', 'tasks.manage', 'tasks.review',
    'files.upload', 'files.manage', 'files.download', 'files.view_versions',
    'thesis.create', 'thesis.review', 'thesis.manage',
    'authors.manage', 'authors.self',
    'discussions.create',
    'ai.use',
    'quota.view'
  ],
  phd_student: [
    'members.view',
    'projects.create',
    'tasks.create', 'tasks.manage', 'tasks.review',
    'files.upload', 'files.download', 'files.view_versions',
    'thesis.create', 'thesis.manage',
    'authors.self',
    'discussions.create',
    'ai.use',
    'quota.view'
  ],
  masters_student: [
    'members.view',
    'tasks.create',
    'files.upload', 'files.download', 'files.view_versions',
    'thesis.create',
    'authors.self',
    'discussions.create',
    'ai.use',
    'quota.view'
  ],
  ra: [
    'members.view',
    'tasks.create',
    'files.upload', 'files.download',
    'discussions.create',
    'ai.use',
    'quota.view'
  ],
  observer: [
    'members.view',
    'files.download',
    'quota.view'
  ]
};

const PROJECT_ROLE_CAPABILITIES = {
  lead: [
    'projects.manage', 'tasks.create', 'tasks.assign', 'tasks.manage', 'tasks.review',
    'files.upload', 'files.manage', 'files.download', 'files.view_versions',
    'thesis.create', 'thesis.review', 'thesis.manage', 'authors.manage',
    'discussions.create', 'discussions.moderate', 'ai.use'
  ],
  contributor: [
    'tasks.create', 'tasks.manage',
    'files.upload', 'files.download', 'files.view_versions',
    'thesis.create', 'authors.self',
    'discussions.create', 'ai.use'
  ],
  reviewer: [
    'tasks.review',
    'files.download', 'files.view_versions',
    'thesis.review',
    'discussions.create', 'discussions.moderate'
  ],
  observer: [
    'files.download', 'discussions.create'
  ]
};

/**
 * Resolves whether a member possesses a capability.
 */
export function canUser(
  userRole = 'observer',
  customCaps = [],
  deniedCaps = [],
  targetCapability = '',
  projectRole = null,
  projectCustomCaps = []
) {
  if (userRole === 'pi') return true;

  const baseCaps = new Set(ROLE_DEFAULT_CAPABILITIES[userRole] || []);
  if (baseCaps.has('*')) return true;

  // Add layer 2
  customCaps.forEach(c => baseCaps.add(c));
  deniedCaps.forEach(c => baseCaps.delete(c));

  // Add layer 3 (if project scoped)
  if (projectRole && PROJECT_ROLE_CAPABILITIES[projectRole]) {
    PROJECT_ROLE_CAPABILITIES[projectRole].forEach(c => baseCaps.add(c));
  }
  projectCustomCaps.forEach(c => baseCaps.add(c));

  return baseCaps.has(targetCapability);
}
