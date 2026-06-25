import { apiFetch, getSession, authedFetch } from './api.js';
import { getErrorMessage, escapeHtml } from './errors.js';
import { showErrorPopup } from './toast.js';

const statusDiv    = document.getElementById('req-status');
const formDiv      = document.getElementById('req-form');
const mentorInput  = document.getElementById('req-mentor-name');
const topicInput   = document.getElementById('req-topic');
const descInput    = document.getElementById('req-description');
const submitBtn    = document.getElementById('req-submit');
const consentCheck = document.getElementById('req-consent');
const profilePreview = document.getElementById('req-profile-preview');

const LEVEL_MAP = { beginner: 'מתחיל/ה', intermediate: 'בינוני/ת', advanced: 'מתקדם/ת' };

function showStatus(html, type = 'info') {
  statusDiv.innerHTML = `<div class="alert alert-${type}" role="alert">${html}</div>`;
}

const params    = new URLSearchParams(window.location.search);
const mentorId  = params.get('mentorId');
const mentorName = params.get('mentorName');
const session   = getSession();

// ─── Guard: must be a logged-in mentee with a mentorId ───────────────────────

if (!session) {
  formDiv.hidden = true;
  showStatus('יש להתחבר תחילה כדי לשלוח בקשת מנטורינג. <a href="/he/mentorship/login/">כניסה למערכת</a>', 'warning');
} else if (session.role !== 'mentee') {
  formDiv.hidden = true;
  showStatus('רק מנטים רשומים יכולים לשלוח בקשות מנטורינג.', 'warning');
} else if (!mentorId) {
  formDiv.hidden = true;
  showStatus('לא נבחר מנטור. <a href="/he/mentorship/">חזרה לספריית המנטורים</a>', 'warning');
} else {
  init();
}

// ─── Init: verify mentor is available before showing the form ────────────────

async function init() {
  const { ok, data } = await apiFetch(`/mentors/${mentorId}`);

  if (!ok) {
    formDiv.hidden = true;
    showStatus('לא ניתן לטעון את פרטי המנטור/ית. <a href="/he/mentorship/">חזרה לספרייה</a>', 'warning');
    return;
  }

  if (data.availability === 'unavailable') {
    formDiv.hidden = true;
    showStatus('המנטור/ית אינ/ה פנוי/ה כרגע לקבלת בקשות חדשות. <a href="/he/mentorship/">חזרה לספרייה</a>', 'warning');
    return;
  }

  mentorInput.value = data.fullName || mentorName || mentorId;
  loadProfilePreview();
  setupDescCounter();
}

// ─── Description character counter ───────────────────────────────────────────

const DESC_MAX = 2000;

function setupDescCounter() {
  const counter = document.createElement('div');
  counter.className = 'form-text text-end';
  counter.id = 'desc-counter';
  counter.textContent = `0 / ${DESC_MAX}`;
  descInput.parentElement.appendChild(counter);

  descInput.addEventListener('input', () => {
    const len = descInput.value.length;
    counter.textContent = `${len} / ${DESC_MAX}`;
    counter.classList.toggle('text-danger', len > DESC_MAX);
  });
}

// ─── Consent toggle ───────────────────────────────────────────────────────────

consentCheck.addEventListener('change', () => {
  submitBtn.disabled = !consentCheck.checked;
});

// ─── Profile preview ─────────────────────────────────────────────────────────

async function loadProfilePreview() {
  const { ok, data } = await authedFetch('/mentees/me');

  const rows = [
    ['שם מלא',      session.fullName],
    ['אימייל',      session.email],
  ];

  if (ok) {
    if (data.experienceLevel) rows.push(['רמת ניסיון', LEVEL_MAP[data.experienceLevel] ?? data.experienceLevel]);
    if (data.interests?.length) rows.push(['תחומי עניין', data.interests.join(', ')]);
    if (data.goals) rows.push(['מטרות', data.goals]);
  }

  profilePreview.innerHTML = rows
    .map(([label, value]) => `
      <div class="row mb-1">
        <div class="col-4 text-muted small fw-bold">${label}</div>
        <div class="col-8 small">${escapeHtml(String(value ?? '—'))}</div>
      </div>`)
    .join('');
}

// ─── Submit ───────────────────────────────────────────────────────────────────

const TOPIC_MAX = 200;

submitBtn.addEventListener('click', async () => {
  if (!consentCheck.checked) {
    showStatus('יש לאשר שהמנטור/ית יוכל/תוכל לצפות בפרטי הפרופיל לפני השליחה.', 'warning');
    return;
  }

  const topic = topicInput.value.trim();
  if (!topic) {
    showErrorPopup('יש למלא נושא לבקשה.');
    return;
  }
  if (topic.length > TOPIC_MAX) {
    showStatus(`נושא הבקשה מוגבל ל-${TOPIC_MAX} תווים.`, 'warning');
    return;
  }

  const description = descInput.value.trim() || null;
  if (description && description.length > DESC_MAX) {
    showStatus(`התיאור מוגבל ל-${DESC_MAX} תווים.`, 'warning');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'שולח...';

  const { ok, data } = await authedFetch('/requests', {
    method: 'POST',
    body: { mentorId, topic, description },
  });

  if (ok) {
    formDiv.hidden = true;
    showStatus(
      `הבקשה נשלחה בהצלחה! תוכל/י לעקוב אחר הסטטוס ב<a href="/he/mentorship/mentee-dashboard/">דשבורד שלי</a>.`,
      'success'
    );
  } else {
    const code = data?.error?.code;
    if (code === 'DUPLICATE_REQUEST') {
      showErrorPopup(getErrorMessage(code));
    } else {
      showStatus(getErrorMessage(code) || 'שגיאה בשליחת הבקשה. אנא נסה/י שוב.', 'danger');
    }
    submitBtn.disabled = false;
    submitBtn.textContent = 'שליחת בקשה';
  }
});
