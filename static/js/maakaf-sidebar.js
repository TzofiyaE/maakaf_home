/**
 * Maakaf sidebar — accordion toggle for section navigation.
 */
(function () {
  const sidebar = document.querySelector('.maakaf-sidebar');
  if (!sidebar) return;

  const accordion = sidebar.querySelector('.maakaf-sidebar__accordion');
  const toggle = sidebar.querySelector('.maakaf-sidebar__item--toggle');
  if (!accordion || !toggle) return;

  function setOpen(open) {
    accordion.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  toggle.addEventListener('click', () => {
    setOpen(!accordion.classList.contains('is-open'));
  });
})();
