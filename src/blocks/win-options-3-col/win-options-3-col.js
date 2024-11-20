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
    breakpoints: {
      // 480: {
      //   slidesPerView: 1.5,
      //   spaceBetween: 30
      // },
      // 768: {
      //   slidesPerView: 2.5,
      // },
      1200: {
        slidesPerView: 3,
      }
    }
  });
}());
