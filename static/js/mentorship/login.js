import { apiFetch, saveSession, getSession } from './api.js';
import { describeAuthError, showFormMessage } from './errors.js';
import { showToast } from './toast.js';

const choice = document.getElementById('login-choice');
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
  choice.hidden = true;
  window.location.href = existing.role === 'mentor'
    ? '/he/mentorship/mentor-dashboard/'
    : '/he/mentorship/mentee-dashboard/';
}

function showForm() {
  choice.classList.add('d-none');
  wrapper.classList.remove('d-none');
}

function showChoice() {
  wrapper.classList.add('d-none');
  choice.classList.remove('d-none');
  messageEl.classList.add('d-none');
  form.reset();
}

document.getElementById('choose-mentee').addEventListener('click', showForm);
document.getElementById('choose-mentor').addEventListener('click', showForm);
document.getElementById('back-from-login').addEventListener('click', showChoice);

const forgotSent = document.getElementById('forgot-password-sent');
const resetEmailDisplay = document.getElementById('reset-email-display');
const resendBtn = document.getElementById('resend-btn');
const resendCountdown = document.getElementById('resend-countdown');

let resendTimer = null;

function showForgotForm() {
  wrapper.classList.add('d-none');
  forgotSent.classList.add('d-none');
  forgotWrapper.classList.remove('d-none');
  forgotForm.reset();
  // Pre-fill email from login form if available
  const loginEmail = form.email.value.trim();
  if (loginEmail) document.getElementById('forgot-email-input').value = loginEmail;
  document.getElementById('forgot-email-input').focus();
}

function showLoginForm() {
  forgotWrapper.classList.add('d-none');
  forgotSent.classList.add('d-none');
  wrapper.classList.remove('d-none');
  clearInterval(resendTimer);
}

function showConfirmationScreen(email) {
  forgotWrapper.classList.add('d-none');
  resetEmailDisplay.textContent = email;
  forgotSent.classList.remove('d-none');
  startResendCountdown();
}

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

document.getElementById('back-from-forgot').addEventListener('click', showLoginForm);
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

let verifyResendTimer = null;

function showVerifyEmailScreen(email) {
  wrapper.classList.add('d-none');
  verifyEmailDisplay.textContent = email;
  verifyWrapper.classList.remove('d-none');
  startVerifyResendCountdown();
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
  wrapper.classList.remove('d-none');
});

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
        showVerifyEmailScreen(email);
      } else {
        showFormMessage(messageEl, describeAuthError(data.error), true);
      }
      return;
    }

    saveSession(data);
    form.hidden = true;
    const dest = data.role === 'mentor'
      ? '/he/mentorship/mentor-dashboard/'
      : '/he/mentorship/mentee-dashboard/';
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
