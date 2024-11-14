(function(){
  const certificates = new Swiper('.certificates-carousel__content', {
    speed: 400,
    spaceBetween: 16,
    slidesPerView: 'auto',
    centeredSlides: true,
    autoplay: true,
    grabCursor: true,
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
