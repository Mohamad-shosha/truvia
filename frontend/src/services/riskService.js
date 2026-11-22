import { http } from './apiClient';

export const RISK_READ_ROLES = ['ROLE_ADMIN', 'ROLE_CISO', 'ROLE_GRC_ANALYST', 'ROLE_SOC_ANALYST'];
export const RISK_WRITE_ROLES = ['ROLE_CISO', 'ROLE_GRC_ANALYST'];

export async function listRisks() {
  return (await http.get('/api/risks')).data;
}

export async function createRisk(body) {
  return (await http.post('/api/risks', body)).data;
}

export async function updateRisk(id, body) {
  return (await http.put(`/api/risks/${id}`, body)).data;
}

export async function deleteRisk(id) {
  await http.delete(`/api/risks/${id}`);
}

/** Dashboard posture for the last `days` (7, 30 or 90). */
export async function getRiskOverview(days = 30) {
  return (await http.get('/api/risks/overview', { params: { days } })).data;
}

export async function getRecentActivity(limit = 6) {
  return (await http.get('/api/activity', { params: { limit } })).data;
}

/** Downloads the register as CSV through the authenticated client. */
export async function downloadRiskCsv() {
  const res = await http.get('/api/risks/export', { responseType: 'blob' });
  const match = /filename="([^"]+)"/.exec(res.headers?.['content-disposition'] || '');
  const url = URL.createObjectURL(res.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = match ? match[1] : 'truvia-risk-register.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
