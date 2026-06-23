/**
 * Renders numbered pagination controls for Maakaf data tables.
 * @param {HTMLElement} container
 * @param {{ currentPage: number, totalPages: number, onPageChange: (page: number) => void, labels?: { prev?: string, next?: string } }} options
 */
window.MaakafTablePagination = {
  render(container, options) {
    if (!container) return;

    const { currentPage, totalPages, onPageChange } = options;
    const labels = {
      prev: options.labels?.prev || '« Prev',
      next: options.labels?.next || 'Next »',
    };

    if (totalPages <= 1) {
      container.hidden = true;
      container.innerHTML = '';
      return;
    }

    container.hidden = false;
    container.innerHTML = '';

    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'maakaf-table-pagination__btn maakaf-table-pagination__btn--nav';
    prevBtn.textContent = labels.prev;
    prevBtn.disabled = currentPage <= 1;
    prevBtn.addEventListener('click', () => onPageChange(currentPage - 1));
    container.appendChild(prevBtn);

    this._pageRange(currentPage, totalPages).forEach((item) => {
      if (item === '...') {
        const dots = document.createElement('span');
        dots.className = 'maakaf-table-pagination__ellipsis';
        dots.textContent = '...';
        dots.setAttribute('aria-hidden', 'true');
        container.appendChild(dots);
        return;
      }

      const pageBtn = document.createElement('button');
      pageBtn.type = 'button';
      pageBtn.className = 'maakaf-table-pagination__btn';
      if (item === currentPage) pageBtn.classList.add('is-active');
      pageBtn.textContent = String(item);
      pageBtn.setAttribute('aria-label', 'Page ' + item);
      if (item === currentPage) pageBtn.setAttribute('aria-current', 'page');
      pageBtn.addEventListener('click', () => {
        if (item !== currentPage) onPageChange(item);
      });
      container.appendChild(pageBtn);
    });

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'maakaf-table-pagination__btn maakaf-table-pagination__btn--nav';
    nextBtn.textContent = labels.next;
    nextBtn.disabled = currentPage >= totalPages;
    nextBtn.addEventListener('click', () => onPageChange(currentPage + 1));
    container.appendChild(nextBtn);
  },

  _pageRange(current, total) {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const range = [];
    let prev = 0;

    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - 1 && i <= current + 1)) {
        if (prev && i - prev === 2) {
          range.push(prev + 1);
        } else if (prev && i - prev !== 1) {
          range.push('...');
        }
        range.push(i);
        prev = i;
      }
    }

    return range;
  },
};
