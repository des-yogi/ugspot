document.documentElement.className = document.documentElement.className.replace('no-js', 'js');

(function () {
  function canUseWebp() {
    let elem = document.createElement('canvas');
    return !!(elem.getContext && elem.getContext('2d'))
      && elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  function loadBackgroundImage(element, fastScroll) {
    let isWebpSupported = canUseWebp();
    let bgImage = isWebpSupported
      ? element.getAttribute('data-bg-webp')
      : element.getAttribute('data-bg');

    if (bgImage) {
      element.style.backgroundImage = `url(${bgImage})`;
      element.removeAttribute('data-bg');
      element.removeAttribute('data-bg-webp');

      // Читаем скорость из атрибута (по умолчанию 1 сек)
      let speed = parseFloat(element.getAttribute('data-bg-speed')) || 1;
      if (fastScroll) speed *= 0.5; // Ускоряем при быстрой прокрутке

      // Плавное появление
      requestAnimationFrame(() => {
        element.style.transition = `opacity ${speed}s ease-out`;
        element.style.opacity = 1;
      });
    }
  }

  function observeLazyLoad() {
    let lazyElements = document.querySelectorAll('[data-bg], [data-bg-webp]');

    lazyElements.forEach(el => {
      el.style.opacity = '0';
      el.style.willChange = 'opacity';
    });

    let lastTime = performance.now();
    let lastScrollY = window.scrollY;

    if ('IntersectionObserver' in window) {
      let observer = new IntersectionObserver((entries, obs) => {
        let now = performance.now();
        let deltaY = Math.abs(window.scrollY - lastScrollY);
        let deltaT = now - lastTime;
        let speed = deltaY / (deltaT || 1);
        let fastScroll = speed > 1;

        entries.forEach(entry => {
          if (entry.isIntersecting) {
            loadBackgroundImage(entry.target, fastScroll);
            obs.unobserve(entry.target);
          }
        });

        lastTime = now;
        lastScrollY = window.scrollY;
      }, { rootMargin: '0px', threshold: 0.1 });

      lazyElements.forEach(el => observer.observe(el));
    } else {
      lazyElements.forEach(el => loadBackgroundImage(el, false));
    }
  }

  document.addEventListener('DOMContentLoaded', observeLazyLoad);

  /* Разметка:
    // Фон появится за 0.5 секунды
    <div data-bg="/images/image2.jpg" data-bg-webp="/images/image2.webp" data-bg-speed="0.5"></div>

    // Фон появится дефолтно зф 1 сек
    <div data-bg="/img/image.jpg" data-bg-webp="/img/image.webp"></div>
  */

})();



// (function(){
//   // code
// }());

