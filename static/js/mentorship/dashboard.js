import { getSession, authedFetch } from './api.js';

const statusDiv  = document.getElementById('dash-status');
const contentDiv = document.getElementById('dash-content');
const cards      = document.getElementById('dash-cards');
const emptyMsg   = document.getElementById('dash-empty');

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

function renderCard(req) {
  const meta  = STATUS_META[req.status] ?? { label: req.status, color: 'light', dark: true };
  const badge = `<span class="badge bg-${meta.color}${meta.dark ? ' text-dark' : ''}">${meta.label}</span>`;

  const responseBlock = req.mentorResponse
    ? `<div class="p-2 mt-3 rounded bg-light border-start border-3 border-${meta.color} small">
         <span class="fw-semibold">תגובת המנטור:</span> ${req.mentorResponse}
       </div>`
    : '';

  const resubmitBtn = req.status === 'needs_info'
    ? `<button class="btn btn-sm btn-outline-primary mt-3" data-id="${req.id}">הגשה מחדש</button>`
    : '';

  return `
    <div class="col-md-6">
      <div class="card h-100 border-0 shadow-sm border-start border-4 border-${meta.color}" dir="rtl">
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between align-items-center mb-3">
            ${badge}
            <small class="text-muted">${formatDate(req.createdAt)}</small>
          </div>
          <h6 class="card-title mb-1">${req.topic}</h6>
          <p class="text-muted small mb-0">מנטור: <strong>${req.mentorName ?? '—'}</strong></p>
          <div class="mt-auto">
            ${responseBlock}
            ${resubmitBtn}
          </div>
        </div>
      </div>
    </div>`;
}

async function resubmit(id, btn) {
  btn.disabled = true;
  const { ok } = await authedFetch(`/requests/${id}`, {
    method: 'PATCH',
    body: { status: 'pending' },
  });
  if (ok) {
    load();
  } else {
    btn.disabled = false;
    statusDiv.innerHTML = '<div class="alert alert-danger">שגיאה בהגשה מחדש. אנא נסה/י שוב.</div>';
  }
}

async function load() {
  cards.innerHTML = '<p class="text-muted">טוען...</p>';
  const session = getSession();
  const { ok, data } = await authedFetch('/requests');

  if (!ok) {
    cards.innerHTML = '<p class="text-danger">שגיאה בטעינת הבקשות.</p>';
    return;
  }

  const mine = data
    .filter(r => r.menteeId === session.uid)
    .sort((a, b) => (b.createdAt?._seconds ?? 0) - (a.createdAt?._seconds ?? 0));

  if (mine.length === 0) {
    cards.innerHTML = '';
    emptyMsg.hidden = false;
    return;
  }

  emptyMsg.hidden = true;
  cards.innerHTML = mine.map(renderCard).join('');
  cards.querySelectorAll('[data-id]').forEach(btn => {
    btn.addEventListener('click', () => resubmit(btn.dataset.id, btn));
  });
}

const session = getSession();

if (!session) {
  contentDiv.hidden = true;
  statusDiv.innerHTML = '<div class="alert alert-warning">יש להתחבר תחילה. <a href="/he/mentorship/login/">כניסה למערכת</a></div>';
} else if (session.role !== 'mentee') {
  contentDiv.hidden = true;
  statusDiv.innerHTML = '<div class="alert alert-warning">דשבורד זה מיועד למנטים בלבד.</div>';
} else {
  load();
}
