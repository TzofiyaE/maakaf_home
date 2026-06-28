const CARDS_PER_VIEW = {
  desktop: 3,
  tablet: 2,
  mobile: 1,
};

function getCardsPerView() {
  if (window.matchMedia("(max-width: 575.98px)").matches) {
    return CARDS_PER_VIEW.mobile;
  }
  if (window.matchMedia("(max-width: 991.98px)").matches) {
    return CARDS_PER_VIEW.tablet;
  }
  return CARDS_PER_VIEW.desktop;
}

class ArticlesCarousel {
  constructor(root) {
    this.root = root;
    this.track = root.querySelector("[data-track]");
    this.prevBtn = root.querySelector("[data-prev]");
    this.nextBtn = root.querySelector("[data-next]");
    this.cards = [...this.track.children];
    this.page = 0;
    this.perView = getCardsPerView();

    this.prevBtn.addEventListener("click", () => this.goTo(this.page - 1));
    this.nextBtn.addEventListener("click", () => this.goTo(this.page + 1));
    window.addEventListener("resize", () => this.handleResize());

    this.update();
  }

  get maxPage() {
    return Math.max(0, Math.ceil(this.cards.length / this.perView) - 1);
  }

  handleResize() {
    const nextPerView = getCardsPerView();
    if (nextPerView !== this.perView) {
      this.perView = nextPerView;
      this.page = Math.min(this.page, this.maxPage);
    }
    this.update();
  }

  goTo(page) {
    this.page = Math.max(0, Math.min(page, this.maxPage));
    this.update();
  }

  update() {
    if (!this.cards.length) {
      return;
    }

    const gap = Number.parseFloat(getComputedStyle(this.track).gap) || 32;
    const cardWidth = this.cards[0].getBoundingClientRect().width;
    const shift = this.page * this.perView * (cardWidth + gap);

    this.track.style.transform = `translateX(${shift}px)`;
    this.prevBtn.disabled = this.page === 0;
    this.nextBtn.disabled = this.page >= this.maxPage;

    this.prevBtn.classList.toggle(
      "maakaf-articles-carousel__nav-btn--active",
      this.page > 0,
    );
    this.nextBtn.classList.toggle(
      "maakaf-articles-carousel__nav-btn--active",
      this.page < this.maxPage,
    );
  }
}

for (const root of document.querySelectorAll("[data-articles-carousel]")) {
  if (root.dataset.initialized) {
    continue;
  }
  root.dataset.initialized = "true";
  new ArticlesCarousel(root);
}
