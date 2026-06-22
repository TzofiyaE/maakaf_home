import { apiFetch, saveSession, getSession } from './api.js';
import { describeAuthError, showFormMessage } from './errors.js';
import { showToast } from './toast.js';

function startVerificationPolling(uid, credentials, messageEl, dashboardUrl) {
  let attempts = 0;
  const interval = setInterval(async () => {
    if (++attempts > 100) { clearInterval(interval); return; }
    const { ok, data } = await apiFetch(`/auth/verify-status/${uid}`).catch(() => ({ ok: false, data: {} }));
    if (!ok || !data.verified) return;

    clearInterval(interval);
    const loginResult = await apiFetch('/auth/login', { method: 'POST', body: credentials });
    credentials.email = '';
    credentials.password = '';

    if (loginResult.ok) {
      saveSession(loginResult.data);
      showFormMessage(messageEl, 'האימייל אומת בהצלחה! מעביר/ה לדשבורד...', false);
      setTimeout(() => { window.location.href = dashboardUrl; }, 1500);
    } else {
      showFormMessage(messageEl, 'האימייל אומת! ניתן להתחבר כעת.', false);
    }
  }, 3000);
}

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
      showFormMessage(messageEl, `נרשמת בהצלחה, ${fullName}! נשלח אליך אימייל אימות — אנא לחץ/י על הקישור שבמייל.`, false);
      const credentials = { email, password };
      form.reset();
      startVerificationPolling(data.uid, credentials, messageEl, '/he/mentorship/mentee-dashboard/');
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
      showFormMessage(messageEl, `נרשמת בהצלחה, ${fullName}! נשלח אליך אימייל אימות — אנא לחץ/י על הקישור שבמייל.`, false);
      const credentials = { email, password };
      form.reset();
      startVerificationPolling(data.uid, credentials, messageEl, '/he/mentorship/mentor-dashboard/');
    }
  } catch (err) {
    showFormMessage(messageEl, describeAuthError(err), true);
  } finally {
    submitBtn.disabled = false;
  }
}

document.getElementById('mentee-register-form').addEventListener('submit', handleMenteeSubmit);
document.getElementById('mentor-register-form').addEventListener('submit', handleMentorSubmit);
