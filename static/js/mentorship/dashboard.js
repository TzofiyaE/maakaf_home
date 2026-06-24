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
    const label    = isMentor ? 'מנטור/ית' : 'אני';
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

function renderCard(req) {
  const meta  = STATUS_META[req.status] ?? { label: req.status, color: 'light', dark: true };
  const badge = `<span class="badge bg-${meta.color}${meta.dark ? ' text-dark' : ''}">${meta.label}</span>`;

  const responseBlock = req.mentorResponse
    ? `<div class="p-2 mt-3 rounded bg-light border-start border-3 border-${meta.color} small">
         <span class="fw-semibold">תגובת המנטור:</span> ${req.mentorResponse}
       </div>`
    : '';

  const cancelBtn = req.status === 'pending'
    ? `<button class="btn btn-sm btn-outline-danger mt-3 cancel-btn" data-id="${req.id}">ביטול הבקשה</button>`
    : '';

  const completeBtn = req.status === 'approved'
    ? `<button class="btn btn-sm btn-outline-secondary mt-3 complete-btn" data-id="${req.id}">סימון כהושלם</button>`
    : '';

  const resubmitArea = req.status === 'needs_info'
    ? `<div class="mt-3 pt-2 border-top">
        <label class="form-label small fw-semibold mb-1">תשובה למנטור/ית <span class="text-muted fw-normal">(לא חובה)</span></label>
        <textarea id="reply-${req.id}" class="form-control form-control-sm mb-2" rows="3"
          placeholder="הוסף/י פרטים נוספים שיעזרו למנטור/ית להשיב לך..."></textarea>
        <button class="btn btn-sm btn-primary resubmit-btn" data-id="${req.id}">שלח/י תגובה</button>
      </div>`
    : '';

  return `
    <div class="col-md-6" id="req-${req.id}">
      <div class="card border-0 shadow-sm border-start border-4 border-${meta.color}" style="min-height:100%" dir="rtl">
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between align-items-center mb-3">
            ${badge}
            <small class="text-muted">${formatDate(req.createdAt)}</small>
          </div>
          <h6 class="card-title mb-1">${req.topic}</h6>
          <p class="text-muted small mb-0">מנטור: <strong>${req.mentorName ?? '—'}</strong></p>
          <div class="mt-auto">
            ${responseBlock}
            ${resubmitArea}
            ${cancelBtn}
            ${completeBtn}
            <button class="btn btn-link btn-sm p-0 mt-2 toggle-timeline" data-id="${req.id}">היסטוריה ▼</button>
          </div>
        </div>
        <div id="timeline-${req.id}" class="border-top" style="max-height:260px;overflow-y:auto;" hidden>
          <div id="timeline-body-${req.id}"></div>
        </div>
      </div>
    </div>`;
}

async function resubmit(id, btn) {
  const replyEl = document.getElementById(`reply-${id}`);
  const menteeReply = replyEl?.value.trim() || null;

  btn.disabled = true;
  const { ok } = await authedFetch(`/requests/${id}`, {
    method: 'PATCH',
    body: { status: 'pending', menteeReply },
  });
  if (ok) {
    load();
  } else {
    btn.disabled = false;
    statusDiv.innerHTML = '<div class="alert alert-danger">שגיאה בשליחה. אנא נסה/י שוב.</div>';
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

  cards.querySelectorAll('.resubmit-btn').forEach(btn => {
    btn.addEventListener('click', () => resubmit(btn.dataset.id, btn));
  });

  cards.querySelectorAll('.cancel-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('האם לבטל את הבקשה?')) return;
      btn.disabled = true;
      const { ok } = await authedFetch(`/requests/${btn.dataset.id}`, {
        method: 'PATCH',
        body: { status: 'canceled' },
      });
      if (ok) { load(); } else { btn.disabled = false; }
    });
  });

  cards.querySelectorAll('.complete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      const { ok } = await authedFetch(`/requests/${btn.dataset.id}`, {
        method: 'PATCH',
        body: { status: 'completed' },
      });
      if (ok) { load(); } else { btn.disabled = false; }
    });
  });

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
} else if (session.role !== 'mentee') {
  contentDiv.hidden = true;
  statusDiv.innerHTML = '<div class="alert alert-warning">דשבורד זה מיועד למנטים בלבד.</div>';
} else {
  load();
}
