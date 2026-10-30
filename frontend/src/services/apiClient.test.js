import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { http, notifySessionExpired, refreshClient, setSessionExpiredHandler } from './apiClient';
import { tokenStore } from './tokenStore';
import { authService } from './authService';

function adapter(fn) {
  return async (config) => {
    const res = await fn(config);
    if (res.networkError) {
      const err = new Error('Network Error');
      err.isAxiosError = true;
      err.config = config;
      throw err;
    }
    if (res.status >= 400) {
      const err = new Error(`Request failed with status code ${res.status}`);
      err.isAxiosError = true;
      err.response = { status: res.status, data: res.data || {}, headers: {}, config };
      err.config = config;
      throw err;
    }
    return { status: res.status || 200, data: res.data, headers: res.headers || {}, config };
  };
}

describe('api client', () => {
  beforeEach(() => {
    tokenStore.clear();
    setSessionExpiredHandler(null);
  });

  afterEach(() => {
    delete http.defaults.adapter;
    delete refreshClient.defaults.adapter;
  });

  it('attaches the bearer token from the store', async () => {
    tokenStore.set('jwt-123');
    let capturedHeader = null;
    http.defaults.adapter = adapter((config) => {
      capturedHeader = config.headers.Authorization;
      return { status: 200, data: { ok: true } };
    });

    await http.get('/api/auth/me');
    expect(capturedHeader).toBe('Bearer jwt-123');
  });

  it('transparently refreshes on 401 and retries the original request with the new token', async () => {
    tokenStore.set('expired-jwt');
    let attempts = 0;
    http.defaults.adapter = adapter((config) => {
      attempts += 1;
      if (attempts === 1) {
        return { status: 401, data: { message: 'token expired' } };
      }
      return { status: 200, data: { ok: true, usedToken: config.headers.Authorization } };
    });

    refreshClient.defaults.adapter = adapter(() => ({
      status: 200,
      data: { accessToken: 'brand-new-jwt', user: { id: 1 } },
    }));

    const res = await http.get('/api/auth/me');
    expect(res.data.ok).toBe(true);
    expect(res.data.usedToken).toBe('Bearer brand-new-jwt');
    expect(tokenStore.get()).toBe('brand-new-jwt');
    expect(attempts).toBe(2);
  });

  it('collapses concurrent 401s into a single refresh request', async () => {
    tokenStore.set('expired-jwt');
    let refreshCount = 0;
    refreshClient.defaults.adapter = adapter(async () => {
      refreshCount += 1;
      await new Promise((r) => setTimeout(r, 10));
      return { status: 200, data: { accessToken: 'shared-jwt', user: { id: 1 } } };
    });

    let calls = 0;
    http.defaults.adapter = adapter((config) => {
      calls += 1;
      if (config.headers.Authorization === 'Bearer expired-jwt') {
        return { status: 401, data: {} };
      }
      return { status: 200, data: { id: config.url } };
    });

    const [a, b] = await Promise.all([http.get('/resource/a'), http.get('/resource/b')]);
    expect(a.data.id).toBe('/resource/a');
    expect(b.data.id).toBe('/resource/b');
    expect(refreshCount).toBe(1);
    expect(tokenStore.get()).toBe('shared-jwt');
  });

  it('notifies the session-expired handler and clears token when refresh is rejected', async () => {
    tokenStore.set('expired-jwt');
    const expired = vi.fn();
    setSessionExpiredHandler(expired);

    http.defaults.adapter = adapter(() => ({ status: 401, data: {} }));
    refreshClient.defaults.adapter = adapter(() => ({ status: 401, data: { message: 'revoked' } }));

    await expect(http.get('/api/auth/me')).rejects.toMatchObject({ status: 401 });
    expect(tokenStore.get()).toBeNull();
    expect(expired).toHaveBeenCalledTimes(1);
  });

  it('does NOT trigger session expired when refresh fails because the server is offline', async () => {
    tokenStore.set('still-valid-jwt');
    const expired = vi.fn();
    setSessionExpiredHandler(expired);
    http.defaults.adapter = adapter(() => ({ status: 401, data: {} }));
    refreshClient.defaults.adapter = adapter(() => ({ networkError: true }));

    await expect(authService.getMe()).rejects.toMatchObject({ isNetwork: true });
    expect(expired).not.toHaveBeenCalled();
  });

  it('normalizes server validation errors and never fakes success', async () => {
    http.defaults.adapter = adapter(() => ({
      status: 400,
      data: { message: 'Validation failed', fieldErrors: [{ field: 'email', message: 'Email must be a valid address' }] },
    }));
    await expect(authService.changePassword({ currentPassword: 'a', newPassword: 'b' })).rejects.toMatchObject({
      status: 400,
      message: 'Validation failed',
      fieldErrors: { email: 'Email must be a valid address' },
    });

    http.defaults.adapter = adapter(() => ({ networkError: true }));
    await expect(authService.login({ email: 'a@b.co', password: 'x' })).rejects.toMatchObject({
      isNetwork: true,
      status: 0,
    });
    expect(tokenStore.get()).toBeNull();
  });

  it('does not attempt a refresh when login itself returns 401', async () => {
    let refreshCalled = false;
    http.defaults.adapter = adapter(() => ({ status: 401, data: { message: 'Invalid email or password' } }));
    refreshClient.defaults.adapter = adapter(() => {
      refreshCalled = true;
      return { status: 200, data: {} };
    });

    await expect(authService.login({ email: 'a@b.co', password: 'x' })).rejects.toMatchObject({ status: 401 });
    expect(refreshCalled).toBe(false);
  });

  it('notifies session expiry through notifySessionExpired helper', () => {
    const expired = vi.fn();
    setSessionExpiredHandler(expired);
    notifySessionExpired();
    expect(expired).toHaveBeenCalledTimes(1);
  });
});
