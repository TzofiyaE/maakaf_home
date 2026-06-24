import { getSession, clearSession } from './api.js';

const session = getSession();

if (session) {
  const bar = document.createElement('div');
  bar.className = 'ms-auth-bar';
  bar.dir = 'rtl';
  const firstName = session.fullName?.split(' ')[0] ?? session.email;
  bar.innerHTML = `
    <span class="ms-auth-bar__greeting">שלום, <strong>${firstName}</strong></span>
    <button id="auth-bar-logout" class="ms-auth-bar__logout">התנתקות</button>
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
