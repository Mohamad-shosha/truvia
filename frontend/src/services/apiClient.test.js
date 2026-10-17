import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import { http, refreshClient, setSessionExpiredHandler } from './apiClient';
import { authService } from './authService';
import { tokenStore } from './tokenStore';

/** Builds an axios adapter from a handler(config) => {status, data}. */
function adapter(handler) {
  return async (config) => {
    const { status, data, networkError } = await handler(config);
    if (networkError) throw new axios.AxiosError('Network Error', 'ERR_NETWORK', config);
    const response = { status, data, headers: {}, config, statusText: String(status) };
    if (status >= 400) {
      throw new axios.AxiosError('failed', 'ERR_BAD_REQUEST', config, null, response);
    }
    return response;
  };
}

const user = { id: 1, fullName: 'Jane', email: 'jane@example.com', roles: ['ROLE_GRC_ANALYST'] };

describe('api client', () => {
  beforeEach(() => tokenStore.clear());
  afterEach(() => {
    setSessionExpiredHandler(null);
  });

  it('attaches the in-memory bearer token', async () => {
    tokenStore.set('abc');
    let seen;
    http.defaults.adapter = adapter((c) => {
      seen = c.headers.Authorization;
      return { status: 200, data: user };
    });
    await authService.getMe();
    expect(seen).toBe('Bearer abc');
  });

  it('never persists the access token in web storage', async () => {
    http.defaults.adapter = adapter(() => ({
      status: 200,
      data: { accessToken: 'secret-token', tokenType: 'Bearer', expiresIn: 900, user },
    }));
    await authService.login({ email: 'jane@example.com', password: 'x', rememberMe: true });
    expect(tokenStore.get()).toBe('secret-token');
    expect(JSON.stringify({ ...localStorage })).not.toContain('secret-token');
    expect(JSON.stringify({ ...sessionStorage })).not.toContain('secret-token');
  });

  it('refreshes once on 401 and retries the original request', async () => {
    tokenStore.set('expired');
    const calls = [];
    http.defaults.adapter = adapter((c) => {
      calls.push(c.headers.Authorization);
      return c.headers.Authorization === 'Bearer fresh'
        ? { status: 200, data: user }
        : { status: 401, data: { message: 'no' } };
    });
    refreshClient.defaults.adapter = adapter((c) => {
      expect(c.headers['X-Requested-With']).toBe('XMLHttpRequest');
      return { status: 200, data: { accessToken: 'fresh', user } };
    });

    const me = await authService.getMe();
    expect(me.email).toBe('jane@example.com');
    expect(calls).toEqual(['Bearer expired', 'Bearer fresh']);
  });

  it('shares a single refresh request between concurrent callers', async () => {
    let refreshCount = 0;
    refreshClient.defaults.adapter = adapter(async () => {
      refreshCount += 1;
      await new Promise((r) => setTimeout(r, 10));
      return { status: 200, data: { accessToken: 'fresh', user } };
    });
    await Promise.all([authService.refresh(), authService.refresh(), authService.refresh()]);
    expect(refreshCount).toBe(1);
  });

  it('signals session expiry and rejects when refresh is refused', async () => {
    tokenStore.set('expired');
    const expired = vi.fn();
    setSessionExpiredHandler(expired);
    http.defaults.adapter = adapter(() => ({ status: 401, data: { message: 'no' } }));
    refreshClient.defaults.adapter = adapter(() => ({ status: 401, data: { message: 'Session is no longer valid' } }));

    await expect(authService.getMe()).rejects.toMatchObject({ status: 401 });
    expect(expired).toHaveBeenCalledTimes(1);
    expect(tokenStore.get()).toBeNull();
  });

  it('does not treat a network failure during refresh as session expiry', async () => {
    tokenStore.set('expired');
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
    await expect(authService.register({ fullName: 'a', email: 'b', password: 'c' })).rejects.toMatchObject({
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

  it('logout clears local state and reports whether the server revoked the session', async () => {
    tokenStore.set('abc');
    refreshClient.defaults.adapter = adapter(() => ({ status: 204, data: null }));
    await expect(authService.logout()).resolves.toEqual({ serverRevoked: true });
    expect(tokenStore.get()).toBeNull();

    tokenStore.set('abc');
    refreshClient.defaults.adapter = adapter(() => ({ networkError: true }));
    await expect(authService.logout()).resolves.toEqual({ serverRevoked: false });
    expect(tokenStore.get()).toBeNull();
  });
});
