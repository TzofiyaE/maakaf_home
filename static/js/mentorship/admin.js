import { apiFetch, authedFetch, getSession, saveSession } from './api.js';
import { describeAuthError, showFormMessage } from './errors.js';
import { showToast } from './toast.js';

const authSection = document.getElementById('admin-auth-section');
const statusDiv   = document.getElementById('admin-status');
const contentDiv  = document.getElementById('admin-content');

// --- choice buttons ---
const choiceDiv    = document.getElementById('admin-choice');
const registerWrap = document.getElementById('admin-register-wrapper');
const loginWrap    = document.getElementById('admin-login-wrapper');

function showChoice() {
  choiceDiv.classList.remove('d-none');
  registerWrap.classList.add('d-none');
  loginWrap.classList.add('d-none');
}

document.getElementById('choose-register').addEventListener('click', () => {
  choiceDiv.classList.add('d-none');
  registerWrap.classList.remove('d-none');
});

document.getElementById('choose-login').addEventListener('click', () => {
  choiceDiv.classList.add('d-none');
  loginWrap.classList.remove('d-none');
});

document.getElementById('back-from-register').addEventListener('click', showChoice);
document.getElementById('back-from-login').addEventListener('click', showChoice);

// --- register form ---
const registerForm = document.getElementById('admin-register-form');
const registerMsg  = document.getElementById('admin-register-msg');

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(registerForm);
  const btn = document.getElementById('register-submit');
  btn.disabled = true;

  const { ok, data } = await apiFetch('/auth/register', {
    method: 'POST',
    body: {
      role: 'admin',
      fullName: fd.get('fullName'),
      email: fd.get('email'),
      password: fd.get('password'),
    },
  });

  btn.disabled = false;

  if (ok && data.pending) {
    registerForm.hidden = true;
    showFormMessage(registerMsg, 'החשבון נוצר בהצלחה. ממתין לאישור מנהל המערכת.', false);
    registerMsg.classList.remove('d-none');
    return;
  }

  showFormMessage(registerMsg, describeAuthError(data?.error), true);
  registerMsg.classList.remove('d-none');
});

// --- login form ---
const loginForm = document.getElementById('admin-login-form');
const loginMsg  = document.getElementById('admin-login-msg');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(loginForm);
  const btn = document.getElementById('login-submit');
  btn.disabled = true;

  const { ok, data } = await apiFetch('/auth/login', {
    method: 'POST',
    body: { email: fd.get('email'), password: fd.get('password') },
  });

  btn.disabled = false;

  if (!ok) {
    showFormMessage(loginMsg, describeAuthError(data?.error), true);
    loginMsg.classList.remove('d-none');
    return;
  }

  if (data.role !== 'admin') {
    showFormMessage(loginMsg, 'משתמש זה אינו מנהל המערכת.', true);
    loginMsg.classList.remove('d-none');
    return;
  }

  if (!data.isAdmin) {
    showFormMessage(loginMsg, 'החשבון ממתין לאישור. פנה/י למנהל המערכת.', true);
    loginMsg.classList.remove('d-none');
    return;
  }

  saveSession(data);
  loginWrap.classList.add('d-none');
  showToast(`התחברת בהצלחה כ-${data.fullName ?? data.email}`, () => {
    authSection.hidden = true;
    loadStats();
  });
});

// --- stats ---
const STATUS_LABELS = {
  pending:    'בהמתנה',
  approved:   'אושרה',
  rejected:   'נדחתה',
  needs_info: 'דורש פרטים נוספים',
  completed:  'הושלמה',
};

async function loadStats() {
  const { ok, status, data } = await authedFetch('/admin/stats');

  if (!ok) {
    contentDiv.hidden = true;
    statusDiv.innerHTML = status === 403
      ? '<div class="alert alert-danger">גישה מורשית למנהלי המערכת בלבד.</div>'
      : '<div class="alert alert-danger">שגיאה בטעינת הנתונים.</div>';
    return;
  }

  contentDiv.hidden = false;
  document.getElementById('stat-mentors').textContent  = data.mentorCount;
  document.getElementById('stat-mentees').textContent  = data.menteeCount;
  document.getElementById('stat-requests').textContent = data.requestCount;
  document.getElementById('stat-rate').textContent     = `${data.answeredRate}%`;

  const tbody = document.getElementById('admin-status-tbody');
  tbody.innerHTML = Object.entries(data.requestsByStatus)
    .map(([s, count]) => `
      <tr>
        <td>${STATUS_LABELS[s] ?? s}</td>
        <td>${count}</td>
      </tr>`)
    .join('');
}

// --- initial load ---
const session = getSession();

if (session?.role === 'admin' && session?.isAdmin === true) {
  authSection.hidden = true;
  loadStats();
} else {
  contentDiv.hidden = true;
}
