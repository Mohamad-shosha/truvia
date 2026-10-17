import { http } from './apiClient';

/** Calls the ROLE_ADMIN-only RBAC probe. The backend, not the UI, decides the outcome. */
export async function adminPing() {
  const res = await http.get('/api/admin/ping');
  return res.data;
}
