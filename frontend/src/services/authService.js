import { http, refreshSession, revokeServerSession } from './apiClient';
import { tokenStore } from './tokenStore';
import { normalizeError } from './errors';

export const authService = {
  /** Creates an account. Does not sign the user in. */
  async register({ fullName, email, password }) {
    const res = await http.post('/api/auth/register', { fullName, email, password }, { skipAuth: true });
    return res.data;
  },

  /** @returns {Promise<{accessToken, tokenType, expiresIn, user}>} */
  async login({ email, password, rememberMe }) {
    const res = await http.post(
      '/api/auth/login',
      { email, password, rememberMe: Boolean(rememberMe) },
      { skipAuth: true },
    );
    tokenStore.set(res.data.accessToken);
    return res.data;
  },

  async getMe() {
    const res = await http.get('/api/auth/me');
    return res.data;
  },

  /** Exchanges the HttpOnly refresh cookie for a new access token (single-flight). */
  refresh: refreshSession,

  /**
   * Clears local state and asks the server to revoke the refresh-token family.
   * @returns {Promise<{serverRevoked: boolean}>} serverRevoked=false when the server could not be reached.
   */
  async logout() {
    tokenStore.clear();
    try {
      await revokeServerSession();
      return { serverRevoked: true };
    } catch (err) {
      normalizeError(err);
      return { serverRevoked: false };
    }
  },
};
