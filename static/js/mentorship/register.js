import { apiFetch, saveSession, getSession, dashboardUrl } from './api.js';
import { describeAuthError, showFormMessage, getErrorMessage } from './errors.js';
import { showToast, showErrorPopup } from './toast.js';

// ─── Verification card (OTP) ──────────────────────────────────────────────────

let activeFormWrapper = null;

function showVerifyCard(email, uid, credentials, targetDashboardUrl) {
  const card        = document.getElementById('verify-card');
  const emailDisplay = document.getElementById('verify-email-display');
  const codeInput   = document.getElementById('verify-code-input');
  const codeError   = document.getElementById('verify-code-error');
  const submitBtn   = document.getElementById('verify-submit-btn');
  const resendBtn   = document.getElementById('resend-btn');
  const resendMsg   = document.getElementById('resend-msg');
  const changeLink  = document.getElementById('change-email-link');

  if (emailDisplay) emailDisplay.textContent = email ?? '';
  card.hidden = false;
  codeInput?.focus();

  // Submit code
  submitBtn.addEventListener('click', async () => {
    const code = codeInput.value.trim();
    if (code.length !== 6) {
      codeError.textContent = 'יש להזין קוד בן 6 ספרות.';
      codeError.classList.remove('d-none');
      return;
    }
    codeError.classList.add('d-none');
    submitBtn.disabled = true;
    submitBtn.textContent = 'מאמת...';

    const { ok, data } = await apiFetch('/auth/verify-code', {
      method: 'POST',
      body: { uid, code, email: credentials?.email, password: credentials?.password },
    });

    if (ok) {
      if (credentials) { credentials.email = ''; credentials.password = ''; }
      saveSession(data);
      showToast('האימות הושלם בהצלחה!', () => {
        window.location.href = targetDashboardUrl ?? dashboardUrl(data.role);
      });
    } else {
      const msg = getErrorMessage(data?.error?.code) || 'שגיאה באימות. נסה/י שוב.';
      codeError.textContent = msg;
      codeError.classList.remove('d-none');
      submitBtn.disabled = false;
      submitBtn.textContent = 'אמת/י';
    }
  });

  // Allow submitting with Enter
  codeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submitBtn.click();
  });

  // Resend with 60s countdown
  resendBtn.addEventListener('click', async () => {
    if (!email) return;
    resendBtn.disabled = true;
    const { ok } = await apiFetch('/auth/resend-verification', { method: 'POST', body: { email } });
    if (!ok) {
      codeError.textContent = 'שגיאה בשליחת קוד חדש. נסה/י שוב.';
      codeError.classList.remove('d-none');
      resendBtn.disabled = false;
      return;
    }
    codeInput.value = '';

    let seconds = 60;
    resendMsg.textContent = `קוד חדש נשלח ✓ — ניתן לשלוח שוב עוד ${seconds} שניות`;
    resendMsg.classList.remove('d-none');

    const countdown = setInterval(() => {
      seconds--;
      if (seconds <= 0) {
        clearInterval(countdown);
        resendMsg.classList.add('d-none');
        resendBtn.disabled = false;
      } else {
        resendMsg.textContent = `קוד חדש נשלח ✓ — ניתן לשלוח שוב עוד ${seconds} שניות`;
      }
    }, 1000);
  });

  // Change email — go back to the form
  changeLink.addEventListener('click', (e) => {
    e.preventDefault();
    card.hidden = true;
    if (activeFormWrapper) {
      activeFormWrapper.classList.remove('d-none');
      activeFormWrapper = null;
    }
  });
}

// Already logged in — redirect immediately
const existing = getSession();
if (existing) {
  document.getElementById('register-choice').hidden = true;
  window.location.href = dashboardUrl(existing.role);
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

  submitBtn.disabled = true;
  try {
    const { ok, data } = await apiFetch('/auth/register', {
      method: 'POST',
      body: config.buildBody(form, fullName, email, password),
    });

    if (!ok) {
      const code = data?.error?.code;
      if (code === 'auth/email-already-exists' || code === 'auth/email-already-in-use' || code === 'EMAIL_EXISTS') {
        showErrorPopup(getErrorMessage(code));
      } else {
        showFormMessage(messageEl, describeAuthError(data.error), true);
      }
      return;
    }

    if (data.idToken) {
      saveSession(data);
      form.closest('.card')?.closest('[id$="-wrapper"]')?.setAttribute('hidden', '');
      showToast('החשבון נוצר בהצלחה', () => {
        window.location.href = config.dashboardUrl;
      });
    } else {
      const credentials = { email, password };
      activeFormWrapper = form.closest('[id$="-wrapper"]');
      activeFormWrapper?.classList.add('d-none');
      form.reset();
      showVerifyCard(email, data.uid, credentials, config.dashboardUrl);
    }
  } catch (err) {
    showFormMessage(messageEl, describeAuthError(err), true);
  } finally {
    submitBtn.disabled = false;
  }
}

const menteeConfig = {
  messageElId: 'mentee-message',
  dashboardUrl: dashboardUrl('mentee'),
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
  dashboardUrl: dashboardUrl('mentor'),
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
    if (!document.getElementById('mentor-visibility-consent').checked) {
      showFormMessage(messageEl, 'יש לאשר שהפרטים יהיו גלויים בספרייה.', true);
      return false;
    }
    return true;
  },
  buildBody(form, fullName, email, password) {
    return {
      role: 'mentor',
      fullName,
      email,
      password,
      currentRole: form.currentRole.value.trim() || null,
      company: form.company.value.trim() || null,
      expertise: splitList(form.expertise.value),
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

document.getElementById('mentor-visibility-consent')
  .addEventListener('change', (e) => {
    document.getElementById('mentor-submit-btn').disabled = !e.target.checked;
  });
