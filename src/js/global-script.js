document.documentElement.className = document.documentElement.className.replace('no-js', 'js');

(function () {
  function canUseWebp() {
    let elem = document.createElement("canvas");
    return !!(elem.getContext && elem.getContext("2d")) &&
      elem.toDataURL("image/webp").indexOf("data:image/webp") === 0;
  }

  function loadBackgroundImage(element, fastScroll) {
    let isWebpSupported = canUseWebp();
    let bgImage = isWebpSupported
      ? element.getAttribute("data-bg-webp")
      : element.getAttribute("data-bg");

    if (bgImage) {
      element.style.backgroundImage = `url(${bgImage})`;
      element.removeAttribute("data-bg");
      element.removeAttribute("data-bg-webp");

      let speed = parseFloat(element.getAttribute("data-bg-speed")) || 1;
      if (fastScroll) speed *= 0.5;

      requestAnimationFrame(() => {
        element.style.transition = `opacity ${speed}s ease-out`;
        element.style.opacity = 1;
      });
    }
  }

  // scope: Document | Element (опционально)
  function observeLazyLoad(scope) {
    const root = scope || document;
    let lazyElements = root.querySelectorAll("[data-bg], [data-bg-webp]");

    lazyElements.forEach((el) => {
      el.style.opacity = "0";
      el.style.willChange = "opacity";
    });

    let lastTime = performance.now();
    let lastScrollY = window.scrollY;

    if ("IntersectionObserver" in window) {
      let observer = new IntersectionObserver((entries, obs) => {
        let now = performance.now();
        let deltaY = Math.abs(window.scrollY - lastScrollY);
        let deltaT = now - lastTime;
        let speed = deltaY / (deltaT || 1);
        let fastScroll = speed > 1;

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadBackgroundImage(entry.target, fastScroll);
            obs.unobserve(entry.target);
          }
        });

        lastTime = now;
        lastScrollY = window.scrollY;
      }, { rootMargin: "0px", threshold: 0.1 });

      lazyElements.forEach((el) => observer.observe(el));
    } else {
      lazyElements.forEach((el) => loadBackgroundImage(el, false));
    }
  }

  // Экспортируем для динамически добавленных блоков
  window.loadBackgroundImage = loadBackgroundImage;
  window.observeLazyLoad = observeLazyLoad;

  document.addEventListener("DOMContentLoaded", function () {
    observeLazyLoad(document);
  });
})();

/* Разметка:
  // Фон появится за 0.5 секунды
  <div data-bg="/images/image2.jpg" data-bg-webp="/images/image2.webp" data-bg-speed="0.5"></div>

  // Фон появится дефолтно зф 1 сек
  <div data-bg="/img/image.jpg" data-bg-webp="/img/image.webp"></div>
*/


(function(){
 autosize(document.querySelectorAll('textarea'));
}());

/*(function(){
  const phoneElems = document.getElementsByClassName('phone-mask');
  Array.prototype.forEach.call(phoneElems, function (item) {
    const phoneMask = IMask(
      item, {
        mask: '+{44} 0000000000',
        placeholderChar: '_',
        lazy: false // make placeholder always visible
    });
  });
}());*/

// (function(){
//   autosize(document.querySelectorAll('textarea'));
// }());

