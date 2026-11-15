'use strict';
document.addEventListener('DOMContentLoaded', () => {
  const menu = document.querySelector('[data-menu-toggle]');
  if (menu) {
    menu.addEventListener('click', () => {
      const open = document.body.classList.toggle('sidebar-open');
      menu.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        document.body.classList.remove('sidebar-open');
        menu.setAttribute('aria-expanded', 'false');
      }
    });
  }
  document.querySelectorAll('form[data-confirm]').forEach(form => {
    form.addEventListener('submit', e => {
      if (!window.confirm(form.getAttribute('data-confirm'))) e.preventDefault();
    });
  });
});
