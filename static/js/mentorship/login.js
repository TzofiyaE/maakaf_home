import { apiFetch, saveSession, getSession, dashboardUrl } from './api.js';
import { describeAuthError, showFormMessage } from './errors.js';
import { showToast } from './toast.js';

const wrapper = document.getElementById('login-form-wrapper');
const form = document.getElementById('login-form');
const messageEl = document.getElementById('login-message');
const forgotWrapper = document.getElementById('forgot-password-form-wrapper');
const forgotForm = document.getElementById('forgot-password-form');
const forgotMessageEl = document.getElementById('forgot-password-message');
const verifyWrapper = document.getElementById('verify-email-wrapper');
const verifyEmailDisplay = document.getElementById('verify-email-display');
const verifyResendBtn = document.getElementById('verify-resend-btn');
const verifyResendCountdown = document.getElementById('verify-resend-countdown');

// Already logged in — redirect immediately
const existing = getSession();
if (existing) {
  window.location.href = dashboardUrl(existing.role);
}

function showLoginForm() {
  forgotWrapper.classList.add('d-none');
  forgotSent.classList.add('d-none');
  verifyWrapper.classList.add('d-none');
  wrapper.classList.remove('d-none');
  clearInterval(resendTimer);
  stopVerifyPolling();
}

function showForgotForm() {
  wrapper.classList.add('d-none');
  forgotSent.classList.add('d-none');
  forgotWrapper.classList.remove('d-none');
  forgotForm.reset();
  const loginEmail = form.email.value.trim();
  if (loginEmail) document.getElementById('forgot-email-input').value = loginEmail;
  document.getElementById('forgot-email-input').focus();
}

function showConfirmationScreen(email) {
  forgotWrapper.classList.add('d-none');
  resetEmailDisplay.textContent = email;
  forgotSent.classList.remove('d-none');
  startResendCountdown();
}

const forgotSent = document.getElementById('forgot-password-sent');
const resetEmailDisplay = document.getElementById('reset-email-display');
const resendBtn = document.getElementById('resend-btn');
const resendCountdown = document.getElementById('resend-countdown');

let resendTimer = null;

function startResendCountdown() {
  let seconds = 30;
  resendBtn.disabled = true;
  resendCountdown.textContent = `(${seconds}s)`;
  resendCountdown.classList.remove('d-none');
  clearInterval(resendTimer);
  resendTimer = setInterval(() => {
    seconds--;
    resendCountdown.textContent = `(${seconds}s)`;
    if (seconds <= 0) {
      clearInterval(resendTimer);
      resendBtn.disabled = false;
      resendCountdown.classList.add('d-none');
    }
  }, 1000);
}

async function sendResetEmail(email) {
  await apiFetch('/auth/forgot-password', { method: 'POST', body: { email } });
}

document.getElementById('forgot-password-link').addEventListener('click', (e) => {
  e.preventDefault();
  showForgotForm();
});

document.getElementById('back-from-forgot').addEventListener('click', (e) => {
  e.preventDefault();
  showLoginForm();
});
document.getElementById('back-to-login-from-sent').addEventListener('click', (e) => {
  e.preventDefault();
  showLoginForm();
});

resendBtn.addEventListener('click', async () => {
  const email = resetEmailDisplay.textContent;
  resendBtn.disabled = true;
  try {
    await sendResetEmail(email);
  } finally {
    startResendCountdown();
  }
});

forgotForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const submitBtn = forgotForm.querySelector('button[type="submit"]');
  const email = document.getElementById('forgot-email-input').value.trim();
  submitBtn.disabled = true;
  try {
    await sendResetEmail(email);
    showConfirmationScreen(email);
  } catch {
    showFormMessage(forgotMessageEl, 'אירעה שגיאה. נסו שוב מאוחר יותר.', true);
  } finally {
    submitBtn.disabled = false;
  }
});

// ─── Email verification polling ───────────────────────────────────────────────

let verifyResendTimer = null;
let verifyPollInterval = null;
let verifyOnVisible = null;

function stopVerifyPolling() {
  clearInterval(verifyPollInterval);
  verifyPollInterval = null;
  if (verifyOnVisible) {
    document.removeEventListener('visibilitychange', verifyOnVisible);
    verifyOnVisible = null;
  }
}

function startVerifyPolling(uid, credentials) {
  let attempts = 0;
  let inProgress = false;

  async function check() {
    if (inProgress) return;
    inProgress = true;

    if (++attempts > 100) {
      stopVerifyPolling();
      inProgress = false;
      return;
    }

    const { ok, data } = await apiFetch(`/auth/verify-status/${uid}`)
      .catch(() => ({ ok: false, data: {} }));

    if (!ok || !data.verified) {
      inProgress = false;
      return;
    }

    stopVerifyPolling();

    let loginResult = await apiFetch('/auth/login', { method: 'POST', body: credentials });
    if (!loginResult.ok && loginResult.data?.error?.code === 'EMAIL_NOT_VERIFIED') {
      await new Promise(r => setTimeout(r, 2000));
      loginResult = await apiFetch('/auth/login', { method: 'POST', body: credentials });
    }

    credentials.email = '';
    credentials.password = '';

    if (loginResult.ok) {
      saveSession(loginResult.data);
      const dest = dashboardUrl(loginResult.data.role);
      showToast('האימייל אומת בהצלחה!', () => { window.location.href = dest; });
    } else {
      showToast('האימייל אומת! אנא נסה/י להתחבר שוב.', () => {
        window.location.href = '/he/mentorship/login/';
      });
    }
  }

  verifyPollInterval = setInterval(check, 3000);

  verifyOnVisible = () => {
    if (document.visibilityState === 'visible') check();
  };
  document.addEventListener('visibilitychange', verifyOnVisible);
}

function showVerifyEmailScreen(email, credentials, uid) {
  wrapper.classList.add('d-none');
  verifyEmailDisplay.textContent = email;
  verifyWrapper.classList.remove('d-none');
  startVerifyResendCountdown();

  if (uid && credentials) {
    startVerifyPolling(uid, credentials);
  }
}

function startVerifyResendCountdown() {
  let seconds = 30;
  verifyResendBtn.disabled = true;
  verifyResendCountdown.textContent = `(${seconds}s)`;
  verifyResendCountdown.classList.remove('d-none');
  clearInterval(verifyResendTimer);
  verifyResendTimer = setInterval(() => {
    seconds--;
    verifyResendCountdown.textContent = `(${seconds}s)`;
    if (seconds <= 0) {
      clearInterval(verifyResendTimer);
      verifyResendBtn.disabled = false;
      verifyResendCountdown.classList.add('d-none');
    }
  }, 1000);
}

verifyResendBtn.addEventListener('click', async () => {
  const email = verifyEmailDisplay.textContent;
  verifyResendBtn.disabled = true;
  try {
    await apiFetch('/auth/resend-verification', { method: 'POST', body: { email } });
  } finally {
    startVerifyResendCountdown();
  }
});

document.getElementById('back-to-login-from-verify').addEventListener('click', (e) => {
  e.preventDefault();
  verifyWrapper.classList.add('d-none');
  clearInterval(verifyResendTimer);
  stopVerifyPolling();
  wrapper.classList.remove('d-none');
});

// ─── Login ────────────────────────────────────────────────────────────────────

async function handleLoginSubmit(event) {
  event.preventDefault();
  const submitBtn = form.querySelector('button[type="submit"]');
  const email = form.email.value.trim();
  const password = form.password.value;

  submitBtn.disabled = true;
  try {
    const { ok, data } = await apiFetch('/auth/login', {
      method: 'POST',
      body: { email, password },
    });

    if (!ok) {
      if (data.error?.code === 'EMAIL_NOT_VERIFIED') {
        showVerifyEmailScreen(email, { email, password }, data.uid);
      } else {
        showFormMessage(messageEl, describeAuthError(data.error), true);
      }
      return;
    }

    saveSession(data);
    form.hidden = true;
    const dest = dashboardUrl(data.role);
    showToast(`התחברת בהצלחה כ-${data.fullName ?? data.email}`, () => {
      window.location.href = dest;
    });
  } catch (err) {
    showFormMessage(messageEl, describeAuthError(err), true);
  } finally {
    submitBtn.disabled = false;
  }
}

form.addEventListener('submit', handleLoginSubmit);
