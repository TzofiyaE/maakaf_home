import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildGitHubMetricUrl,
  classifyRepo,
  filterRepos,
  getRepoOwner,
  selectMemberState,
  summarizeRepos,
} from '../../static/js/members/filter.js';

const etan = { user: { username: 'EtanHey' } };

const repos = [
  {
    repoName: 'EtanHey/brainlayer',
    url: 'https://github.com/EtanHey/brainlayer',
    primaryLanguage: 'Python',
    commits: 3,
    pullRequests: 2,
    issues: 1,
    prComments: 4,
    issueComments: 5,
  },
  {
    repoName: 'pingdotgg/t3code',
    url: 'https://github.com/pingdotgg/t3code',
    primaryLanguage: 'TypeScript',
    commits: 1,
    pullRequests: 1,
    issues: 0,
    prComments: 0,
    issueComments: 0,
  },
  {
    repoName: 'nativewind/nativewind',
    url: 'https://github.com/nativewind/nativewind',
    primaryLanguage: 'TypeScript',
    commits: 0,
    pullRequests: 3,
    issues: 0,
    prComments: 1,
    issueComments: 0,
  },
];

test('extracts the owner from repoName', () => {
  assert.equal(getRepoOwner({ repoName: 'zed-industries/zed' }), 'zed-industries');
});

test('classifies Etan-owned repos as personal and org repos as non-personal', () => {
  assert.equal(classifyRepo(repos[0], etan), 'personal');
  assert.equal(classifyRepo(repos[1], etan), 'non-personal');
});

test('filters Etan personal repos out of the non-personal view', () => {
  const visible = filterRepos(repos, etan, { visibility: 'non-personal' });

  assert.deepEqual(
    visible.map((repo) => repo.repoName),
    ['pingdotgg/t3code', 'nativewind/nativewind'],
  );
});

test('builds GitHub metric URLs for clickable stats', () => {
  assert.equal(
    buildGitHubMetricUrl(repos[1], 'pullRequests'),
    'https://github.com/pingdotgg/t3code/pulls?q=is%3Apr',
  );
  assert.equal(
    buildGitHubMetricUrl(repos[1], 'issues'),
    'https://github.com/pingdotgg/t3code/issues?q=is%3Aissue',
  );
  assert.equal(
    buildGitHubMetricUrl(repos[1], 'commits'),
    'https://github.com/pingdotgg/t3code/commits',
  );
});

test('summarizes personal and non-personal repo totals separately', () => {
  assert.deepEqual(summarizeRepos(repos, etan), {
    personal: 1,
    nonPersonal: 2,
    languages: ['Python', 'TypeScript'],
    totals: {
      commits: 4,
      pullRequests: 6,
      issues: 1,
      prComments: 5,
      issueComments: 5,
    },
  });
});

test('clears stale language filter when selecting a different member', () => {
  assert.deepEqual(
    selectMemberState(
      { selectedUsername: 'EtanHey', visibility: 'all', metric: 'pullRequests', language: 'Python' },
      'UrielOfir',
    ),
    { selectedUsername: 'UrielOfir', visibility: 'all', metric: 'pullRequests', language: '' },
  );

  assert.deepEqual(
    selectMemberState(
      { selectedUsername: 'EtanHey', visibility: 'all', metric: 'pullRequests', language: 'Python' },
      'EtanHey',
    ),
    { selectedUsername: 'EtanHey', visibility: 'all', metric: 'pullRequests', language: 'Python' },
  );
});
