export const API_BASE = window.MENTORSHIP_API_BASE;

if (!API_BASE) {
  console.error('[mentorship] MENTORSHIP_API_BASE is not configured — all API calls will fail');
}

const SESSION_KEY = 'mentorship.session';
const REQUEST_TIMEOUT_MS = 15000;

export function saveSession(session) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getSession() {
  const raw = sessionStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function dashboardUrl(role) {
  return role === 'mentor'
    ? '/he/mentorship/mentor-dashboard/'
    : '/he/mentorship/mentee-dashboard/';
}

export async function apiFetch(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, data };
  } catch (err) {
    if (err.name === 'AbortError') {
      return { ok: false, status: 0, data: { error: { code: 'TIMEOUT' } } };
    }
    return { ok: false, status: 0, data: { error: { code: 'NETWORK_ERROR' } } };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function authedFetch(path, options = {}) {
  const session = getSession();
  if (!session) {
    window.location.href = '/he/mentorship/login/';
    return { ok: false, status: 401, data: {} };
  }

  let result = await apiFetch(path, {
    ...options,
    headers: { Authorization: `Bearer ${session.idToken}`, ...options.headers },
  });

  // Token expired — try to refresh once and retry the original request
  if (result.status === 401 && session.refreshToken) {
    const refreshResult = await apiFetch('/auth/refresh', {
      method: 'POST',
      body: { refreshToken: session.refreshToken },
    });

    if (refreshResult.ok) {
      const updated = {
        ...session,
        idToken: refreshResult.data.idToken,
        refreshToken: refreshResult.data.refreshToken,
      };
      saveSession(updated);
      result = await apiFetch(path, {
        ...options,
        headers: { Authorization: `Bearer ${updated.idToken}`, ...options.headers },
      });
    }
  }

  if (result.status === 401) {
    clearSession();
    window.location.href = '/he/mentorship/login/';
  }

  return result;
}
