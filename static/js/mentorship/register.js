import { apiFetch, saveSession, getSession } from './api.js';
import { describeAuthError, showFormMessage } from './errors.js';
import { showToast, showBlockingMessage } from './toast.js';

const PENDING_KEY = 'mentorship.pendingVerification';

function startVerificationPolling(uid, credentials, dismissWaiting, dashboardUrl) {
  let attempts = 0;
  let inProgress = false;

  async function check() {
    if (inProgress) return;
    inProgress = true;

    if (++attempts > 100) {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
      inProgress = false;
      return;
    }

    const { ok, data } = await apiFetch(`/auth/verify-status/${uid}`)
      .catch(() => ({ ok: false, data: {} }));

    if (!ok || !data.verified) {
      inProgress = false;
      return;
    }

    clearInterval(interval);
    document.removeEventListener('visibilitychange', onVisible);
    sessionStorage.removeItem(PENDING_KEY);

    if (!credentials) {
      dismissWaiting();
      showToast('האימייל אומת בהצלחה! ניתן להתחבר כעת.', () => {
        window.location.href = '/he/mentorship/login/';
      });
      return;
    }

    try {
      let loginResult = await apiFetch('/auth/login', { method: 'POST', body: credentials });
      if (!loginResult.ok && loginResult.data?.error?.code === 'EMAIL_NOT_VERIFIED') {
        await new Promise(r => setTimeout(r, 2000));
        loginResult = await apiFetch('/auth/login', { method: 'POST', body: credentials });
      }

      credentials.email = '';
      credentials.password = '';
      dismissWaiting();

      if (loginResult.ok) {
        saveSession(loginResult.data);
        showToast('האימייל אומת בהצלחה!', () => { window.location.href = dashboardUrl; });
      } else {
        showToast('האימייל אומת! ניתן להתחבר כעת.', () => {
          window.location.href = '/he/mentorship/login/';
        });
      }
    } catch {
      credentials.email = '';
      credentials.password = '';
      dismissWaiting();
      showToast('האימייל אומת! ניתן להתחבר כעת.', () => {
        window.location.href = '/he/mentorship/login/';
      });
    }
  }

  const interval = setInterval(check, 3000);

  function onVisible() {
    if (document.visibilityState === 'visible') check();
  }
  document.addEventListener('visibilitychange', onVisible);
}

// Already logged in — redirect immediately
const existing = getSession();
if (existing) {
  document.getElementById('register-choice').hidden = true;
  window.location.href = existing.role === 'mentor'
    ? '/he/mentorship/mentor-dashboard/'
    : '/he/mentorship/mentee-dashboard/';
}

// Recover from same-tab navigation: if the user clicked the email link in this
// tab, the page reloaded but sessionStorage still holds the pending uid.
// Skip if already logged in (redirect above will handle it).
if (!existing) {
  (async function recoverPendingVerification() {
    const uid = sessionStorage.getItem(PENDING_KEY);
    if (!uid) return;

    const { ok, data } = await apiFetch(`/auth/verify-status/${uid}`)
      .catch(() => ({ ok: false, data: {} }));

    if (ok && data.verified) {
      sessionStorage.removeItem(PENDING_KEY);
      showToast('האימייל אומת בהצלחה! ניתן להתחבר כעת.', () => {
        window.location.href = '/he/mentorship/login/';
      });
      return;
    }

    const dismiss = showBlockingMessage('ממתינים לאימות כתובת האימייל — אנא לחץ/י על הקישור שנשלח למייל שלך.');
    startVerificationPolling(uid, null, dismiss, null);
  })();
}

function splitList(value) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

// ─── Unified register handler ─────────────────────────────────────────────────

async function handleRegisterSubmit(event, config) {
  event.preventDefault();
  const form = event.target;
  const messageEl = document.getElementById(config.messageElId);
  const submitBtn = form.querySelector('button[type="submit"]');

  const fullName = form.fullName.value.trim();
  const email = form.email.value.trim();
  const password = form.password.value;

  if (!config.validate(form, messageEl)) return;

  // Discard any stale pending state from a previous registration attempt
  sessionStorage.removeItem(PENDING_KEY);

  submitBtn.disabled = true;
  try {
    const { ok, data } = await apiFetch('/auth/register', {
      method: 'POST',
      body: config.buildBody(form, fullName, email, password),
    });

    if (!ok) {
      showFormMessage(messageEl, describeAuthError(data.error), true);
      return;
    }

    if (data.idToken) {
      saveSession(data);
      form.closest('.card')?.closest('[id$="-wrapper"]')?.setAttribute('hidden', '');
      showToast('החשבון נוצר בהצלחה', () => {
        window.location.href = config.dashboardUrl;
      });
    } else {
      sessionStorage.setItem(PENDING_KEY, data.uid);
      const credentials = { email, password };
      form.reset();
      const dismissWaiting = showBlockingMessage(`נרשמת בהצלחה, ${fullName}! נשלח אליך אימייל אימות — אנא לחץ/י על הקישור שבמייל.`);
      startVerificationPolling(data.uid, credentials, dismissWaiting, config.dashboardUrl);
    }
  } catch (err) {
    showFormMessage(messageEl, describeAuthError(err), true);
  } finally {
    submitBtn.disabled = false;
  }
}

const menteeConfig = {
  messageElId: 'mentee-message',
  dashboardUrl: '/he/mentorship/mentee-dashboard/',
  validate(form, messageEl) {
    if (splitList(form.interests.value).length === 0) {
      showFormMessage(messageEl, 'יש למלא תחומי עניין (שדה חובה).', true);
      return false;
    }
    return true;
  },
  buildBody(form, fullName, email, password) {
    return {
      role: 'mentee',
      fullName,
      email,
      password,
      experienceLevel: form.experienceLevel.value || null,
      interests: splitList(form.interests.value),
      goals: form.goals.value.trim() || null,
    };
  },
};

const mentorConfig = {
  messageElId: 'mentor-message',
  dashboardUrl: '/he/mentorship/mentor-dashboard/',
  validate(form, messageEl) {
    if (splitList(form.expertise.value).length === 0) {
      showFormMessage(messageEl, 'יש למלא תחומי התמחות (שדה חובה).', true);
      return false;
    }
    if (!form.linkedIn.value.trim()) {
      showFormMessage(messageEl, 'יש למלא קישור לפרופיל LinkedIn (שדה חובה).', true);
      return false;
    }
    if (!form.calendlyUrl.value.trim()) {
      showFormMessage(messageEl, 'יש למלא קישור לתיאום פגישה (שדה חובה).', true);
      return false;
    }
    return true;
  },
  buildBody(form, fullName, email, password) {
    const yearsExperience = form.yearsExperience.value;
    return {
      role: 'mentor',
      fullName,
      email,
      password,
      currentRole: form.currentRole.value.trim() || null,
      company: form.company.value.trim() || null,
      expertise: splitList(form.expertise.value),
      yearsExperience: yearsExperience ? Number(yearsExperience) : null,
      availability: form.availability.value,
      linkedIn: form.linkedIn.value.trim(),
      calendlyUrl: form.calendlyUrl.value.trim(),
    };
  },
};

document.getElementById('mentee-register-form')
  .addEventListener('submit', (e) => handleRegisterSubmit(e, menteeConfig));
document.getElementById('mentor-register-form')
  .addEventListener('submit', (e) => handleRegisterSubmit(e, mentorConfig));
