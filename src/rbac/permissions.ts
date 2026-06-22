import { z } from 'zod';

/**
 * RBAC vocabulary (G1) — the single source of truth for OpsFlow's permission model.
 * Resources × actions are the vocabulary; the DB (roles / permissions / role_permissions
 * in @opsflow/platform) is the runtime store, seeded from DEFAULT_ROLE_GRANTS and
 * customizable per tenant. The orchestrator turn-owner + HTTP layer both authorize against
 * this vocabulary. Roles themselves live in `ROLES` (enums.ts).
 */

// Resources a permission can apply to. '*' (in a grant) means "any resource".
export const RESOURCES = [
  'ticket',
  'kb',
  'clients',
  'integrations',
  'settings',
  'users',
  'billing',
  'analytics',
  'ai', // operational control of the AI pipeline (halt/resume)
  'approval', // HITL approval decisions (G2)
  'agent', // execute a specific agent (resourceId = agent name)
  'tenant',
] as const;
export const ResourceEnum = z.enum(RESOURCES);
export type Resource = z.infer<typeof ResourceEnum>;

// Actions. '*' (in a grant) means "any action".
export const ACTIONS = ['read', 'write', 'manage', 'execute', 'halt', 'decide', 'delete'] as const;
export const ActionEnum = z.enum(ACTIONS);
export type Action = z.infer<typeof ActionEnum>;

/** A single permission grant: a (resource, action) pair, optionally scoped to one instance. */
export interface PermissionGrant {
  resource: Resource | '*';
  action: Action | '*';
  /** null/undefined = any instance (wildcard); a string scopes the grant to one resource id. */
  resourceId?: string | null;
}

/**
 * The curated catalog of real permissions (seeds the `permissions` collection). Not every
 * resource×action combo is meaningful, so this is explicit rather than a cross-product.
 */
export const PERMISSION_CATALOG: ReadonlyArray<{ resource: Resource; action: Action; description: string }> =
  [
    { resource: 'ticket', action: 'read', description: 'View tickets + conversations' },
    { resource: 'ticket', action: 'write', description: 'Reply to / update tickets' },
    { resource: 'kb', action: 'read', description: 'View knowledge base' },
    { resource: 'kb', action: 'write', description: 'Manage knowledge base content' },
    { resource: 'clients', action: 'read', description: 'View clients/customers' },
    { resource: 'clients', action: 'manage', description: 'Manage clients/customers' },
    { resource: 'integrations', action: 'manage', description: 'Connect/manage integrations' },
    { resource: 'settings', action: 'read', description: 'View tenant settings' },
    { resource: 'settings', action: 'write', description: 'Change tenant settings' },
    { resource: 'users', action: 'manage', description: 'Invite/manage users + roles' },
    { resource: 'billing', action: 'manage', description: 'Manage billing/subscription' },
    { resource: 'analytics', action: 'read', description: 'View analytics/reporting' },
    { resource: 'ai', action: 'halt', description: 'Halt/resume the AI pipeline (kill switch)' },
    { resource: 'approval', action: 'decide', description: 'Approve/reject paused agent actions (HITL)' },
    { resource: 'agent', action: 'execute', description: 'Trigger an agent run' },
    { resource: 'tenant', action: 'manage', description: 'Manage tenant/organization config + onboarding' },
  ];

/**
 * Default role → grants, seeded into role_permissions as platform-wide defaults (tenantId=null).
 * Tenant-specific rows shadow these. `admin` is a superuser wildcard so it keeps every existing
 * capability (backward-compatible with the old requireAdmin gate); `support_agent` gets the
 * ticket-handling subset (matches today's non-admin behavior).
 */
export const DEFAULT_ROLE_GRANTS: Record<string, ReadonlyArray<PermissionGrant>> = {
  admin: [{ resource: '*', action: '*' }],
  support_agent: [
    { resource: 'ticket', action: 'read' },
    { resource: 'ticket', action: 'write' },
    { resource: 'kb', action: 'read' },
    { resource: 'clients', action: 'read' },
    { resource: 'analytics', action: 'read' },
  ],
};

/**
 * Does a set of grants authorize (resource, action[, resourceId])? Wildcard-or-specific:
 * a grant matches when its resource is '*' or equal, its action is '*' or equal, and its
 * resourceId is null (any instance) or equal to the requested instance.
 */
export function grantsAllow(
  grants: ReadonlyArray<PermissionGrant>,
  resource: string,
  action: string,
  resourceId?: string | null,
): boolean {
  return grants.some(
    (g) =>
      (g.resource === '*' || g.resource === resource) &&
      (g.action === '*' || g.action === action) &&
      (g.resourceId == null || g.resourceId === resourceId),
  );
}
