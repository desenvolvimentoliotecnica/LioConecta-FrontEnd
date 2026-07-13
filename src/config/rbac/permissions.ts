/** Canonical RBAC permission keys — keep aligned with backend PermissionCatalog. */
export const PERMISSIONS = {
  portal: {
    access: "portal.access",
  },
  admin: {
    settingsManage: "admin.settings.manage",
    workersManage: "admin.workers.manage",
    emailManage: "admin.email.manage",
    totvsManage: "admin.totvs.manage",
  },
  rbac: {
    rolesManage: "rbac.roles.manage",
    assignmentsManage: "rbac.assignments.manage",
    testUsersManage: "rbac.test_users.manage",
  },
  analytics: {
    view: "analytics.view",
  },
  loop: {
    access: "loop.access",
  },
  pulse: {
    access: "pulse.access",
  },
  compass: {
    access: "compass.access",
  },
  unilio: {
    access: "unilio.access",
  },
  benefits: {
    manage: "benefits.manage",
  },
  transport: {
    read: "transport.read",
    manage: "transport.manage",
  },
  reimbursement: {
    read: "reimbursement.read",
    manage: "reimbursement.manage",
  },
  travelAdvance: {
    read: "travel_advance.read",
    manage: "travel_advance.manage",
  },
  systems: {
    manage: "systems.manage",
  },
  ramais: {
    manage: "ramais.manage",
  },
  facilities: {
    menuManage: "facilities.menu.manage",
  },
  leave: {
    manage: "leave.manage",
    approve: "leave.approve",
  },
  rhRequests: {
    read: "rh_requests.read",
    manage: "rh_requests.manage",
  },
  payslips: {
    audit: "payslips.audit",
  },
  ponto: {
    request: "ponto.request",
    manage: "ponto.manage",
    approve: "ponto.approve",
  },
  groups: {
    read: "groups.read",
    create: "groups.create",
    approve: "groups.approve",
  },
  comunicados: {
    read: "comunicados.read",
    publishOfficial: "comunicados.publish.official",
    publishDepartmental: "comunicados.publish.departmental",
    publishUrgent: "comunicados.publish.urgent",
    manage: "comunicados.manage",
  },
  wiki: {
    read: "wiki.read",
    manage: "wiki.manage",
  },
  feed: {
    manage: "feed.manage",
  },
  news: {
    manage: "news.manage",
  },
  mood: {
    analytics: "mood.analytics",
  },
  feedback: {
    submit: "feedback.submit",
    triage: "feedback.triage",
  },
} as const;

export const RBAC_ADMIN_PERMISSIONS = [
  PERMISSIONS.rbac.rolesManage,
  PERMISSIONS.rbac.assignmentsManage,
  PERMISSIONS.rbac.testUsersManage,
] as const;

/** @deprecated Legacy app_settings keys — access is RBAC-managed via Controle de acesso. */
export const DEPRECATED_ACCESS_SETTING_KEYS = [
  "benefits.allowed_roles",
  "benefits.allowed_emails",
  "systems.allowed_roles",
  "systems.allowed_emails",
  "ramais.allowed_roles",
  "ramais.allowed_emails",
  "facilities.menu.allowed_roles",
  "facilities.menu.allowed_emails",
  "loop.allowed_roles",
  "loop.allowed_emails",
  "compass.allowed_roles",
  "compass.allowed_emails",
  "unilio.allowed_roles",
  "unilio.allowed_emails",
  "leave.notify_emails",
  "leave.notify_roles",
  "ponto.notify_emails",
  "ponto.notify_roles",
] as const;
