import { apiFetch, saveSession, getSession, dashboardUrl } from './api.js';
import { describeAuthError, showFormMessage, getErrorMessage } from './errors.js';
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

// ─── OTP verification screen (shown after EMAIL_NOT_VERIFIED on login) ────────

let verifyResendTimer = null;
let verifyCredentials = null;
let verifyUid = null;

const verifyCodeInput    = document.getElementById('verify-code-input');
const verifyCodeError    = document.getElementById('verify-code-error');
const verifySubmitBtn    = document.getElementById('verify-submit-btn');

function showVerifyEmailScreen(email, credentials, uid) {
  wrapper.classList.add('d-none');
  verifyEmailDisplay.textContent = email;
  verifyCredentials = credentials;
  verifyUid = uid;
  verifyWrapper.classList.remove('d-none');
  verifyCodeInput?.focus();
  startVerifyResendCountdown();
}

function startVerifyResendCountdown() {
  let seconds = 60;
  verifyResendBtn.disabled = true;
  verifyResendCountdown.textContent = `ניתן לשלוח שוב עוד ${seconds} שניות`;
  verifyResendCountdown.classList.remove('d-none');
  clearInterval(verifyResendTimer);
  verifyResendTimer = setInterval(() => {
    seconds--;
    if (seconds <= 0) {
      clearInterval(verifyResendTimer);
      verifyResendBtn.disabled = false;
      verifyResendCountdown.classList.add('d-none');
    } else {
      verifyResendCountdown.textContent = `ניתן לשלוח שוב עוד ${seconds} שניות`;
    }
  }, 1000);
}

verifySubmitBtn.addEventListener('click', async () => {
  const code = verifyCodeInput.value.trim();
  if (code.length !== 6) {
    verifyCodeError.textContent = 'יש להזין קוד בן 6 ספרות.';
    verifyCodeError.classList.remove('d-none');
    return;
  }
  verifyCodeError.classList.add('d-none');
  verifySubmitBtn.disabled = true;
  verifySubmitBtn.textContent = 'מאמת...';

  const { ok, data } = await apiFetch('/auth/verify-code', {
    method: 'POST',
    body: {
      uid: verifyUid,
      code,
      email: verifyCredentials?.email,
      password: verifyCredentials?.password,
    },
  });

  if (verifyCredentials) { verifyCredentials.email = ''; verifyCredentials.password = ''; }

  if (ok) {
    saveSession(data);
    showToast('האימות הושלם בהצלחה!', () => {
      window.location.href = dashboardUrl(data.role);
    });
  } else {
    const msg = getErrorMessage(data?.error?.code) || 'שגיאה באימות. נסה/י שוב.';
    verifyCodeError.textContent = msg;
    verifyCodeError.classList.remove('d-none');
    verifySubmitBtn.disabled = false;
    verifySubmitBtn.textContent = 'אמת/י';
  }
});

verifyCodeInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') verifySubmitBtn.click();
});

verifyResendBtn.addEventListener('click', async () => {
  const email = verifyEmailDisplay.textContent;
  verifyResendBtn.disabled = true;
  await apiFetch('/auth/resend-verification', { method: 'POST', body: { email } });
  verifyCodeInput.value = '';
  startVerifyResendCountdown();
});

document.getElementById('back-to-login-from-verify').addEventListener('click', (e) => {
  e.preventDefault();
  verifyWrapper.classList.add('d-none');
  clearInterval(verifyResendTimer);
  verifyCredentials = null;
  verifyUid = null;
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
