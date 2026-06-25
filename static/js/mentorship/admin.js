import { apiFetch, authedFetch, getSession, saveSession, clearSession } from './api.js';
import { describeAuthError, showFormMessage } from './errors.js';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_LABELS = {
  pending:    'בהמתנה',
  approved:   'אושרה',
  rejected:   'נדחתה',
  needs_info: 'דורש פרטים נוספים',
  completed:  'הושלמה',
  canceled:   'בוטלה',
};

const LEVEL_LABELS = {
  beginner:     'מתחיל/ה',
  intermediate: 'בינוני/ת',
  advanced:     'מתקדם/ת',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(ts) {
  if (!ts) return '—';
  return new Date((ts._seconds ?? ts.seconds ?? 0) * 1000).toLocaleDateString('he-IL');
}

function daysAgo(ts) {
  if (!ts) return 0;
  return Math.floor((Date.now() - (ts._seconds ?? ts.seconds ?? 0) * 1000) / 86400000);
}

function emptyRow(cols, msg = 'אין תוצאות.') {
  return `<tr><td colspan="${cols}" class="text-center text-muted py-4">${msg}</td></tr>`;
}

// ─── View switching ───────────────────────────────────────────────────────────

const authDiv = document.getElementById('admin-auth');
const dashDiv = document.getElementById('admin-dashboard');

function showAuth()      { authDiv.hidden = false; dashDiv.hidden = true; }
function showDashboard() { authDiv.hidden = true;  dashDiv.hidden = false; }

// ─── Auth: login ──────────────────────────────────────────────────────────────

const authMsg = document.getElementById('admin-auth-msg');

document.getElementById('admin-login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('login-submit');
  const fd  = new FormData(e.target);
  btn.disabled = true;
  authMsg.classList.add('d-none');

  const { ok, data } = await apiFetch('/auth/login', {
    method: 'POST',
    body: { email: fd.get('email'), password: fd.get('password') },
  });

  btn.disabled = false;

  if (!ok || data.role !== 'admin') {
    showFormMessage(authMsg, describeAuthError(data?.error) ?? 'שגיאה בכניסה.', true);
    authMsg.classList.remove('d-none');
    return;
  }
  if (!data.isAdmin) {
    showFormMessage(authMsg, 'החשבון ממתין לאישור מנהל המערכת.', true);
    authMsg.classList.remove('d-none');
    return;
  }

  saveSession(data);
  showDashboard();
  loadAll();
});

// ─── Auth: register (hidden toggle) ──────────────────────────────────────────

document.getElementById('show-register').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('admin-login-form').hidden   = true;
  document.getElementById('register-toggle-wrap').hidden = true;
  document.getElementById('admin-register-form').hidden  = false;
  authMsg.classList.add('d-none');
});

document.getElementById('cancel-register').addEventListener('click', () => {
  document.getElementById('admin-register-form').hidden  = true;
  document.getElementById('admin-login-form').hidden   = false;
  document.getElementById('register-toggle-wrap').hidden = false;
  authMsg.classList.add('d-none');
});

document.getElementById('admin-register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('register-submit');
  const fd  = new FormData(e.target);
  btn.disabled = true;

  const { ok, data } = await apiFetch('/auth/register', {
    method: 'POST',
    body: { role: 'admin', fullName: fd.get('fullName'), email: fd.get('email'), password: fd.get('password') },
  });

  btn.disabled = false;

  showFormMessage(
    authMsg,
    ok && data.pending ? 'החשבון נוצר. ממתין לאישור מנהל המערכת.' : describeAuthError(data?.error),
    !(ok && data.pending)
  );
  authMsg.classList.remove('d-none');
  if (ok && data.pending) e.target.reset();
});

// ─── Logout ───────────────────────────────────────────────────────────────────

document.getElementById('admin-logout').addEventListener('click', () => {
  clearSession();
  showAuth();
});

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TAB_IDS = ['tab-requests', 'tab-mentors', 'tab-mentees'];

document.querySelectorAll('#admin-tabs .nav-link').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#admin-tabs .nav-link').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    TAB_IDS.forEach(id => { document.getElementById(id).hidden = (id !== btn.dataset.target); });
  });
});

// ─── Requests ─────────────────────────────────────────────────────────────────

let allRequests = [];

function renderRequests() {
  const tbody  = document.getElementById('admin-requests-tbody');
  const alert  = document.getElementById('req-stale-alert');
  const search = document.getElementById('req-search').value.trim().toLowerCase();
  const status = document.getElementById('req-status-filter').value;

  let rows = allRequests;
  if (status) rows = rows.filter(r => r.status === status);
  if (search) rows = rows.filter(r =>
    [r.mentorName, r.menteeName, r.topic].some(f => f?.toLowerCase().includes(search))
  );

  const stale = allRequests.filter(r =>
    (r.status === 'pending' || r.status === 'needs_info') && daysAgo(r.createdAt) >= 5
  ).length;
  alert.textContent = stale > 0 ? `⚠️ ${stale} בקשות ממתינות מעל 5 ימים` : '';
  alert.classList.toggle('d-none', stale === 0);

  tbody.innerHTML = rows.length
    ? rows.map(r => {
        const days = daysAgo(r.createdAt);
        const staleRow = (r.status === 'pending' || r.status === 'needs_info') && days >= 5;
        return `<tr class="${staleRow ? 'admin-table__row--stale' : ''}">
          <td>${r.mentorName ?? '—'}</td>
          <td>${r.menteeName ?? '—'}</td>
          <td>${r.topic ?? '—'}</td>
          <td>${STATUS_LABELS[r.status] ?? r.status}</td>
          <td>${fmt(r.createdAt)}</td>
          <td>${days}</td>
        </tr>`;
      }).join('')
    : emptyRow(6);
}

// ─── Mentors ──────────────────────────────────────────────────────────────────

let allMentors = [];

function renderMentors() {
  const tbody  = document.getElementById('admin-mentors-tbody');
  const search = document.getElementById('mentor-search').value.trim().toLowerCase();
  let rows = allMentors;
  if (search) rows = rows.filter(m =>
    [m.fullName, m.email, ...(m.expertise ?? [])].some(f => f?.toLowerCase().includes(search))
  );
  tbody.innerHTML = rows.length
    ? rows.map(m => `<tr>
        <td>${m.fullName ?? '—'}</td>
        <td>${m.email ?? '—'}</td>
        <td>${[m.currentRole, m.company ? `@ ${m.company}` : null].filter(Boolean).join(' ') || '—'}</td>
        <td>${(m.expertise ?? []).join(', ') || '—'}</td>
        <td>${m.availability === 'unavailable' ? 'לא פנוי/ה' : 'פנוי/ה'}</td>
        <td>${fmt(m.createdAt)}</td>
      </tr>`).join('')
    : emptyRow(6);
}

// ─── Mentees ──────────────────────────────────────────────────────────────────

let allMentees = [];

function renderMentees() {
  const tbody  = document.getElementById('admin-mentees-tbody');
  const search = document.getElementById('mentee-search').value.trim().toLowerCase();
  let rows = allMentees;
  if (search) rows = rows.filter(m =>
    [m.fullName, m.email, ...(m.interests ?? [])].some(f => f?.toLowerCase().includes(search))
  );
  tbody.innerHTML = rows.length
    ? rows.map(m => `<tr>
        <td>${m.fullName ?? '—'}</td>
        <td>${m.email ?? '—'}</td>
        <td>${LEVEL_LABELS[m.experienceLevel] ?? m.experienceLevel ?? '—'}</td>
        <td>${(m.interests ?? []).join(', ') || '—'}</td>
        <td>${m.goals ?? '—'}</td>
        <td>${fmt(m.createdAt)}</td>
      </tr>`).join('')
    : emptyRow(6);
}

// ─── Load all ─────────────────────────────────────────────────────────────────

async function loadAll() {
  const [statsRes, requestsRes, mentorsRes, menteesRes] = await Promise.all([
    authedFetch('/admin/stats'),
    authedFetch('/admin/requests'),
    authedFetch('/admin/users/mentors'),
    authedFetch('/admin/users/mentees'),
  ]);

  if (statsRes.ok) {
    const d = statsRes.data;
    document.getElementById('stat-mentors').textContent  = d.mentorCount;
    document.getElementById('stat-mentees').textContent  = d.menteeCount;
    document.getElementById('stat-requests').textContent = d.requestCount;
    document.getElementById('stat-open').textContent     =
      (d.requestsByStatus.pending ?? 0) + (d.requestsByStatus.needs_info ?? 0);
    document.getElementById('stat-rate').textContent     = `${d.answeredRate}%`;
  }

  if (requestsRes.ok) {
    allRequests = requestsRes.data;
    renderRequests();
    document.getElementById('req-search').addEventListener('input', renderRequests);
    document.getElementById('req-status-filter').addEventListener('change', renderRequests);
  }

  if (mentorsRes.ok) {
    allMentors = mentorsRes.data;
    renderMentors();
    document.getElementById('mentor-search').addEventListener('input', renderMentors);
  }

  if (menteesRes.ok) {
    allMentees = menteesRes.data;
    renderMentees();
    document.getElementById('mentee-search').addEventListener('input', renderMentees);
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────────

const session = getSession();
if (session?.role === 'admin' && session?.isAdmin === true) {
  showDashboard();
  loadAll();
} else {
  showAuth();
}
