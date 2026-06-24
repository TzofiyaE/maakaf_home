import { apiFetch } from './api.js';

const grid = document.getElementById('mentor-grid');
const searchInput = document.getElementById('dir-search');
const topicSelect = document.getElementById('dir-topic');
const availSelect = document.getElementById('dir-avail');

let allMentors = [];

const LINKEDIN_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z"/></svg>`;

function getInitials(name) {
  return (name || '').split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

function renderCard(mentor) {
  const available = mentor.availability !== 'unavailable';
  const parts = [mentor.currentRole, mentor.company ? `@ ${mentor.company}` : null].filter(Boolean);
  const subtitle = parts.length
    ? `<p class="text-muted small mb-2">${parts.join(' ')}</p>`
    : '';
  const badges = (mentor.expertise || [])
    .map(e => `<span class="badge bg-primary me-1 mb-1">${e}</span>`)
    .join('');
  const availBadge = available
    ? '<span class="badge bg-success">פנוי/ה למנטורינג</span>'
    : '<span class="badge bg-secondary">עומס מלא כרגע</span>';

  const profileUrl = `/he/mentorship/directory/mentor/?mentorId=${mentor.id}`;
  const requestBtn = available
    ? `<a href="/he/mentorship/request/?mentorId=${mentor.id}&mentorName=${encodeURIComponent(mentor.fullName)}" class="btn btn-primary btn-sm">שלח/י בקשה</a>`
    : `<button class="btn btn-secondary btn-sm" disabled>לא פנוי/ה כרגע</button>`;

  const linkedInLink = mentor.linkedIn
    ? `<a href="${mentor.linkedIn}" target="_blank" rel="noopener" title="LinkedIn" class="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1">${LINKEDIN_ICON} LinkedIn</a>`
    : '';
  const calendlyLink = mentor.calendlyUrl
    ? `<a href="${mentor.calendlyUrl}" target="_blank" rel="noopener" class="btn btn-outline-secondary btn-sm">📅 תיאום פגישה</a>`
    : '';

  return `
    <div class="col-md-4 mb-4">
      <div class="card h-100 ms-mentor-card shadow-sm border-0">
        <div class="card-body d-flex flex-column" dir="rtl">
          <div class="d-flex align-items-start gap-3 mb-3">
            <div class="ms-avatar" aria-hidden="true">${getInitials(mentor.fullName)}</div>
            <div class="flex-grow-1 min-width-0">
              <h5 class="card-title mb-0 fw-bold">${mentor.fullName}</h5>
              ${subtitle}
              ${availBadge}
            </div>
          </div>
          <div class="mb-3">${badges}</div>
          ${linkedInLink || calendlyLink
            ? `<div class="d-flex flex-wrap gap-2 mb-3">${linkedInLink}${calendlyLink}</div>`
            : ''}
          <div class="mt-auto d-flex flex-wrap gap-2 pt-2 border-top">
            ${requestBtn}
            <a href="${profileUrl}" class="btn btn-outline-secondary btn-sm">פרופיל מלא</a>
          </div>
        </div>
      </div>
    </div>`;
}

function applyFilters() {
  const text = searchInput.value.trim().toLowerCase();
  const topic = topicSelect.value;
  const avail = availSelect.value;

  const filtered = allMentors.filter(m => {
    if (avail === 'available' && m.availability === 'unavailable') return false;
    if (avail === 'unavailable' && m.availability !== 'unavailable') return false;
    if (topic) {
      const hasTopicMatch = (m.expertise || []).some(e => e.toLowerCase().includes(topic.toLowerCase()));
      if (!hasTopicMatch) return false;
    }
    if (text) {
      const haystack = [m.fullName, m.currentRole, m.company, ...(m.expertise || [])]
        .filter(Boolean).join(' ').toLowerCase();
      if (!haystack.includes(text)) return false;
    }
    return true;
  });

  grid.innerHTML = filtered.length
    ? filtered.map(renderCard).join('')
    : '<p class="text-muted mt-3">לא נמצאו מנטורים התואמים את החיפוש.</p>';
}

function populateTopics() {
  const seen = new Set();
  allMentors.forEach(m => (m.expertise || []).forEach(e => seen.add(e)));
  const sorted = [...seen].sort((a, b) => a.localeCompare(b, 'he'));
  sorted.forEach(e => {
    const opt = document.createElement('option');
    opt.value = e;
    opt.textContent = e;
    topicSelect.appendChild(opt);
  });
}

async function init() {
  grid.innerHTML = '<p class="text-muted mt-3">טוען מנטורים...</p>';
  const { ok, data } = await apiFetch('/mentors');
  if (!ok) {
    grid.innerHTML = '<p class="text-danger mt-3">שגיאה בטעינת המנטורים. אנא נסה/י שוב מאוחר יותר.</p>';
    return;
  }
  allMentors = data;
  populateTopics();
  applyFilters();
}

searchInput.addEventListener('input', applyFilters);
topicSelect.addEventListener('change', applyFilters);
availSelect.addEventListener('change', applyFilters);

init();
