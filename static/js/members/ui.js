import {
  buildGitHubMetricUrl,
  classifyRepo,
  collapseMemberState,
  filterRepos,
  METRIC_KEYS,
  metricValue,
  normalizeMembersViewMode,
  selectMemberState,
  summarizeRepos,
} from './filter.js';

const METRIC_LABELS = {
  commits: 'Commits',
  pullRequests: 'PRs',
  issues: 'Issues',
  prComments: 'PR comments',
  issueComments: 'Issue comments',
};

const METRIC_TITLES = {
  commits: 'Commits',
  pullRequests: 'Pull requests',
  issues: 'Issues',
  prComments: 'PR comments',
  issueComments: 'Issue comments',
};

const state = {
  selectedUsername: '',
  visibility: 'all',
  metric: '',
  language: '',
};

function byId(id) {
  return document.getElementById(id);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function parseUsers() {
  const raw = byId('usersData')?.textContent;
  if (!raw) return [];
  try {
    const users = JSON.parse(raw);
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
}

function userName(member) {
  return member?.user?.displayName || member?.user?.username || 'Unknown';
}

function findUser(users, username) {
  const normalized = String(username || '').toLowerCase();
  return users.find((member) => String(member?.user?.username || '').toLowerCase() === normalized);
}

function repoActivityTotal(repo) {
  return METRIC_KEYS.reduce((total, metric) => total + metricValue(repo, metric), 0);
}

function sortRepos(repos) {
  return [...repos].sort((a, b) => {
    const metricDelta = metricValue(b, 'pullRequests') - metricValue(a, 'pullRequests');
    if (metricDelta) return metricDelta;
    return repoActivityTotal(b) - repoActivityTotal(a);
  });
}

function repoStatsMarkup(repo, member) {
  return METRIC_KEYS.map((metric) => {
    const value = metricValue(repo, metric);
    const href = buildGitHubMetricUrl(repo, metric, member);
    return `
      <a class="member-stat-button repo-stat-link" href="${escapeHtml(href)}" target="_blank" rel="noopener" title="${escapeHtml(METRIC_TITLES[metric])}">
        <span>${METRIC_LABELS[metric]}</span><strong>${value}</strong>
      </a>
    `;
  }).join('');
}

function repoCardMarkup(repo, member) {
  const classification = classifyRepo(repo, member);
  const language = repo.primaryLanguage
    ? `<span class="lang-badge"><span class="lang-dot" style="background:${escapeHtml(repo.primaryLanguageColor || '#888')}"></span>${escapeHtml(repo.primaryLanguage)}</span>`
    : '';
  const topics = Array.isArray(repo.topics) && repo.topics.length
    ? `<div class="topic-pills">${repo.topics.slice(0, 5).map((topic) => `<span class="topic-pill">${escapeHtml(topic)}</span>`).join('')}</div>`
    : '';
  const activeBadge = repoActivityTotal(repo) > 0 ? '<span class="repo-badge">Recently active</span>' : '';

  return `
    <article class="repo-card is-${classification}" data-repo-classification="${classification}" data-language="${escapeHtml(repo.primaryLanguage || '')}">
      <div class="repo-card-top">
        <div>
          <a href="${escapeHtml(repo.url)}" target="_blank" rel="noopener" class="repo-name">${escapeHtml(repo.repoName)}</a>
          <span class="repo-kind">${classification === 'personal' ? 'Personal' : 'Non-personal'}</span>
        </div>
        ${activeBadge}
      </div>
      ${repo.description ? `<p class="repo-description">${escapeHtml(repo.description)}</p>` : ''}
      <div class="repo-meta">
        ${language}
        ${repo.stargazerCount ? `<span title="Stars">★ ${Number(repo.stargazerCount)}</span>` : ''}
        ${repo.licenseName ? `<span>${escapeHtml(repo.licenseName)}</span>` : ''}
      </div>
      ${topics}
      <div class="member-stat-grid" aria-label="Repository metrics">
        ${repoStatsMarkup(repo, member)}
      </div>
    </article>
  `;
}

function setSelectedCard(username) {
  document.querySelectorAll('.member-card').forEach((card) => {
    card.classList.toggle('is-active', card.dataset.username === username);
  });
}

function clearInlineDetails() {
  document.querySelectorAll('[data-member-inline-detail]').forEach((inlineDetail) => {
    inlineDetail.innerHTML = '';
  });
}

function collapseSelectedMember() {
  setSelectedCard('');
  clearInlineDetails();
  const detail = byId('memberDetail');
  if (detail) detail.innerHTML = '<div class="member-detail-empty">בחרו חבר או חברה כדי לראות תרומות קוד פתוח.</div>';
}

function renderLanguageChips(member, summary) {
  const languages = summary.languages;
  if (!languages.length) return '';

  const chips = [
    `<button type="button" class="repo-filter-chip${state.language ? '' : ' is-active'}" data-filter-language="">All languages</button>`,
    ...languages.map((language) => `
      <button type="button" class="repo-filter-chip${state.language === language ? ' is-active' : ''}" data-filter-language="${escapeHtml(language)}">
        ${escapeHtml(language)}
      </button>
    `),
  ];

  return `<div class="repo-filter-bar" aria-label="Language filters">${chips.join('')}</div>`;
}

function renderMetricFilters(member) {
  const summary = member.summary || {};
  return `
    <div class="member-stat-grid" aria-label="Metric filters">
      ${METRIC_KEYS.map((metric) => {
        const valueKey = metric === 'pullRequests' ? 'totalPRs'
          : metric === 'prComments' ? 'totalPRComments'
            : metric === 'issueComments' ? 'totalIssueComments'
              : metric === 'commits' ? 'totalCommits'
                : 'totalIssues';
        const value = Number(summary[valueKey]) || 0;
        return `
          <button type="button" class="member-stat-button${state.metric === metric ? ' is-active' : ''}" data-detail-metric="${metric}" title="${escapeHtml(METRIC_TITLES[metric])}">
            <span>${METRIC_LABELS[metric]}</span><strong>${value}</strong>
          </button>
        `;
      }).join('')}
    </div>
  `;
}

function detailMarkup(member, summary, visibleRepos) {
  return `
    <div class="member-detail-toolbar">
      <button type="button" class="member-detail-close" data-member-collapse aria-label="סגירת כרטיס">סגור</button>
    </div>
    <div class="member-detail-header">
      <img src="${escapeHtml(member.user.avatarUrl)}" alt="${escapeHtml(member.user.username)}" class="member-detail-avatar" />
      <div>
        <p class="member-detail-kicker">Open source activity</p>
        <h2>${escapeHtml(userName(member))}</h2>
        <p class="member-detail-meta">@${escapeHtml(member.user.username)}${member.user.location ? ` · ${escapeHtml(member.user.location)}` : ''}</p>
      </div>
    </div>
    ${member.user.bio ? `<p class="member-detail-bio">${escapeHtml(member.user.bio)}</p>` : ''}
    <div class="member-detail-counts">
      <span>${summary.nonPersonal} non-personal</span>
      <span>${summary.personal} personal</span>
      <span>${visibleRepos.length} visible</span>
    </div>
    ${renderMetricFilters(member)}
    ${renderLanguageChips(member, summary)}
    <div class="member-detail-actions">
      <button type="button" class="member-oss-button" data-oss-open="${escapeHtml(member.user.username)}">Open Source PRs</button>
      <a class="member-github-link" href="https://github.com/${escapeHtml(member.user.username)}" target="_blank" rel="noopener">GitHub profile</a>
    </div>
    <div class="member-repo-list">
      ${visibleRepos.length
        ? visibleRepos.map((repo) => repoCardMarkup(repo, member)).join('')
        : '<p class="member-detail-empty">No repos match the current filters.</p>'}
    </div>
  `;
}

function renderDetail(users) {
  const detail = byId('memberDetail');
  if (!detail) return;

  if (!state.selectedUsername) {
    collapseSelectedMember();
    return;
  }

  const member = findUser(users, state.selectedUsername) || users[0];
  if (!member) return;
  state.selectedUsername = member.user.username;
  setSelectedCard(member.user.username);

  const repos = Array.isArray(member.repos) ? member.repos : [];
  const summary = summarizeRepos(repos, member);
  const visibleRepos = sortRepos(filterRepos(repos, member, {
    visibility: state.visibility,
    metric: state.metric,
    language: state.language,
  }));
  const markup = detailMarkup(member, summary, visibleRepos);

  detail.innerHTML = markup;
  document.querySelectorAll('[data-member-inline-detail]').forEach((inlineDetail) => {
    inlineDetail.innerHTML = inlineDetail.getAttribute('data-member-inline-detail') === member.user.username ? markup : '';
  });
}

function groupPrRepos(member) {
  const repos = sortRepos(filterRepos(member.repos || [], member, {
    visibility: state.visibility,
    metric: 'pullRequests',
    language: state.language,
  }));
  return {
    personal: repos.filter((repo) => classifyRepo(repo, member) === 'personal'),
    nonPersonal: repos.filter((repo) => classifyRepo(repo, member) === 'non-personal'),
  };
}

function modalGroupMarkup(title, repos, member) {
  return `
    <section class="oss-repo-group">
      <h4>${escapeHtml(title)}</h4>
      ${repos.length ? repos.map((repo) => repoCardMarkup(repo, member)).join('') : '<p class="member-detail-empty">No PR activity in this group.</p>'}
    </section>
  `;
}

function openOssModal(users, username) {
  const member = findUser(users, username);
  const modal = byId('ossModal');
  const title = byId('ossModalTitle');
  const summary = byId('ossModalSummary');
  const body = byId('ossModalBody');
  if (!member || !modal || !title || !summary || !body) return;

  state.selectedUsername = member.user.username;
  renderDetail(users);

  const grouped = groupPrRepos(member);
  const totalPrRepos = grouped.personal.length + grouped.nonPersonal.length;
  title.textContent = `${userName(member)} — Open Source PRs`;
  summary.textContent = `${totalPrRepos} repositories with PR activity. V1 links to GitHub PR searches because the snapshot stores repo-level counts, not individual PR rows.`;
  body.innerHTML = [
    modalGroupMarkup('Non-personal / org repos', grouped.nonPersonal, member),
    modalGroupMarkup('Personal repos', grouped.personal, member),
  ].join('');

  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden', 'false');
  document.documentElement.classList.add('members-modal-open');
}

function closeOssModal() {
  const modal = byId('ossModal');
  if (!modal) return;
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden', 'true');
  document.documentElement.classList.remove('members-modal-open');
}

function wireCards(users) {
  document.querySelectorAll('[data-member-select]').forEach((control) => {
    control.addEventListener('click', () => {
      Object.assign(state, selectMemberState(state, control.getAttribute('data-member-select') || state.selectedUsername));
      const metric = control.getAttribute('data-member-metric');
      if (metric) state.metric = state.metric === metric ? '' : metric;
      renderDetail(users);
    });
  });
}

function wireDetail(users) {
  byId('membersDashboard')?.addEventListener('click', (event) => {
    if (event.target.closest('[data-member-collapse]')) {
      Object.assign(state, collapseMemberState(state));
      collapseSelectedMember();
      return;
    }

    const metricButton = event.target.closest('[data-detail-metric]');
    if (metricButton) {
      const metric = metricButton.getAttribute('data-detail-metric');
      state.metric = state.metric === metric ? '' : metric;
      renderDetail(users);
      return;
    }

    const languageButton = event.target.closest('[data-filter-language]');
    if (languageButton) {
      state.language = languageButton.getAttribute('data-filter-language') || '';
      renderDetail(users);
    }
  });
}

function memberSearchText(member) {
  const user = member?.user || {};
  const repoText = (member?.repos || []).flatMap((repo) => [
    repo.repoName,
    repo.description,
    repo.primaryLanguage,
    repo.licenseName,
    ...(Array.isArray(repo.topics) ? repo.topics : []),
  ]);

  return [
    user.displayName,
    user.username,
    user.bio,
    user.company,
    user.location,
    ...repoText,
  ].filter(Boolean).join(' ').toLowerCase();
}

function wireSearch(users) {
  const input = byId('memberSearchInput');
  const searchByUsername = new Map(users.map((member) => [
    String(member?.user?.username || '').toLowerCase(),
    memberSearchText(member),
  ]));

  input?.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    document.querySelectorAll('.member-card').forEach((card) => {
      const text = searchByUsername.get(String(card.dataset.username || '').toLowerCase()) || String(card.dataset.search || '').toLowerCase();
      card.hidden = query ? !text.includes(query) : false;
    });
  });
}

function wireGlobalFilters(users) {
  const toggle = byId('nonPersonalOnlyToggle');
  toggle?.addEventListener('change', () => {
    state.visibility = toggle.checked ? 'non-personal' : 'all';
    renderDetail(users);
  });
}

function setViewMode(mode) {
  const normalized = normalizeMembersViewMode(mode);
  document.documentElement.classList.toggle('members-view-modern', normalized === 'modern');
  document.documentElement.classList.toggle('members-view-legacy', normalized === 'legacy');
  document.querySelectorAll('[data-members-view]').forEach((button) => {
    const isActive = button.getAttribute('data-members-view') === normalized;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
}

function wireViewMode() {
  setViewMode();
  document.querySelectorAll('[data-members-view]').forEach((button) => {
    button.addEventListener('click', () => {
      setViewMode(button.getAttribute('data-members-view'));
    });
  });
}

function wireModal(users) {
  document.addEventListener('click', (event) => {
    const openButton = event.target.closest('[data-oss-open]');
    if (openButton) {
      openOssModal(users, openButton.getAttribute('data-oss-open'));
      return;
    }

    if (event.target.closest('[data-oss-close]')) {
      closeOssModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeOssModal();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const users = parseUsers();
  if (!users.length) return;

  const activeCard = document.querySelector('.member-card.is-active') || document.querySelector('.member-card');
  state.selectedUsername = activeCard?.dataset.username || users[0]?.user?.username || '';
  wireCards(users);
  wireDetail(users);
  wireSearch(users);
  wireGlobalFilters(users);
  wireViewMode();
  wireModal(users);
  renderDetail(users);
});
