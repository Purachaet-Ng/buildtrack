export const PERMISSIONS = {
  "project:create": ["ADMIN", "PROJECT_MANAGER"],
  "project:update": ["ADMIN", "PROJECT_MANAGER"],
  "project:delete": ["ADMIN"],
  "money:view": ["ADMIN", "PROJECT_MANAGER", "CLIENT"],
  "user:manage": ["ADMIN"],
  "company:manage": ["ADMIN"],
};

export function can(role, action) {
  const allowed = PERMISSIONS[action];
  if (!allowed) return false;
  return role != null && allowed.includes(role);
}
