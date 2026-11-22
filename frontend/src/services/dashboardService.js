import { http } from './apiClient';

/** Personal workspace of the signed-in user (any role). */
export async function getMyDashboard() {
  const res = await http.get('/api/dashboard/me');
  return res.data;
}

/** Platform overview (ROLE_ADMIN only). */
export async function getAdminDashboard() {
  const res = await http.get('/api/admin/dashboard');
  return res.data;
}

/** Security team composition (ROLE_CISO or ROLE_ADMIN). */
export async function getTeam() {
  const res = await http.get('/api/dashboard/team');
  return res.data;
}

/** Active sessions of the signed-in user, newest first; `current` marks this browser. */
export async function listSessions() {
  const res = await http.get('/api/auth/sessions');
  return res.data;
}

/** Signs out one of the user's own sessions. */
export async function revokeSession(sessionId) {
  await http.delete(`/api/auth/sessions/${encodeURIComponent(sessionId)}`);
}

/** Signs out every session except this one. @returns {Promise<number>} number revoked */
export async function revokeOtherSessions() {
  const res = await http.delete('/api/auth/sessions');
  return res.data.revoked;
}
