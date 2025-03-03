(function(){
  const feedback = new Swiper('.customer-feedback__slider', {
    speed: 400,
    slidesPerView: 1,
    spaceBetween: 16,
    //centeredSlides: true,
    // autoplay: {
    //  delay: 5000,
    // },
    grabCursor: true,
    loop: true,
    breakpoints: {
      768: {
        slidesPerView: 2
      },
      1280: {
        slidesPerView: 3
      },
      1920: {
        slidesPerView: 'auto'
      }
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
    },
    a11y: {
      enabled: true,
      slideRole: 'listitem',
    },
    // autoplay: {
    //  delay: 5000,
    // },
  });
}());
