(function(){
  const clients = new Swiper('.clients-carousel__content', {
    speed: 400,
    spaceBetween: 16,
    slidesPerView: 'auto',
    //centeredSlides: true,
    autoplay: true,
    //grabCursor: true,
    loop: true,
    a11y: {
      enabled: true,
      slideRole: 'listitem',
    },
    // autoplay: {
    //  delay: 5000,
    // },
  });
}());
