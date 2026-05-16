const METRIC_PATHS = {
  commits: 'commits',
  pullRequests: 'pulls?q=is%3Apr',
  issues: 'issues?q=is%3Aissue',
  prComments: 'pulls?q=is%3Apr',
  issueComments: 'issues?q=is%3Aissue',
};

const METRIC_KEYS = ['commits', 'pullRequests', 'issues', 'prComments', 'issueComments'];

export function getRepoOwner(repo) {
  const repoName = String(repo?.repoName || '');
  const slashIndex = repoName.indexOf('/');
  if (slashIndex > 0) return repoName.slice(0, slashIndex);

  try {
    const url = new URL(repo?.url || '');
    const [, owner] = url.pathname.split('/');
    return owner || '';
  } catch {
    return '';
  }
}

export function getMemberUsername(member) {
  return String(member?.user?.username || member?.username || member?.github_username || '');
}

export function isPersonalRepo(repo, member) {
  const owner = getRepoOwner(repo).toLowerCase();
  const username = getMemberUsername(member).toLowerCase();
  return Boolean(owner && username && owner === username);
}

export function classifyRepo(repo, member) {
  return isPersonalRepo(repo, member) ? 'personal' : 'non-personal';
}

export function metricValue(repo, metric) {
  return Number(repo?.[metric]) || 0;
}

export function filterRepos(repos, member, filters = {}) {
  const visibility = filters.visibility || 'all';
  const metric = filters.metric || '';
  const language = filters.language || '';

  return (Array.isArray(repos) ? repos : []).filter((repo) => {
    if (visibility === 'personal' && !isPersonalRepo(repo, member)) return false;
    if (visibility === 'non-personal' && isPersonalRepo(repo, member)) return false;
    if (metric && metricValue(repo, metric) <= 0) return false;
    if (language && (repo.primaryLanguage || '') !== language) return false;
    return true;
  });
}

export function buildGitHubMetricUrl(repo, metric) {
  const base = String(repo?.url || '').replace(/\/+$/, '');
  const path = METRIC_PATHS[metric] || '';
  return path ? `${base}/${path}` : base;
}

export function selectMemberState(currentState, nextUsername) {
  const selectedUsername = String(nextUsername || '');
  const previousUsername = String(currentState?.selectedUsername || '');
  const memberChanged = selectedUsername.toLowerCase() !== previousUsername.toLowerCase();

  return {
    ...currentState,
    selectedUsername,
    language: memberChanged ? '' : (currentState?.language || ''),
  };
}

export function summarizeRepos(repos, member) {
  const summary = {
    personal: 0,
    nonPersonal: 0,
    languages: [],
    totals: {
      commits: 0,
      pullRequests: 0,
      issues: 0,
      prComments: 0,
      issueComments: 0,
    },
  };
  const languages = new Set();

  for (const repo of Array.isArray(repos) ? repos : []) {
    if (isPersonalRepo(repo, member)) summary.personal += 1;
    else summary.nonPersonal += 1;

    if (repo?.primaryLanguage) languages.add(repo.primaryLanguage);

    for (const metric of METRIC_KEYS) {
      summary.totals[metric] += metricValue(repo, metric);
    }
  }

  summary.languages = [...languages].sort((a, b) => a.localeCompare(b));
  return summary;
}

export { METRIC_KEYS };
