/**
 * Projects browser — sidebar navigation and pagination for /guides/
 */
(function () {
  const wrap = document.querySelector('.pg-browser__wrap');
  if (!wrap) return;

  const itemsPerPage = parseInt(wrap.dataset.itemsPerPage, 10) || 6;
  const navItems = Array.from(wrap.querySelectorAll('.pg-nav--list .pg-nav__item'));
  const allNavItems = Array.from(wrap.querySelectorAll('.pg-nav__item'));
  const panels = Array.from(wrap.querySelectorAll('.pg-project-panel'));
  const pagination = wrap.querySelector('.pg-pagination');
  const prevBtn = wrap.querySelector('.pg-pagination__btn--prev');
  const nextBtn = wrap.querySelector('.pg-pagination__btn--next');
  const numbersEl = wrap.querySelector('.pg-pagination__numbers');

  let currentPage = 1;
  const totalPages = pagination
    ? parseInt(pagination.dataset.totalPages, 10)
    : Math.ceil(navItems.length / itemsPerPage);

  function pageForIndex(index) {
    return Math.floor(index / itemsPerPage) + 1;
  }

  function getActiveProjectId() {
    const active = allNavItems.find((item) => item.classList.contains('pg-nav__item--active'));
    return active ? active.dataset.projectId : allNavItems[0]?.dataset.projectId;
  }

  function showProject(projectId) {
    panels.forEach((panel) => {
      panel.classList.toggle('d-none', panel.dataset.projectId !== projectId);
    });

    allNavItems.forEach((item) => {
      const isActive = item.dataset.projectId === projectId;
      item.classList.toggle('pg-nav__item--active', isActive);
      item.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    const activeIndex = navItems.findIndex((item) => item.dataset.projectId === projectId);
    if (activeIndex >= 0) {
      currentPage = pageForIndex(activeIndex);
      updateSidebarVisibility();
      updatePagination();
    }

    if (projectId && history.replaceState) {
      history.replaceState(null, '', `#${projectId}`);
    }
  }

  function updateSidebarVisibility() {
    navItems.forEach((item, index) => {
      const onPage = pageForIndex(index) === currentPage;
      item.hidden = !onPage;
    });
  }

  function buildPaginationNumbers() {
    if (!numbersEl) return;
    numbersEl.innerHTML = '';

    for (let page = totalPages; page >= 1; page -= 1) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pg-pagination__num';
      btn.textContent = String(page);
      btn.dataset.page = String(page);
      btn.setAttribute('aria-label', `עמוד ${page}`);
      if (page === currentPage) {
        btn.classList.add('pg-pagination__num--active');
        btn.setAttribute('aria-current', 'page');
      }
      numbersEl.appendChild(btn);
    }
  }

  function updatePagination() {
    if (!pagination) return;

    if (prevBtn) prevBtn.disabled = currentPage <= 1;
    if (nextBtn) nextBtn.disabled = currentPage >= totalPages;

    numbersEl?.querySelectorAll('.pg-pagination__num').forEach((btn) => {
      const page = parseInt(btn.dataset.page, 10);
      const isActive = page === currentPage;
      btn.classList.toggle('pg-pagination__num--active', isActive);
      if (isActive) {
        btn.setAttribute('aria-current', 'page');
      } else {
        btn.removeAttribute('aria-current');
      }
    });
  }

  function goToPage(page) {
    currentPage = Math.max(1, Math.min(page, totalPages));
    updateSidebarVisibility();
    updatePagination();

    const firstVisible = navItems.find((item, index) => pageForIndex(index) === currentPage && !item.hidden);
    if (firstVisible) {
      showProject(firstVisible.dataset.projectId);
    }
  }

  allNavItems.forEach((item) => {
    item.addEventListener('click', () => {
      showProject(item.dataset.projectId);
    });
  });

  prevBtn?.addEventListener('click', () => goToPage(currentPage - 1));
  nextBtn?.addEventListener('click', () => goToPage(currentPage + 1));

  numbersEl?.addEventListener('click', (event) => {
    const btn = event.target.closest('.pg-pagination__num');
    if (!btn) return;
    goToPage(parseInt(btn.dataset.page, 10));
  });

  buildPaginationNumbers();

  const hash = window.location.hash.replace('#', '');
  const hashMatch = allNavItems.find((item) => item.dataset.projectId === hash);
  if (hashMatch) {
    showProject(hash);
  } else {
    const defaultId = getActiveProjectId();
    if (defaultId) {
      showProject(defaultId);
    } else {
      updateSidebarVisibility();
      updatePagination();
    }
  }
})();
