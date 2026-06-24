import { getSession, authedFetch } from './api.js';

const POLL_INTERVAL_MS = 30_000;
const TYPE_ICON = {
  new_request:      '📨',
  request_response: '📬',
};

// ─── State ────────────────────────────────────────────────────────────────────

let notifications  = [];
let isOpen         = false;
let pollTimer      = null;
let bellBtn        = null;
let badge          = null;
let dropdown       = null;

// ─── API ─────────────────────────────────────────────────────────────────────

async function fetchNotifications() {
  const { ok, data } = await authedFetch('/notifications');
  if (ok && Array.isArray(data)) {
    notifications = data;
    render();
  }
}

async function markRead(id) {
  await authedFetch(`/notifications/${id}/read`, { method: 'PATCH' });
  const n = notifications.find(n => n.id === id);
  if (n) n.read = true;
  render();
}

async function markAllRead() {
  await authedFetch('/notifications/read-all', { method: 'POST' });
  notifications.forEach(n => { n.read = true; });
  render();
}

// ─── Render ───────────────────────────────────────────────────────────────────

function unreadCount() {
  return notifications.filter(n => !n.read).length;
}

function formatDate(ts) {
  if (!ts) return '';
  const ms = (ts._seconds ?? ts.seconds ?? 0) * 1000;
  return new Date(ms).toLocaleDateString('he-IL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function render() {
  const count = unreadCount();

  // Badge
  badge.textContent  = count > 9 ? '9+' : String(count);
  badge.style.display = count > 0 ? 'flex' : 'none';
  bellBtn.setAttribute('aria-label', `התראות${count > 0 ? ` (${count} חדשות)` : ''}`);

  if (!isOpen) return;

  // Dropdown list
  const listEl = dropdown.querySelector('.notif-list');
  if (!listEl) return;

  if (notifications.length === 0) {
    listEl.innerHTML = '<li class="notif-empty">אין התראות</li>';
    return;
  }

  const NOTIF_DASHBOARD = {
    new_request:      '/he/mentorship/mentor-dashboard/',
    request_response: '/he/mentorship/mentee-dashboard/',
  };

  listEl.innerHTML = notifications.map(n => {
    const icon = TYPE_ICON[n.type] ?? '🔔';
    const readClass = n.read ? 'notif-item--read' : '';
    const base = NOTIF_DASHBOARD[n.type] ?? '/he/mentorship/';
    const href = n.requestId ? `${base}#req-${n.requestId}` : base;
    return `
      <li class="notif-item ${readClass}" data-id="${n.id}" data-href="${href}">
        <span class="notif-icon" aria-hidden="true">${icon}</span>
        <div class="notif-text">
          <div class="notif-title">${escapeHtml(n.title)}</div>
          <div class="notif-body">${escapeHtml(n.body)}</div>
          <div class="notif-date">${formatDate(n.createdAt)}</div>
        </div>
        ${!n.read ? '<span class="notif-dot" aria-hidden="true"></span>' : ''}
      </li>`;
  }).join('');

  listEl.querySelectorAll('.notif-item').forEach(el => {
    el.addEventListener('click', async () => {
      if (!el.classList.contains('notif-item--read')) {
        await markRead(el.dataset.id);
      }
      closeDropdown();
      window.location.href = el.dataset.href;
    }, { once: true });
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// ─── Dropdown open / close ────────────────────────────────────────────────────

function openDropdown() {
  isOpen = true;
  dropdown.hidden = false;
  bellBtn.setAttribute('aria-expanded', 'true');
  render();
}

function closeDropdown() {
  isOpen = false;
  dropdown.hidden = true;
  bellBtn.setAttribute('aria-expanded', 'false');
}

function toggleDropdown() {
  if (isOpen) {
    closeDropdown();
  } else {
    openDropdown();
  }
}

// ─── Build DOM ────────────────────────────────────────────────────────────────

function buildBell() {
  // Bell button
  bellBtn = document.createElement('button');
  bellBtn.type = 'button';
  bellBtn.className = 'notif-bell';
  bellBtn.setAttribute('aria-haspopup', 'true');
  bellBtn.setAttribute('aria-expanded', 'false');
  bellBtn.setAttribute('aria-label', 'התראות');
  bellBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
         stroke-linejoin="round" aria-hidden="true">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>`;

  badge = document.createElement('span');
  badge.className = 'notif-badge';
  badge.setAttribute('aria-hidden', 'true');
  badge.style.display = 'none';
  bellBtn.appendChild(badge);

  // Dropdown panel
  dropdown = document.createElement('div');
  dropdown.className = 'notif-dropdown';
  dropdown.setAttribute('role', 'dialog');
  dropdown.setAttribute('aria-label', 'התראות');
  dropdown.hidden = true;
  dropdown.dir = 'rtl';
  dropdown.innerHTML = `
    <div class="notif-header">
      <span class="notif-header__title">התראות</span>
      <button type="button" class="notif-mark-all btn btn-link btn-sm p-0">סמן הכל כנקרא</button>
    </div>
    <ul class="notif-list" role="list"></ul>`;

  dropdown.querySelector('.notif-mark-all').addEventListener('click', () => {
    markAllRead();
  });

  // Wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'notif-wrapper';
  wrapper.appendChild(bellBtn);
  wrapper.appendChild(dropdown);

  bellBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDropdown();
  });

  document.addEventListener('click', (e) => {
    if (isOpen && !wrapper.contains(e.target)) closeDropdown();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closeDropdown();
  });

  return wrapper;
}

// ─── Mount ────────────────────────────────────────────────────────────────────

function mount() {
  const session = getSession();
  if (!session) return;

  const bellMount = document.getElementById('bell-mount');
  if (!bellMount) return;

  const wrapper = buildBell();
  bellMount.replaceWith(wrapper);

  injectStyles();
  fetchNotifications();

  pollTimer = setInterval(fetchNotifications, POLL_INTERVAL_MS);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      fetchNotifications();
    }
  });
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function injectStyles() {
  if (document.getElementById('notif-styles')) return;
  const style = document.createElement('style');
  style.id = 'notif-styles';
  style.textContent = `
    .notif-wrapper {
      position: relative;
      display: inline-flex;
      align-items: center;
    }

    .notif-bell {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      padding: 0;
      background: transparent;
      border: none;
      border-radius: 50%;
      color: #d97706;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }
    .notif-bell:hover,
    .notif-bell[aria-expanded="true"] {
      background: rgba(217,119,6,0.12);
      color: #b45309;
    }

    .notif-badge {
      position: absolute;
      top: 2px;
      right: 2px;
      min-width: 17px;
      height: 17px;
      padding: 0 4px;
      background: #dc3545;
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      line-height: 17px;
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }

    .notif-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%);
      width: 320px;
      max-height: 420px;
      background: var(--bs-body-bg, #fff);
      border: 1px solid rgba(0,0,0,.12);
      border-radius: 10px;
      box-shadow: 0 8px 24px rgba(0,0,0,.14);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      z-index: 1050;
    }

    .notif-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 14px 10px;
      border-bottom: 1px solid rgba(0,0,0,.08);
      flex-shrink: 0;
    }
    .notif-header__title {
      font-weight: 600;
      font-size: 14px;
    }
    .notif-mark-all {
      font-size: 12px;
      color: #0d6efd;
      text-decoration: none;
    }
    .notif-mark-all:hover { text-decoration: underline; }

    .notif-list {
      list-style: none;
      margin: 0;
      padding: 0;
      overflow-y: auto;
      flex: 1;
    }

    .notif-empty {
      padding: 24px;
      text-align: center;
      color: #888;
      font-size: 13px;
    }

    .notif-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 12px 14px;
      border-bottom: 1px solid rgba(0,0,0,.05);
      cursor: pointer;
      transition: background 0.12s;
      position: relative;
    }
    .notif-item:last-child { border-bottom: none; }
    .notif-item:hover { background: rgba(13,110,253,.05); }
    .notif-item--read { opacity: 0.65; }
    .notif-item--read:hover { background: rgba(13,110,253,.03); }

    .notif-icon {
      font-size: 18px;
      flex-shrink: 0;
      margin-top: 1px;
    }

    .notif-text { flex: 1; min-width: 0; }

    .notif-title {
      font-size: 13px;
      font-weight: 600;
      line-height: 1.35;
      margin-bottom: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .notif-body {
      font-size: 12px;
      color: #555;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .notif-date {
      font-size: 11px;
      color: #999;
      margin-top: 4px;
    }

    .notif-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #0d6efd;
      flex-shrink: 0;
      margin-top: 5px;
    }
  `;
  document.head.appendChild(style);
}

// ─── Init ─────────────────────────────────────────────────────────────────────

// Module scripts run before DOMContentLoaded fires, so auth-bar.js's DOMContentLoaded
// handler (which inserts the bar) hasn't run yet when this module executes.
// Always defer to DOMContentLoaded so auth-bar.js inserts the bar first.
document.addEventListener('DOMContentLoaded', mount);
