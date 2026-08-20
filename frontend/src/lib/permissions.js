export const PERMISSIONS = {
  "project:create": ["ADMIN", "PROJECT_MANAGER"],
  "project:update": ["ADMIN", "PROJECT_MANAGER"],
  "project:delete": ["ADMIN"],
  "money:view": ["ADMIN", "PROJECT_MANAGER", "CLIENT"],
  "user:manage": ["ADMIN"],
  // Reading the company list and managing it are different rights: GET
  // /companies is ADMIN + PM, everything that writes is ADMIN only. STAFF and
  // CLIENT get a 403 from the list endpoint, so anything that would fetch it
  // has to check `company:view` first rather than fire and swallow the error.
  "company:view": ["ADMIN", "PROJECT_MANAGER"],
  "company:manage": ["ADMIN"],
};

export function can(role, action) {
  const allowed = PERMISSIONS[action];
  if (!allowed) return false;
  return role != null && allowed.includes(role);
}
