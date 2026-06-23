import { getSession, authedFetch } from './api.js';
import { getErrorMessage } from './errors.js';

const statusDiv = document.getElementById('req-status');
const formDiv = document.getElementById('req-form');
const mentorInput = document.getElementById('req-mentor-name');
const topicInput = document.getElementById('req-topic');
const descInput = document.getElementById('req-description');
const submitBtn = document.getElementById('req-submit');
const consentCheck = document.getElementById('req-consent');
const profilePreview = document.getElementById('req-profile-preview');

function showStatus(html, type = 'info') {
  statusDiv.innerHTML = `<div class="alert alert-${type}" role="alert">${html}</div>`;
}

const params = new URLSearchParams(window.location.search);
const mentorId = params.get('mentorId');
const mentorName = params.get('mentorName');

const session = getSession();

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
  mentorInput.value = mentorName || mentorId;
  loadProfilePreview();
}

consentCheck.addEventListener('change', () => {
  submitBtn.disabled = !consentCheck.checked;
});

async function loadProfilePreview() {
  const { ok, data } = await authedFetch('/mentees/me');

  const rows = [
    ['שם מלא', session.fullName],
    ['אימייל', session.email],
  ];

  if (ok) {
    const levelMap = { beginner: 'מתחיל/ה', intermediate: 'בינוני/ת', advanced: 'מתקדם/ת' };
    if (data.experienceLevel) rows.push(['רמת ניסיון', levelMap[data.experienceLevel] ?? data.experienceLevel]);
    if (data.interests?.length) rows.push(['תחומי עניין', data.interests.join(', ')]);
    if (data.goals) rows.push(['מטרות', data.goals]);
  }

  profilePreview.innerHTML = rows
    .map(([label, value]) => `
      <div class="row mb-1">
        <div class="col-4 text-muted small fw-bold">${label}</div>
        <div class="col-8 small">${value ?? '—'}</div>
      </div>`)
    .join('');
}

submitBtn.addEventListener('click', async () => {
  if (!consentCheck.checked) {
    showStatus('יש לאשר שהמנטור/ית יוכל/תוכל לצפות בפרטי הפרופיל לפני השליחה.', 'warning');
    return;
  }

  const topic = topicInput.value.trim();
  if (!topic) {
    showStatus('יש למלא נושא לבקשה.', 'warning');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'שולח...';

  const { ok, data } = await authedFetch('/requests', {
    method: 'POST',
    body: { mentorId, topic, description: descInput.value.trim() || null },
  });

  if (ok) {
    formDiv.hidden = true;
    showStatus(
      `הבקשה נשלחה בהצלחה! תוכל/י לעקוב אחר הסטטוס ב<a href="/he/mentorship/mentee-dashboard/">דשבורד שלי</a>.`,
      'success'
    );
  } else {
    const msg = getErrorMessage(data?.error?.code) || 'שגיאה בשליחת הבקשה. אנא נסה/י שוב.';
    showStatus(msg, 'danger');
    submitBtn.disabled = false;
    submitBtn.textContent = 'שליחת בקשה';
  }
});
