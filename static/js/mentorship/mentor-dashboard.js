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
  canceled:   { label: 'בוטלה',              color: 'secondary', dark: false },
};

const STATUS_LABELS = Object.fromEntries(Object.entries(STATUS_META).map(([k, v]) => [k, v.label]));

function formatDateTime(ts) {
  if (!ts) return '—';
  return new Date((ts._seconds ?? ts.seconds ?? 0) * 1000)
    .toLocaleString('he-IL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function renderTimeline(events) {
  if (!events.length) return '<p class="text-muted small text-center py-2 mb-0">אין היסטוריה עדיין.</p>';
  return events.map((ev, i) => {
    const isMentor = ev.authorRole === 'mentor';
    const label    = isMentor ? 'מנטור/ית' : 'מנטי';
    const badgeCls = isMentor ? 'bg-primary' : 'bg-light text-dark border';
    const borderTop = i > 0 ? 'border-top' : '';

    const statusLine = ev.fromStatus
      ? `<span class="text-muted">${STATUS_LABELS[ev.fromStatus] ?? ev.fromStatus} ← ${STATUS_LABELS[ev.toStatus] ?? ev.toStatus}</span>`
      : `<span class="text-muted">בקשה נשלחה</span>`;

    const content = ev.content
      ? `<p class="mb-0 mt-1">${ev.content}</p>`
      : '';

    return `
      <div class="px-3 py-2 ${borderTop}" dir="rtl">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <span class="badge ${badgeCls}">${label}</span>
          <small class="text-muted">${formatDateTime(ev.createdAt)}</small>
        </div>
        <div class="small">${statusLine}${content}</div>
      </div>`;
  }).join('');
}

const timelineCache = {};

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
    ? `<p class="card-text small text-muted mt-2 mb-1">${req.description}</p>`
    : '';

  const menteeReplyBlock = req.menteeReply
    ? `<div class="p-2 mt-2 rounded bg-light border-start border-3 border-primary small">
         <span class="fw-semibold">תגובת המנטי:</span> ${req.menteeReply}
       </div>`
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
    <div class="col-md-6" id="req-${req.id}">
      <div class="card border-0 shadow-sm border-start border-4 border-${meta.color}" style="min-height:100%" dir="rtl">
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
          ${menteeReplyBlock}
          <div class="mt-auto">
            ${actionButtons(req)}
            <button class="btn btn-link btn-sm p-0 mt-2 toggle-timeline" data-id="${req.id}">היסטוריה ▼</button>
          </div>
        </div>
        <div id="timeline-${req.id}" class="border-top" style="max-height:260px;overflow-y:auto;" hidden>
          <div id="timeline-body-${req.id}"></div>
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
      const action = pendingAction[id];
      const responseEl = document.getElementById(`response-${id}`);
      const mentorResponse = responseEl.value.trim() || null;

      if (!mentorResponse && (action === 'rejected' || action === 'needs_info')) {
        responseEl.classList.add('is-invalid');
        responseEl.placeholder = action === 'rejected'
          ? 'חובה לציין סיבת הדחייה'
          : 'חובה לציין מה נדרש מהמנטי';
        responseEl.focus();
        return;
      }
      responseEl.classList.remove('is-invalid');
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

function bindTimelines() {
  cards.querySelectorAll('.toggle-timeline').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const panel = document.getElementById(`timeline-${id}`);
      const body  = document.getElementById(`timeline-body-${id}`);

      if (!panel.hidden) {
        panel.hidden = true;
        btn.textContent = 'היסטוריה ▼';
        return;
      }

      btn.textContent = 'טוען...';

      if (!timelineCache[id]) {
        const { ok, data } = await authedFetch(`/requests/${id}/timeline`);
        timelineCache[id] = ok ? data : [];
      }

      body.innerHTML = renderTimeline(timelineCache[id]);
      panel.hidden = false;
      btn.textContent = 'היסטוריה ▲';
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
  bindTimelines();

  const hash = window.location.hash;
  if (hash) {
    const target = document.querySelector(hash);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
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
