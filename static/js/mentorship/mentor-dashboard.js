import { getSession, authedFetch } from './api.js';

const statusDiv  = document.getElementById('mdash-status');
const contentDiv = document.getElementById('mdash-content');
const cards      = document.getElementById('mdash-cards');
const emptyMsg   = document.getElementById('mdash-empty');

const STATUS_META = {
  pending:    { label: 'בהמתנה',             color: 'warning',   dark: true  },
  approved:   { label: 'אושרה',              color: 'success',   dark: false },
  rejected:   { label: 'נדחתה',              color: 'danger',    dark: false },
  needs_info: { label: 'דורש פרטים נוספים', color: 'info',      dark: true  },
  completed:  { label: 'הושלמה',             color: 'secondary', dark: false },
};

function formatDate(ts) {
  if (!ts) return '—';
  return new Date((ts._seconds ?? ts.seconds ?? 0) * 1000).toLocaleDateString('he-IL');
}

function actionButtons(req) {
  switch (req.status) {
    case 'pending':
      return `<div class="d-flex flex-wrap gap-2 mt-3">
        <button class="btn btn-sm btn-success"         data-id="${req.id}" data-action="approved">✓ אישור</button>
        <button class="btn btn-sm btn-danger"          data-id="${req.id}" data-action="rejected">✗ דחייה</button>
        <button class="btn btn-sm btn-info text-dark"  data-id="${req.id}" data-action="needs_info">? דורש פרטים</button>
      </div>`;
    case 'approved':
      return `<div class="mt-3">
        <button class="btn btn-sm btn-outline-secondary" data-id="${req.id}" data-action="completed">סיום</button>
      </div>`;
    case 'needs_info':
      return `<p class="text-muted small mt-3 mb-0 fst-italic">ממתין לתגובת מנטי</p>`;
    default:
      return '';
  }
}

const LEVEL_MAP = { beginner: 'מתחיל/ה', intermediate: 'בינוני/ת', advanced: 'מתקדם/ת' };

function renderCard(req) {
  const meta  = STATUS_META[req.status] ?? { label: req.status, color: 'light', dark: true };
  const badge = `<span class="badge bg-${meta.color}${meta.dark ? ' text-dark' : ''}">${meta.label}</span>`;

  const description = req.description
    ? `<p class="card-text small text-muted mt-2 mb-0">${req.description}</p>`
    : '';

  const hasActions = req.status === 'pending' || req.status === 'approved';
  const actionArea = hasActions ? `
    <div id="action-area-${req.id}" class="card-footer bg-light py-3" hidden>
      <textarea id="response-${req.id}" class="form-control form-control-sm mb-2" rows="2"
        placeholder="הוסף הערה למנטי (לא חובה)"></textarea>
      <div class="d-flex gap-2">
        <button class="btn btn-sm btn-primary confirm-action"          data-id="${req.id}">שלח</button>
        <button class="btn btn-sm btn-outline-secondary cancel-action" data-id="${req.id}">ביטול</button>
      </div>
    </div>` : '';

  return `
    <div class="col-md-6">
      <div class="card h-100 border-0 shadow-sm border-start border-4 border-${meta.color}" dir="rtl">
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between align-items-center mb-3">
            ${badge}
            <small class="text-muted">${formatDate(req.createdAt)}</small>
          </div>
          <h6 class="card-title mb-1">${req.topic}</h6>
          <p class="text-muted small mb-1">מנטי: <strong>${req.menteeName ?? '—'}</strong>
            <button class="btn btn-link btn-sm p-0 ms-2 toggle-mentee-profile"
              data-req-id="${req.id}" data-mentee-id="${req.menteeId}">פרטי פרופיל ▼</button>
          </p>
          <div id="mentee-profile-${req.id}" class="border rounded p-2 mb-2 bg-light small" hidden></div>
          ${description}
          <div class="mt-auto">${actionButtons(req)}</div>
        </div>
        ${actionArea}
      </div>
    </div>`;
}

const pendingAction = {};
const profileCache = {};

function renderProfileRows(profile) {
  const rows = [
    ['שם מלא', profile.fullName],
    ['אימייל', profile.email],
    ['רמת ניסיון', profile.experienceLevel ? (LEVEL_MAP[profile.experienceLevel] ?? profile.experienceLevel) : null],
    ['תחומי עניין', profile.interests?.length ? profile.interests.join(', ') : null],
    ['מטרות', profile.goals],
  ].filter(([, v]) => v);
  return rows.map(([label, value]) =>
    `<div class="row mb-1"><div class="col-4 text-muted fw-bold">${label}</div><div class="col-8">${value}</div></div>`
  ).join('');
}

function bindMenteeProfiles() {
  cards.querySelectorAll('.toggle-mentee-profile').forEach(btn => {
    btn.addEventListener('click', async () => {
      const { reqId, menteeId } = btn.dataset;
      const panel = document.getElementById(`mentee-profile-${reqId}`);

      if (!panel.hidden) {
        panel.hidden = true;
        btn.textContent = 'פרטי פרופיל ▼';
        return;
      }

      if (profileCache[menteeId]) {
        panel.innerHTML = renderProfileRows(profileCache[menteeId]);
        panel.hidden = false;
        btn.textContent = 'פרטי פרופיל ▲';
        return;
      }

      btn.textContent = 'טוען...';
      const { ok, data } = await authedFetch(`/mentees/${menteeId}`);
      if (ok) {
        profileCache[menteeId] = data;
        panel.innerHTML = renderProfileRows(data);
      } else {
        panel.innerHTML = '<span class="text-danger">לא ניתן לטעון את הפרופיל.</span>';
      }
      panel.hidden = false;
      btn.textContent = 'פרטי פרופיל ▲';
    });
  });
}

function bindActions() {
  cards.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const { id, action } = btn.dataset;
      pendingAction[id] = action;
      cards.querySelectorAll('[id^="action-area-"]').forEach(el => { el.hidden = true; });
      document.getElementById(`action-area-${id}`).hidden = false;
    });
  });

  cards.querySelectorAll('.cancel-action').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById(`action-area-${btn.dataset.id}`).hidden = true;
      delete pendingAction[btn.dataset.id];
    });
  });

  cards.querySelectorAll('.confirm-action').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const mentorResponse = document.getElementById(`response-${id}`).value.trim() || null;
      btn.disabled = true;

      const { ok } = await authedFetch(`/requests/${id}`, {
        method: 'PATCH',
        body: { status: pendingAction[id], mentorResponse },
      });

      if (ok) {
        load();
      } else {
        btn.disabled = false;
        statusDiv.innerHTML = '<div class="alert alert-danger">שגיאה בעדכון הבקשה. אנא נסה/י שוב.</div>';
      }
    });
  });
}

async function load() {
  statusDiv.innerHTML = '';
  cards.innerHTML = '<p class="text-muted">טוען...</p>';
  const session = getSession();
  const { ok, data } = await authedFetch('/requests');

  if (!ok) {
    cards.innerHTML = '<p class="text-danger">שגיאה בטעינת הבקשות.</p>';
    return;
  }

  const mine = data
    .filter(r => r.mentorId === session.uid)
    .sort((a, b) => (b.createdAt?._seconds ?? 0) - (a.createdAt?._seconds ?? 0));

  if (mine.length === 0) {
    cards.innerHTML = '';
    emptyMsg.hidden = false;
    return;
  }

  emptyMsg.hidden = true;
  cards.innerHTML = mine.map(renderCard).join('');
  bindActions();
  bindMenteeProfiles();
}

const session = getSession();

if (!session) {
  contentDiv.hidden = true;
  statusDiv.innerHTML = '<div class="alert alert-warning">יש להתחבר תחילה. <a href="/he/mentorship/login/">כניסה למערכת</a></div>';
} else if (session.role !== 'mentor') {
  contentDiv.hidden = true;
  statusDiv.innerHTML = '<div class="alert alert-warning">דשבורד זה מיועד למנטורים בלבד.</div>';
} else {
  load();
}
