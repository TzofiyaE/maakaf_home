import { apiFetch } from './api.js';

const statusDiv = document.getElementById('mentor-status');
const profileDiv = document.getElementById('mentor-profile');

function showError(msg) {
  statusDiv.innerHTML = `<div class="alert alert-warning">${msg}</div>`;
}

function getInitials(name) {
  return (name || '').split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

const mentorId = new URLSearchParams(window.location.search).get('mentorId');

if (!mentorId) {
  showError('לא נבחר מנטור. <a href="/he/mentorship/">חזרה לספרייה</a>');
} else {
  (async () => {
    const { ok, data } = await apiFetch(`/mentors/${mentorId}`);

    if (!ok) {
      showError('המנטור לא נמצא. <a href="/he/mentorship/">חזרה לספרייה</a>');
      return;
    }

    document.title = `${data.fullName} | מנטורינג מעקף`;

    document.getElementById('mentor-avatar').textContent = getInitials(data.fullName);
    document.getElementById('mentor-name').textContent = data.fullName;

    const parts = [data.currentRole, data.company ? `@ ${data.company}` : null].filter(Boolean);
    document.getElementById('mentor-subtitle').textContent = parts.join(' ');

    document.getElementById('mentor-expertise').innerHTML = (data.expertise || [])
      .map(e => `<span class="badge bg-primary me-1 mb-1">${e}</span>`)
      .join('');

    const available = data.availability !== 'unavailable';
    document.getElementById('mentor-avail-badge').innerHTML = available
      ? '<span class="badge bg-success">פנוי/ה למנטורינג</span>'
      : '<span class="badge bg-secondary">עומס מלא כרגע</span>';

    if (data.yearsExperience) {
      document.getElementById('mentor-years').textContent = `${data.yearsExperience} שנות ניסיון`;
    }

    const LINKEDIN_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z"/></svg>`;
    const socialDiv = document.getElementById('mentor-social');
    if (data.linkedIn) {
      socialDiv.innerHTML += `<a href="${data.linkedIn}" target="_blank" rel="noopener" class="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1">${LINKEDIN_ICON} LinkedIn</a>`;
    }
    if (data.calendlyUrl) {
      socialDiv.innerHTML += `<a href="${data.calendlyUrl}" target="_blank" rel="noopener" class="btn btn-outline-secondary btn-sm">📅 תיאום פגישה</a>`;
    }

    const btn = document.getElementById('mentor-request-btn');
    if (available) {
      btn.href = `/he/mentorship/request/?mentorId=${mentorId}&mentorName=${encodeURIComponent(data.fullName)}`;
    } else {
      btn.classList.replace('btn-primary', 'btn-secondary');
      btn.setAttribute('disabled', 'disabled');
      btn.removeAttribute('href');
      btn.textContent = 'לא פנוי/ה כרגע';
    }

    profileDiv.hidden = false;
  })();
}
