(function(){
  const winOptions = new Swiper('.win-options-3-col__slider', {
    speed: 400,
    spaceBetween: 16,
    slidesPerView: 'auto',
    //centeredSlides: true,
    //centeredSlidesBounds: true,
    grabCursor: true,
    a11y: {
      enabled: true,
      slideRole: 'listitem',
    },
    centerInsufficientSlides: true,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: false,
    },
    breakpoints: {
      600: {
       slidesPerView: 3,
      },
      // 768: {
      //  slidesPerView: 3,
      // },
      // 1200: {
      //   slidesPerView: 3,
      // }
    }
  });
}());
