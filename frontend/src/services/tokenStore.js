/**
 * In-memory access-token holder. The access token is deliberately NOT persisted
 * (no localStorage/sessionStorage): it disappears on reload and is re-obtained through the
 * HttpOnly refresh cookie. Long-lived refresh tokens never touch JavaScript.
 */
let accessToken = null;

export const tokenStore = {
  get: () => accessToken,
  set: (token) => {
    accessToken = token || null;
  },
  clear: () => {
    accessToken = null;
  },
};
