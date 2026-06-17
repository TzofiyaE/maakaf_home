import { getSession, apiFetch, authedFetch } from './api.js';
import { showFormMessage } from './errors.js';
import { showToast } from './toast.js';

const statusDiv  = document.getElementById('profile-status');
const contentDiv = document.getElementById('profile-content');

function showError(msg) {
  statusDiv.innerHTML = `<div class="alert alert-warning">${msg}</div>`;
}

const session = getSession();

if (!session) {
  showError('יש להתחבר תחילה. <a href="/he/mentorship/login/">כניסה למערכת</a>');
} else {
  init();
}

function splitList(value) {
  return value.split(',').map(s => s.trim()).filter(Boolean);
}

async function init() {
  document.getElementById('profile-name').textContent  = session.fullName ?? '';
  document.getElementById('profile-email').textContent = session.email ?? '';

  if (session.role === 'mentor') {
    await initMentor();
  } else if (session.role === 'mentee') {
    await initMentee();
  } else {
    showError('עריכת פרופיל אינה זמינה עבור חשבון מסוג זה.');
    return;
  }

  contentDiv.hidden = false;
}

async function initMentor() {
  const { ok, data } = await apiFetch(`/mentors/${session.uid}`);

  const section = document.getElementById('mentor-form-section');
  section.hidden = false;

  const form = document.getElementById('mentor-profile-form');

  if (ok) {
    form.currentRole.value      = data.currentRole ?? '';
    form.company.value          = data.company ?? '';
    form.expertise.value        = (data.expertise ?? []).join(', ');
    form.yearsExperience.value  = data.yearsExperience ?? '';
    form.availability.value     = data.availability ?? 'available';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const messageEl = document.getElementById('mentor-message');
    const submitBtn = form.querySelector('button[type="submit"]');

    const expertise = splitList(form.expertise.value);
    if (expertise.length === 0) {
      showFormMessage(messageEl, 'יש למלא תחומי התמחות (שדה חובה).', true);
      return;
    }

    submitBtn.disabled = true;
    const { ok: saveOk, data: saveData } = await authedFetch('/mentors/me', {
      method: 'PUT',
      body: {
        currentRole:      form.currentRole.value.trim() || null,
        company:          form.company.value.trim() || null,
        expertise,
        yearsExperience:  form.yearsExperience.value ? Number(form.yearsExperience.value) : null,
        availability:     form.availability.value,
      },
    });

    submitBtn.disabled = false;

    if (saveOk) {
      showToast('השינויים נשמרו בהצלחה', () => { window.location.href = '/he/mentorship/mentor-dashboard/'; });
    } else {
      showFormMessage(messageEl, saveData?.error ?? 'שגיאה בשמירת הפרופיל. אנא נסה/י שוב.', true);
    }
  });
}

async function initMentee() {
  const { ok, data } = await authedFetch('/mentees/me');

  const section = document.getElementById('mentee-form-section');
  section.hidden = false;

  const form = document.getElementById('mentee-profile-form');

  if (ok) {
    form.experienceLevel.value = data.experienceLevel ?? '';
    form.interests.value       = (data.interests ?? []).join(', ');
    form.goals.value           = data.goals ?? '';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const messageEl = document.getElementById('mentee-message');
    const submitBtn = form.querySelector('button[type="submit"]');

    const interests = splitList(form.interests.value);
    if (interests.length === 0) {
      showFormMessage(messageEl, 'יש למלא תחומי עניין (שדה חובה).', true);
      return;
    }

    submitBtn.disabled = true;
    const { ok: saveOk, data: saveData } = await authedFetch('/mentees/me', {
      method: 'PUT',
      body: {
        experienceLevel: form.experienceLevel.value || null,
        interests,
        goals: form.goals.value.trim() || null,
      },
    });

    submitBtn.disabled = false;

    if (saveOk) {
      showToast('השינויים נשמרו בהצלחה', () => { window.location.href = '/he/mentorship/dashboard/'; });
    } else {
      showFormMessage(messageEl, saveData?.error ?? 'שגיאה בשמירת הפרופיל. אנא נסה/י שוב.', true);
    }
  });
}
