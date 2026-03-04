// (function(){
//   const feedback = new Swiper('.customer-feedback__slider', {
//     speed: 400,
//     slidesPerView: 1,
//     spaceBetween: 16,
//     //centeredSlides: true,
//     // autoplay: {
//     //  delay: 5000,
//     // },
//     grabCursor: true,
//     loop: true,
//     breakpoints: {
//       768: {
//         slidesPerView: 2
//       },
//       1280: {
//         slidesPerView: 3
//       },
//       1920: {
//         slidesPerView: 'auto'
//       }
//     },
//     navigation: {
//       nextEl: '.swiper-button-next',
//       prevEl: '.swiper-button-prev',
//     },
//     pagination: {
//       el: '.swiper-pagination',
//       type: 'bullets',
//     },
//     a11y: {
//       enabled: true,
//       slideRole: 'listitem',
//     },
//   });
// }());
(function(){
  const selector = '.customer-feedback__slider';
  const paginationEl = document.querySelector(`${selector} .swiper-pagination`);
  const feedback = new Swiper(selector, {
    speed: 400,
    slidesPerView: 1,
    spaceBetween: 16,
    grabCursor: true,
    loop: true,
    observer: true,
    observeParents: true,
    breakpoints: {
      768: { slidesPerView: 2 },
      1280: { slidesPerView: 3 },
      1920: { slidesPerView: 'auto' }
    },
    navigation: {
      nextEl: `${selector} .swiper-button-next`,
      prevEl: `${selector} .swiper-button-prev`,
    },
    pagination: {
      el: paginationEl, // явный элемент
      type: 'bullets',
      clickable: true,
    },
    a11y: {
      enabled: true,
      slideRole: 'listitem',
    },
  });

  // Безопасная ручная синхронизация bullets (не вызывает sw.update())
  function syncBullets() {
    const bullets = Array.from(document.querySelectorAll(`${selector} .swiper-pagination .swiper-pagination-bullet`));
    if (!bullets.length) return;
    const index = typeof feedback.realIndex === 'number' ? feedback.realIndex : feedback.activeIndex;
    const bulletIndex = index % bullets.length;
    bullets.forEach((b, i) => b.classList.toggle('swiper-pagination-bullet-active', i === bulletIndex));
  }

  // Подписываемся на события, гарантирующие завершение движения
  feedback.on('init', syncBullets);
  feedback.on('transitionEnd', syncBullets);
  feedback.on('touchEnd', syncBullets);
  // на всякий случай — при ресайзе
  feedback.on('resize', syncBullets);

  // Первый вызов
  syncBullets();

  // Для отладки — убрать на продакшене
  //window.__feedbackSwiper = feedback;
  //console.log('Swiper и ручная синхронизация пагинации инициализированы.');
}());
