document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.main-nav');
  const parents = nav.querySelectorAll('.main-nav__item--parent');

  let closeTimeout = null;

  parents.forEach(item => {
    const submenu = item.querySelector('.main-nav__inner');
    if (!submenu) return;

    item.addEventListener('mouseenter', () => {
      clearTimeout(closeTimeout);
      // Закрыть все остальные
      parents.forEach(i => {
        const sm = i.querySelector('.main-nav__inner');
        if (sm && sm !== submenu) sm.classList.remove('active');
      });
      submenu.classList.add('active');
    });

    item.addEventListener('mouseleave', () => {
      closeTimeout = setTimeout(() => {
        submenu.classList.remove('active');
      }, 120);
    });

    submenu.addEventListener('mouseenter', () => {
      clearTimeout(closeTimeout);
      submenu.classList.add('active');
    });
    submenu.addEventListener('mouseleave', () => {
      closeTimeout = setTimeout(() => {
        submenu.classList.remove('active');
      }, 120);
    });
  });

  // Закрывать меню при клике вне навигации
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) {
      parents.forEach(item => {
        const submenu = item.querySelector('.main-nav__inner');
        if (submenu) submenu.classList.remove('active');
      });
    }
  });

  nav.addEventListener('focusout', (e) => {
    // Если фокус ушёл полностью из nav — закрыть все подменю
    if (!nav.contains(e.relatedTarget)) {
      document.querySelectorAll('.main-nav__inner').forEach(inner => {
        inner.classList.remove('active');
      });
    }
  });
});
