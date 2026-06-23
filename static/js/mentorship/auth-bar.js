import { getSession, clearSession } from './api.js';

const session = getSession();

if (session) {
  const bar = document.createElement('div');
  bar.className = 'alert alert-info d-flex align-items-center justify-content-between mb-3';
  bar.dir = 'rtl';
  const firstName = session.fullName?.split(' ')[0] ?? session.email;
  bar.innerHTML = `
    <span>שלום, <strong>${firstName}</strong></span>
    <button id="auth-bar-logout" class="btn btn-sm btn-outline-secondary">התנתקות</button>
  `;

  document.addEventListener('DOMContentLoaded', () => {
    const content = document.querySelector('.td-content');
    if (content) content.prepend(bar);

    document.getElementById('auth-bar-logout').addEventListener('click', () => {
      if (!confirm('האם אתם בטוחים שברצונכם להתנתק?')) return;
      clearSession();
      window.location.href = '/he/mentorship/login/';
    });
  });
}
