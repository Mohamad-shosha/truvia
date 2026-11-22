import { http } from './apiClient';

/** Calls the ROLE_ADMIN-only RBAC probe. */
export async function adminPing() {
  const res = await http.get('/api/admin/ping');
  return res.data;
}

/** Lists all registered company users (ROLE_ADMIN only). */
export async function adminListUsers() {
  const res = await http.get('/api/admin/users');
  return res.data;
}

/** Creates a company user with an assigned role (ROLE_ADMIN only). */
export async function adminCreateUser({ fullName, email, password, role }) {
  const res = await http.post('/api/admin/users', { fullName, email, password, role });
  return res.data;
}

/** Enables or disables a company user; disabling signs them out everywhere (ROLE_ADMIN only). */
export async function adminSetUserStatus(userId, enabled) {
  const res = await http.patch(`/api/admin/users/${userId}/status`, { enabled });
  return res.data;
}

/** Resets a company user's password (ROLE_ADMIN only). */
export async function adminResetPassword(userId, newPassword) {
  const res = await http.post(`/api/admin/users/${userId}/reset-password`, { newPassword });
  return res.data;
}
