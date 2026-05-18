# Collab — Maakaf Members Page Mobile/UX Rework

> orcClaude ↔ maakafClaude ↔ maakafCodex
> Status: KICKOFF
> Merge Policy: `review-required` (orc admin-merges after maakafClaude verifier ✓, no squash per Etan)
> Created: 2026-05-16 by orcClaude (s:57)

---

## GOAL

**Make `https://maakaf.com/he/members/` (and the EN equivalent) hyper-precise + UX-friendly.** Desktop = visual + graspable. Mobile = minimal + navigable. Add personal-vs-non-personal opensource filter, clickable stats line, modal/fullscreen "Open Source PRs" view.

---

## Agents in this collab

| Agent | Role | Pane |
|---|---|---|
| **maakafClaude** | Orchestrator / reviewer / design judge | (new) |
| **maakafCodex** | Implementer (Hugo templates + JS + CSS) | (new) |
| **orcClaude s:57** | Cross-repo coordinator + admin merger | existing |

---

## Etan's brief (verbatim)

> *"Make https://maakaf.com/he/members/ much more mobile friendly, and opensource clarity? I want to be able to click 'open source PRs' button or whatever, a modal/full screen (mobile) opens with personal/owned, and public/companies/whatever distinction.*
>
> *This needs to be hyper precise and UX/UI friendly, desktop more visual and easy to grasp/find what you want, maybe user be able to filter to seeing only contributions of non personal opensource?*
>
> *My example would be none of my layers/orc/golems would show if I filter for non personal, but t3code, nativewind and zed would?*
>
> *And other convenient opensource-native good metrics/links/you get it.*
>
> *And on mobile it would be easy to navigate but minimal and only necessary details.*
>
> *Maybe make the stats line (C:1 | PR:1 | I:0 | PRC:0 | IC:0) clickable for example?*
>
> *I'll be honest, haven't looked at this page on desktop, but it's terrible on mobile."*

---

## Acceptance criteria

### A. Personal vs non-personal filter
- Filter toggle (top of members detail view): **"Show only non-personal opensource"**.
- "Personal" = repos owned by the member or their GitHub user.
- "Non-personal" = repos owned by orgs/companies.
- Detection: `repo.owner` ≠ `member.github_username` AND `repo.owner` NOT IN `member.owned_orgs[]`.
- Etan's worked example: filtering "non-personal" should HIDE `EtanHey/*` (brainlayer, voicelayer, orchestrator, golems) and SHOW `pingdotg/t3code`, `nativewind/nativewind`, `zed-industries/zed`.

### B. Clickable stats line
- Current: `C:1 | PR:1 | I:0 | PRC:0 | IC:0` is plain text.
- New: each metric clickable → filters the repo list below or opens GitHub filtered URL.
- Legend visible on hover (desktop) / tap-tooltip (mobile).

### C. "Open Source PRs" button → modal/fullscreen
- Button below member name/photo.
- Desktop: modal overlay (60-80% viewport, scrollable).
- Mobile: fullscreen sheet (top-to-bottom, swipe-down to close).
- Content: list of opensource PRs, grouped by `personal / non-personal`, sorted by recency. Row = repo · PR title · status · date · link.

### D. Desktop redesign
- Visual: avatars, repo cards with language colors, contribution heatmap if data permits.
- Information density tunable. "Easy to grasp" > "exhaustive."
- Maintain RTL support on `/he/members/`.

### E. Mobile redesign
- Minimal: name · photo · 1-line summary · primary CTA (Open Source PRs).
- Tabs or accordion instead of long scroll.
- No horizontal overflow. No tap targets < 44pt.

### F. Other opensource-native conveniences
- Repo languages with color dot (GitHub linguist palette).
- "Recently active" badge for repos with commits in last 30 days.
- Direct links to issues, PRs, contributors on each card.
- Filter chips for languages.

---

## Current state

- **Stack:** Hugo (extended) + TypeScript prebuild (`fetch-data.ts`) + Docker. NOT Next/Astro/React.
- **Members template:** `layouts/members/members.html`
- **Content:** `content/en/` + `content/he/` (bilingual).
- **No CLAUDE.md or AGENTS.md** — golemsClaude scaffolding in parallel (see `~/Gits/orchestrator/docs.local/handoffs/2026-05-16/maakaf-repogolems-setup.md`).

---

## Phases

### Phase 0: Repo onboarding (parallel, golemsClaude)
Adds maakaf to `/repogolems` registry + CLAUDE.md + AGENTS.md + yash availability.

### Phase 1: Discovery (maakafClaude, ~30 min)
- Read `layouts/members/members.html`, `fetch-data.ts`, `content/{en,he}/members/`.
- Identify data flow, styling system, JS framework.
- BEFORE screenshots (desktop + mobile viewport).
- Post findings here.

### Phase 2: Design (maakafClaude, ~30 min)
- 3 mobile mockups + 2 desktop mockups (text-described or HTML prototype).
- Etan picks via reply.

### Phase 3: Implement (maakafCodex, ~2-3h after design pick)
- Branch: `feat/members-page-mobile-rework`.
- Touch only: `layouts/members/*.html`, `assets/css/members/*`, `assets/js/members/*`.
- TDD (red → green → refactor — failing test FIRST for filter logic).
- Preserve RTL Hebrew layout.

### Phase 4: Review + ship (orc admin-merge)
- maakafClaude verifies diff against acceptance criteria.
- orc opens PR, requests CodeRabbit/Codex/Bugbot review.
- Admin merge no-squash on green.

---

## Task Board

| Task | Owner | Status |
|---|---|---|
| Repo cloned to `~/Gits/maakaf_home` | orc | ✅ done |
| Collab file scaffolded | orc | ✅ done |
| golemsClaude registry add | golemsClaude | ✅ done (Phase 0) |
| CLAUDE.md + AGENTS.md scaffolded | golemsClaude | ✅ done (Phase 0) |
| Phase 1 discovery | maakafClaude | ✅ done — see Findings §Phase 1 |
| Phase 2 design mockups | maakafClaude | ✅ done — see Findings §Phase 2 (Etan picked `Mobile A + Desktop A`, 2026-05-16) |
| Phase 2 design spec (implementer-ready) | maakafClaude | ✅ done — see Findings §Phase 2 Design Spec |
| Phase 3 implementation | maakafCodex (s:110) | ✅ implemented — PR #1 |
| Phase 4 PR review + merge | orc s:57 | ⏳ PR #1 open; bot reviews requested; Netlify API_KEY prereq still needs confirmation |

### Etan's picks (LOCKED 2026-05-16)

1. **EN scope:** `he-only` — ship just `/he/members/`. No `/en/members/` scaffolding.
2. **Personal-detection:** `A` — `owner.toLowerCase() === member.username.toLowerCase()`.
3. **Mockup pair:** `Mobile A` (card stack + bottom-sheet modal) + `Desktop A` (two-column dashboard).
4. **Detection precision tier:** `#1 ship-fast` for v1. `#2 enrichment-in-prebuild` queued as a follow-up patch to `fetch-data.ts` (~30 lines + `data/owner_cache.json`).
5. **Fork treatment:** `filter-only` for v1. No visual fork badge in the UI yet — `isFork` may be used internally if `#2` lands, but not surfaced.

---

## Findings

### Phase 0 — Repo onboarding (golemsClaude)

Completed 2026-05-16.

- ✅ Registered `maakaf` in `~/.config/ralphtools/registry.json` (golems registry, same file as brainlayer/voicelayer/orc).
  - `path`: `/Users/etanheyman/Gits/maakaf_home`
  - `mcps`: `brainlayer`, `exa` (inherits from `golems`)
  - `contexts`: `base`, `skill-index`, `workflow/interactive`, `workflow/rtl`, `workflow/i18n`
  - `clis`: `claude`, `codex`, `cursor`, `gemini`, `kiro`
  - `emoji`: 🌿
- ✅ Regenerated `~/.config/ralphtools/launchers.zsh` via `_ralph_generate_launchers_from_registry`.
- ✅ Launchers verified as shell functions: `maakafClaude`, `maakafCodex`, `maakafCursor` (also `maakafGemini`, `maakafKiro`).
- ✅ `CLAUDE.md` scaffolded at `~/Gits/maakaf_home/CLAUDE.md` (Hugo + TS + Docsy stack, RTL, bilingual, MCPs, collab ref, anti-patterns).
- ✅ `AGENTS.md` scaffolded at `~/Gits/maakaf_home/AGENTS.md` (Codex Cloud review guidelines, no-squash, RTL preservation, TDD mandate, bot review rounds).
- ✅ `/yash` skill globally available via `~/.claude/agents/yash.md` (reachable from this repo).
- ⏭️ Skipped optional `designClaude` registration (Etan said "maybe", not required).

**Commit policy:** registry + launcher changes ship via golems repo `/pr-loop` (`feat(repogolem): register maakaf`). `CLAUDE.md` and `AGENTS.md` left untracked in `maakaf_home/` for `maakafClaude` to handle in their first commit.

**Ready for:** Phase 1 discovery by `maakafClaude` (now in progress / partially complete below).

---

### Phase 1 Discovery — maakafClaude (2026-05-16)

#### (a) Data flow map — where do GitHub stats come from?

```
External API (apiUrl in config.json, X-API-Key auth)
   │
   ▼  (npm run prebuild → npx tsx fetch-data.ts)
data/github_data.json   ← single source of truth, ~36.5K lines
   │
   ▼  (Hugo .Site.Data.github_data at build time)
layouts/members/members.html
   │
   ▼  (jsonify into <script id="usersData">)
Inline vanilla JS reads JSON → drives Chart.js + interactive tables
```

**Top-level keys in `github_data.json`:**
- `users[]` (18 users) — `{ user, repos, summary, rollingActivity }`
- `globalSummary` — totals + `analysisTimeframe`, `minForkCountFilter`
- `repoLeaderboard[]` — aggregated per-repo with `contributorList[]`
- `communityRolling[]` — 6-month rolling totals
- `excludedUsers[]`

**`users[i].user` shape:** `username, displayName, avatarUrl, bio, location, company, blog, twitterUsername, publicRepos, followers, following, accountType, createdAt`

**`users[i].summary` shape:** `totalCommits, totalPRs, totalIssues, totalPRReviews, totalPRComments, totalIssueComments`

**`users[i].repos[i]` shape:** `repoName, description, url, primaryLanguage, primaryLanguageColor, stargazerCount, licenseName, licenseSpdx, topics, commits, pullRequests, issues, prReviews, prComments, issueComments`

#### 🚨 Critical schema notes for Phase 2/3 design

1. **`repo.owner` is NOT a top-level field, but `repoName` is ALWAYS `owner/repo`** (verified across 5+ users):
   - `EtanHey/brainlayer`, `pingdotgg/t3code`, `nativewind/nativewind`, `Maakaf/maakaf_home`, etc.
   - **Owner detection rule:** `owner = repoName.split('/')[0]` (or parse from `url`).
   - No backend schema change required — filter can ship as pure client-side template/JS work.

2. **`member.owned_orgs[]` does NOT exist in the schema.** The acceptance criterion's `repo.owner NOT IN member.owned_orgs[]` must be derived. Two viable approaches:
   - **(A)** Treat "personal" = `owner == member.username` (case-insensitive). Simple, ships immediately.
   - **(B)** Add an opt-in `owned_orgs` list to the YAML page params (per-member override). Future-proof.
   - **Recommendation:** Ship (A) for v1; add (B) as a frontmatter array in `_index.md` later if Etan needs it.

3. **Etan's worked example validates against real data** (verified by reading `etanhey` user):
   - Personal (would be HIDDEN by filter): `EtanHey/brainlayer`
   - Non-personal (would be SHOWN): `pingdotgg/t3code`, `nativewind/nativewind`, `zed-industries/extensions`, `anthropics/claude-code`, `manaflow-ai/cmux`, etc.

4. **Per-repo stats line `C:1 | PR:1 | I:0 | PRC:0 | IC:0`** comes from template loop at `members.html:222` — values are static `<small>` text, not links. Wrapping each metric in an `<a>` or `<button>` is the v1 fix.

#### (b) Styling system

- **Vanilla CSS** at `static/css/members.css` (~700 lines, page-specific).
- **Bootstrap classes** in markup (`container-fluid`, `table`, `d-flex`, `alert`, etc.) — Docsy theme provides Bootstrap 5.
- **SCSS** exists at `assets/scss/_styles_project.scss` + `_variables_project.scss` for global Docsy theming, but the members page itself does NOT use SCSS — it loads the static CSS file directly via `<link rel="stylesheet" href="/css/members.css">`.
- **Theme tokens** via CSS custom properties (`--bg-color`, `--text-color`, `--link-color`, `--chart-*`). Light/dark via `html.light` / `html.dark`.
- **PostCSS pipeline** (autoprefixer + rtlcss) configured but applies to SCSS, not to the static members.css. **Adding new mobile rules to `static/css/members.css` is the simplest path.**
- **Existing mobile breakpoints in members.css:** `@media (max-width: 1200px)`, `(max-width: 768px)`, `(max-width: 600px)` — but they only touch charts + tiny table padding. **No real mobile layout — the giant table still horizontally scrolls.**

#### (c) JS framework

- **NONE.** All interactivity is vanilla JS embedded inside `<script>` tags in `members.html`.
- **Chart.js 4.4.1** via CDN (`cdn.jsdelivr.net`) for the bar charts + rolling-activity line chart.
- **Pattern used today:**
  - `<script id="usersData" type="application/json">{{ $users | jsonify | safeJS }}</script>` injects the data
  - JS reads the JSON, attaches listeners on `DOMContentLoaded`, mutates DOM directly.
  - Sort + search are vanilla DOM manipulation on the rendered `<table>`.
- **Existing modal pattern already present** (`#activityModal`, `#communityGraphModal`) — **can be reused** for the new "Open Source PRs" modal. No new framework needed.

#### (d) BEFORE-state notes

**Route reality check:**
- ❗ `/he/members/` exists. **`/en/members/` does NOT** — only `content/en/_index.md` and `content/en/blog/` exist. The "EN equivalent" mentioned in the brief is currently a 404. Phase 2 scope question for Etan: ship He-only, or scaffold an EN `_index.md`?
- Hugo config: `defaultContentLanguage: he`, `defaultContentLanguageInSubdir: true`, `he` is RTL, EN is LTR. Members page `direction` is currently `ltr` (so the table reads left-to-right even on `/he/`), but the wrapper `<h1>` + description are RTL.

**Desktop BEFORE (textual, from members.html + members.css):**
- Full-width container, dev/info/howto alert stack at top (collapsible "how to add profile" details).
- "Stats banner" of 6 chip cards (`👥 18 Contributors | 📦 N Projects | ⚙️ Commits | 🔀 PRs | 🐛 Issues | 💬 Comments`).
- "Show community activity graph 📊" button → modal with rolling-6mo line chart.
- Big search box → `#contributorsTable` with 8 columns: User, Commits, PRs, Issues, PR Comments, Issue Comments, Activity, Projects.
- Projects column is a `<details>` toggle revealing per-repo `<ul>` with the C/PR/I/PRC/IC stats line as plain `<small>` text.
- Repo Leaderboard table below: 10 columns wide, paginated (25/page), with language filter + sortable headers.
- Two stacked Chart.js bar charts: Top-10 PRs + Top-10 Commits.
- **Visual density: HIGH.** Two giant tables + two bar charts + two modals + community-rolling chart on one page.

**Mobile BEFORE (textual analysis):**
- `.table-container { overflow-x: auto }` → 8-column contributors table and 10-column leaderboard both **horizontally scroll** on mobile. This is the "terrible on mobile" symptom Etan called out.
- `@media (max-width: 600px)` only shrinks font to 13px + reduces avatar to 32px. Layout is unchanged.
- Stats-banner chips will wrap (`flex-wrap`), so the totals row is OK.
- The collapsible "how to add profile" `<details>` block is a wall of Hebrew RTL text + a markdown list — fine on mobile but eats the fold.
- Modals use `min-width: 1100px` (`members.css:640`) — **modals literally cannot render correctly on phones today**. This is a bug already in production for the activity graph.
- Per-row "Activity" 📊 button is a tap target ~28×28px (under the 44pt iOS standard).
- The C/PR/I/PRC/IC compact stats line inside `<details>` is plain text — Etan's specific complaint.

**Existing capabilities to REUSE in Phase 3 (don't rebuild):**
- ✅ Modal CSS scaffolding (`.activity-modal`, `.activity-modal-backdrop`, `.activity-modal-content`) — just needs a mobile-fullscreen variant + `min-width: 1100px` removed/overridden.
- ✅ Vanilla JSON injection pattern via `<script type="application/json">`.
- ✅ Chart.js + theme variables already wired.
- ✅ `.lang-badge` + `.lang-dot` styling already supports the GitHub linguist palette per repo.
- ✅ Per-repo `.topic-pills` rendered in template.
- ✅ Sort + filter mechanics already exist for the leaderboard — can be lifted for the new "personal vs non-personal" filter.

**Risks / gotchas for Phase 3:**
- 🟡 No test infra. `npm test` → `check:links` → `echo IMPLEMENTATION PENDING`. **No Playwright, no Jest, nothing.** TDD mandate for filter logic = need to bring in Playwright (or Vitest for a pure-function `isPersonalRepo()` helper) before any logic change. **Lighter path:** extract filter logic into a tiny `assets/js/members/filter.ts` (or `.js`) testable with `node --test` or a one-off vitest install — avoids full E2E setup.
- 🟡 No `CLAUDE.md` / `AGENTS.md` yet (golemsClaude scaffolding parallel).
- 🟡 EN locale `members` page is non-existent — clarify scope.
- 🟡 RTL constraint: the entire page wrapper sets `dir="ltr"` for the table area (`pageConfig.direction: 'ltr'`), but title + description are RTL. New components (filter chips, "Open Source PRs" button, modal) need to render correctly under both.
- 🟡 Modal `min-width: 1100px` in `members.css:640` — must be overridden, not extended, for the new sheet/modal.

**Recommended Phase 2 mockup directions (preview):**
1. **Mobile A — Card stack with bottom-sheet modal.** Replace contributor table with vertical card list (avatar · name · 1-line bio · primary CTA). "Open Source PRs" opens a fullscreen sheet swiping up from bottom. Filter toggle as a sticky segmented control at top.
2. **Mobile B — Accordion list with inline filter.** Same vertical list, but PRs/projects expand inline as an accordion (no modal — fewer state transitions, but heavier scroll).
3. **Mobile C — Tabbed profile.** Two-line list. Tap → page-route-style transition to a per-member view with tabs (PRs / Repos / Activity), preserving back-navigation via browser history.
4. **Desktop A — Two-column dashboard.** Left: contributor list with filter chips. Right: detail pane with PR list + stats. Modal becomes optional; selection is in-pane.
5. **Desktop B — Enhanced table + side drawer.** Keep current table but tighten columns + open a right-side drawer when "Open Source PRs" is clicked, no full overlay.

Next step for maakafClaude: await Etan's pick on EN scope + mockup direction before Phase 2 finalization.

### Phase 2 Design Spec — LOCKED (Etan pick: Mobile A + Desktop A)

**Scope:** ship `/he/members/` only. Do not scaffold `/en/members/` in v1.

**Detection model:** v1 uses `owner.toLowerCase() === member.username.toLowerCase()` only.
`repo.owner` is derived from `repo.repoName.split('/')[0]`. `member.owned_orgs[]`,
`ownerType`, and `isFork` are follow-up enrichment work, not blockers for this PR.

**Data limitation:** current `data/github_data.json` has repo-level counts but not individual PR title,
status, or date fields. Therefore the v1 "Open Source PRs" view renders repo rows with PR counts and
GitHub deep links to each repo's PR search. Individual PR rows require the queued backend/prebuild
enrichment and are explicitly out of v1 scope.

#### HTML / Template Structure

- Keep `layouts/members/members.html` as the page entrypoint.
- Add a new `members-dashboard` section above the legacy table:
  - `.members-controls`: search input, language filter chips, and non-personal toggle.
  - `.members-layout`: responsive container.
  - `.members-list`: contributor cards. Each `.member-card` carries `data-username`, `data-search`,
    `data-languages`, and summary counts.
  - `.member-detail`: desktop detail pane for the selected contributor.
  - `.member-mobile-actions`: primary "Open Source PRs" CTA on each card.
- Keep the legacy contributors table in the DOM for low-risk fallback and sorting code compatibility, but
  hide it visually on the new responsive layout.
- Add `#ossModal` using the existing modal pattern:
  - desktop: centered overlay, max width around 960px.
  - mobile: fullscreen bottom sheet style with fixed header and scrollable body.

#### CSS Class Names

Use these stable classes so review can map implementation to spec:

- `.members-dashboard`
- `.members-controls`
- `.members-filter-toggle`
- `.members-layout`
- `.members-list`
- `.member-card`
- `.member-card.is-active`
- `.member-summary`
- `.member-stat-grid`
- `.member-stat-button`
- `.member-detail`
- `.repo-filter-bar`
- `.repo-card`
- `.repo-card.is-personal`
- `.repo-card.is-non-personal`
- `.oss-modal`
- `.oss-modal-content`
- `.oss-repo-group`

Minimum tap target for interactive controls: 44px. No horizontal overflow at 375px mobile width.

#### JS Module Shape

Create testable pure logic and thin DOM wiring:

- `static/js/members/filter.js`
  - `getRepoOwner(repo)`
  - `isPersonalRepo(repo, member)`
  - `classifyRepo(repo, member)`
  - `filterRepos(repos, member, filters)`
  - `buildGitHubMetricUrl(repo, metric)`
  - `summarizeRepos(repos, member)`
- `static/js/members/ui.js`
  - reads `#usersData`
  - renders selected contributor detail pane
  - opens/closes `#ossModal`
  - wires non-personal toggle, language chips, search, card selection, and stat buttons

Tests must import `filter.js` directly with Node's built-in test runner. No framework required.

#### Behavior

- Default view shows all repos.
- "Show only non-personal opensource" hides repos where derived owner equals member username.
- Etan regression case:
  - hide: `EtanHey/*`
  - show: `pingdotgg/t3code`, `nativewind/nativewind`, `zed-industries/*`
- Stats buttons:
  - `PR`, `I`, `PRC`, `IC`, `C` buttons are clickable.
  - In page UI they filter/highlight the repo cards by that metric when possible.
  - Deep links use GitHub URLs:
    - PR: `/pulls?q=is%3Apr`
    - Issues: `/issues?q=is%3Aissue`
    - Commits: `/commits`
- Language filter chips are generated from the selected contributor's repo languages.
- Recently active badge is approximated from `repo.commits > 0 || repo.pullRequests > 0 || repo.issues > 0`
  because no per-repo recency timestamp exists in v1 data.
- RTL: page copy remains RTL; repo names, GitHub links, metrics, and code-like labels can remain LTR inside
  their own inline spans.

#### Kickoff for maakafCodex

Implement on `feat/members-page-mobile-rework`. Start with failing Node tests for `filter.js`:

1. Owner extraction from `owner/repo`.
2. Etan case: `EtanHey/brainlayer` personal; `pingdotgg/t3code` non-personal.
3. Non-personal filter hides personal repos and keeps company/org repos.
4. Metric URL builder emits GitHub PR/issue/comment/commit links.

Then wire Hugo/JS/CSS to the locked Mobile A + Desktop A spec. Preserve the existing data schema and do not
touch `fetch-data.ts` in v1.

### Hold readiness — maakafCodex (2026-05-16)

Ready for Phase 3 after Etan picks the Phase 2 design. Build verification completed, with one real blocker:

- `npm install`: first sandboxed run failed with DNS `ENOTFOUND registry.npmjs.org`; approved network rerun succeeded (`added 87 packages`, `audited 88 packages`, `found 0 vulnerabilities`).
- `npm run build`: failed in `prebuild`/`fetch-data.ts` before Hugo with `HTTP error! status: 401 - Unauthorized` from `https://friends-activity-backend-production.up.railway.app/pipeline/v2/analytics/report`. Full build is NOT clean until an authorized API token/config is available.
- Hugo-only check: sandboxed `npm run _build --` failed downloading Hugo modules due DNS for `github.com`; approved network rerun succeeded on Hugo `0.160.1` with `HE 182` pages and `EN 22` pages. Warnings observed: Docsy unrecognized render hook template and Hugo `.Site.Data` deprecation.
- Code familiarization done: members page is `layouts/members/members.html` with inline vanilla JS for search/sort/pagination/Chart.js/modals; data fetch lives in `fetch-data.ts` and writes `data/github_data.json`; source assets currently include icons, SCSS, and guide images, while members page CSS is `static/css/members.css` and no `assets/js/members` or `assets/css/members` files exist yet.
- Next implementation step after design pick: branch `feat/members-page-mobile-rework`, write failing tests first for owner-vs-member repo classification/filtering and clickable stats behavior, then implement with RTL preservation.

### Phase 3 Implementation — maakafCodex (2026-05-16)

Branch: `feat/members-page-mobile-rework`.

PR: https://github.com/EtanHey/maakaf_home/pull/1

Implemented v1 against the locked Mobile A + Desktop A spec:

- Added testable pure logic in `static/js/members/filter.js` for repo owner extraction, personal/non-personal classification, repo filtering, metric URL building, and repo summaries.
- Added TDD coverage in `tests/members/filter.test.js`. RED was verified first with `ERR_MODULE_NOT_FOUND` for the missing module; GREEN passed after adding the module.
- Added `static/js/members/ui.js` to render the two-column dashboard, member cards, selected-member detail pane, language chips, non-personal toggle, clickable metric filters, and OSS modal.
- Updated `layouts/members/members.html` with the new dashboard and `#ossModal`, while preserving existing data injection and Chart.js sections.
- Updated `static/css/members.css` for responsive card stack, desktop detail pane, fullscreen mobile modal, desktop modal overlay, 44px controls, no horizontal overflow, and hidden legacy table/search UI.
- Updated `npm test` to run the new Node tests plus the repo's underlying `_check:links` placeholder, avoiding the `precheck:links` lifecycle path that requires authenticated API fetch.

Verification evidence:

- `npm test`: PASS — 5/5 Node tests passed; `_check:links` printed `IMPLEMENTATION PENDING for check-links`.
- `npm run _build --`: PASS — Hugo `0.160.1`, `HE 182`, `EN 22`, `Static files 34`; existing warnings only: Docsy render hook warning and Hugo `.Site.Data` deprecation.
- Rendered verification via headless Chrome-compatible CDP at `http://127.0.0.1:1314/he/members/`:
  - Mobile 390×844: `horizontalOverflow=false`, modal rect `390×844`, min stat button height `44`.
  - Desktop 1440×1000: `horizontalOverflow=false`, modal rect `960×900`, min stat button height `44`.
  - Etan regression: before filtering included `EtanHey/brainlayer`; after non-personal toggle no repo started with `EtanHey/`; expected org repos remained (`zed-industries/extensions`, `nativewind/nativewind`, `pingdotgg/t3code`).

Known v1 limitation: `data/github_data.json` stores repo-level counts, not individual PR title/status/date rows. The modal therefore lists repos with PR activity and links to GitHub PR searches. Individual PR rows remain queued for the later enrichment/prebuild phase.

---

## Constraints

- **RTL preserved** on `/he/members/`.
- **Hugo template idioms** — no framework swap unless Etan green-lights.
- **No breaking changes** to existing member data schema or `fetch-data.ts` shape.
- **No squash** on merge (per Etan).
- **Brand parity** — colors/fonts match existing maakaf.com look.

---

## Anti-patterns (don't do)

- Adding a JS framework to fix CSS issues.
- Filtering "non-personal" by string-matching repo names (brittle). Use owner-vs-member-username rule.
- Breaking the existing en/he language toggle.
- Auto-merging without orc final review (3-agent verifier pattern).

---

## PR Loop (mandatory per /pr-loop skill — DO NOT REMOVE)

Every phase that produces code MUST go through the full PR Loop. **Mission = MERGED**, not "PR created" or "tests pass".

Canonical sequence: **branch → commit → push → PR → review → fix → merge → cleanup**.

```
1. BRANCH    git checkout master && git pull && git checkout -b feat/members-mobile-rework
2. IMPLEMENT TDD red-green-refactor (see TDD section below)
3. TEST      npm test (check:links) — all must pass
4. VERIFY    Manual mobile-viewport + desktop screenshots BEFORE claiming done
5. COMMIT    git add <specific files> → commit (no -A, no secrets)
6. PUSH      git push -u origin feat/members-mobile-rework
7. PR        gh pr create — request CodeRabbit + Codex + Cursor Bugbot reviews explicitly
8. REVIEW    Read every CRITICAL/HIGH comment. Reply to each (fix or explain).
9. FIX       Address real bugs, push, re-request review (min 2 rounds before merge)
10. MERGE    orc admin-merges no-squash (Etan preference) after maakafClaude verifier ✓
11. CLEANUP  git checkout master && git pull
```

No skipping steps. CodeRabbit critical/high → fix before merge, no exceptions.

---

## TDD Mandate — Red-Green-Refactor (per /superpowers:test-driven-development — DO NOT REMOVE)

For any logic changes (data filtering, owner-vs-member detection, repo classification, stats computations):

1. **RED** — Write the failing test FIRST. Even if Hugo doesn't have unit tests for templates, write a Playwright assertion or visual-regression check that fails on the current state.
2. **GREEN** — Implement the minimum code to make the test pass.
3. **REFACTOR** — Clean up while keeping tests green.

For pure visual/CSS changes where TDD doesn't map cleanly: take BEFORE screenshots (manual or Playwright), make the change, take AFTER screenshots, post the diff to this collab.

**Failing test FIRST is non-negotiable for filter-logic + clickable-stats code paths.** They have real correctness criteria (e.g., "Etan's brainlayer must NOT appear when filter=non-personal, but t3code MUST appear").

---

## MANDATORY SKILLS — HARD GATE (DO NOT REMOVE)

| Skill | When | Why |
|---|---|---|
| `/pr-loop` | Every phase that produces code | The FULL loop through MERGED. Not optional. |
| `/superpowers:test-driven-development` | All logic implementation | RED → GREEN → REFACTOR. Failing test FIRST. |
| `/superpowers:verification-before-completion` | Before claiming "done" | Evidence before assertions. Screenshots count. |
| `/never-fabricate` | Before reporting results | Read() actual files. Run actual commands. No guessing. |

---

## CHECKPOINT PROTOCOL (DO NOT REMOVE)

`brain_store` checkpoint every 3 tasks, after every merge, on blocker, before session-end. Use this collab + BL together.
