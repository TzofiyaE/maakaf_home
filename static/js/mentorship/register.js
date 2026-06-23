import { apiFetch, saveSession, getSession } from './api.js';
import { describeAuthError, showFormMessage } from './errors.js';
import { showToast, showBlockingMessage } from './toast.js';

const PENDING_KEY = 'mentorship.pendingVerification';

function startVerificationPolling(uid, credentials, dismissWaiting, dashboardUrl) {
  let attempts = 0;

  async function check() {
    if (++attempts > 100) {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
      return;
    }

    const { ok, data } = await apiFetch(`/auth/verify-status/${uid}`)
      .catch(() => ({ ok: false, data: {} }));
    if (!ok || !data.verified) return;

    clearInterval(interval);
    document.removeEventListener('visibilitychange', onVisible);
    sessionStorage.removeItem(PENDING_KEY);

    // No credentials means the page reloaded and we lost them — redirect to login
    if (!credentials) {
      dismissWaiting();
      showToast('האימייל אומת בהצלחה! ניתן להתחבר כעת.', () => {
        window.location.href = '/he/mentorship/login/';
      });
      return;
    }

    // With credentials: attempt auto-login, retry once if Firebase hasn't
    // fully propagated the emailVerified state yet
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

  // Trigger an immediate check when the user returns to this tab
  // (e.g. after clicking the email link in a new tab)
  function onVisible() {
    if (document.visibilityState === 'visible') check();
  }
  document.addEventListener('visibilitychange', onVisible);
}

// On page load: recover from a same-tab navigation (user clicked the email link
// in this tab, page reloaded, sessionStorage still holds the pending uid)
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

  // Not yet verified — restore the blocking overlay and resume polling
  const dismiss = showBlockingMessage('ממתינים לאימות כתובת האימייל — אנא לחץ/י על הקישור שנשלח למייל שלך.');
  startVerificationPolling(uid, null, dismiss, null);
})();

// Already logged in — redirect immediately
const existing = getSession();
if (existing) {
  document.getElementById('register-choice').hidden = true;
  window.location.href = existing.role === 'mentor'
    ? '/he/mentorship/mentor-dashboard/'
    : '/he/mentorship/mentee-dashboard/';
}

function splitList(value) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

async function handleMenteeSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const messageEl = document.getElementById('mentee-message');
  const submitBtn = form.querySelector('button[type="submit"]');

  const fullName = form.fullName.value.trim();
  const email = form.email.value.trim();
  const password = form.password.value;
  const experienceLevel = form.experienceLevel.value;
  const interests = splitList(form.interests.value);
  const goals = form.goals.value.trim();

  if (interests.length === 0) {
    showFormMessage(messageEl, 'יש למלא תחומי עניין (שדה חובה).', true);
    return;
  }

  submitBtn.disabled = true;
  try {
    const { ok, data } = await apiFetch('/auth/register', {
      method: 'POST',
      body: {
        role: 'mentee',
        fullName,
        email,
        password,
        experienceLevel: experienceLevel || null,
        interests,
        goals: goals || null,
      },
    });

    if (!ok) {
      showFormMessage(messageEl, describeAuthError(data.error), true);
      return;
    }

    if (data.idToken) {
      saveSession(data);
      form.closest('.card')?.closest('[id$="-wrapper"]')?.setAttribute('hidden', '');
      showToast('החשבון נוצר בהצלחה', () => {
        window.location.href = '/he/mentorship/mentee-dashboard/';
      });
    } else {
      sessionStorage.setItem(PENDING_KEY, data.uid);
      const credentials = { email, password };
      form.reset();
      const dismissWaiting = showBlockingMessage(`נרשמת בהצלחה, ${fullName}! נשלח אליך אימייל אימות — אנא לחץ/י על הקישור שבמייל.`);
      startVerificationPolling(data.uid, credentials, dismissWaiting, '/he/mentorship/mentee-dashboard/');
    }
  } catch (err) {
    showFormMessage(messageEl, describeAuthError(err), true);
  } finally {
    submitBtn.disabled = false;
  }
}

async function handleMentorSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const messageEl = document.getElementById('mentor-message');
  const submitBtn = form.querySelector('button[type="submit"]');

  const fullName = form.fullName.value.trim();
  const email = form.email.value.trim();
  const password = form.password.value;
  const currentRole = form.currentRole.value.trim();
  const company = form.company.value.trim();
  const expertise = splitList(form.expertise.value);
  const yearsExperience = form.yearsExperience.value;
  const availability = form.availability.value;
  const linkedIn = form.linkedIn.value.trim();
  const calendlyUrl = form.calendlyUrl.value.trim();

  if (expertise.length === 0) {
    showFormMessage(messageEl, 'יש למלא תחומי התמחות (שדה חובה).', true);
    return;
  }
  if (!linkedIn) {
    showFormMessage(messageEl, 'יש למלא קישור לפרופיל LinkedIn (שדה חובה).', true);
    return;
  }
  if (!calendlyUrl) {
    showFormMessage(messageEl, 'יש למלא קישור לתיאום פגישה (שדה חובה).', true);
    return;
  }

  submitBtn.disabled = true;
  try {
    const { ok, data } = await apiFetch('/auth/register', {
      method: 'POST',
      body: {
        role: 'mentor',
        fullName,
        email,
        password,
        currentRole: currentRole || null,
        company: company || null,
        expertise,
        yearsExperience: yearsExperience ? Number(yearsExperience) : null,
        availability,
        linkedIn,
        calendlyUrl,
      },
    });

    if (!ok) {
      showFormMessage(messageEl, describeAuthError(data.error), true);
      return;
    }

    if (data.idToken) {
      saveSession(data);
      form.closest('.card')?.closest('[id$="-wrapper"]')?.setAttribute('hidden', '');
      showToast('החשבון נוצר בהצלחה', () => {
        window.location.href = '/he/mentorship/mentor-dashboard/';
      });
    } else {
      sessionStorage.setItem(PENDING_KEY, data.uid);
      const credentials = { email, password };
      form.reset();
      const dismissWaiting = showBlockingMessage(`נרשמת בהצלחה, ${fullName}! נשלח אליך אימייל אימות — אנא לחץ/י על הקישור שבמייל.`);
      startVerificationPolling(data.uid, credentials, dismissWaiting, '/he/mentorship/mentor-dashboard/');
    }
  } catch (err) {
    showFormMessage(messageEl, describeAuthError(err), true);
  } finally {
    submitBtn.disabled = false;
  }
}

document.getElementById('mentee-register-form').addEventListener('submit', handleMenteeSubmit);
document.getElementById('mentor-register-form').addEventListener('submit', handleMentorSubmit);
