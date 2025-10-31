(function(){
  const clients = new Swiper('.clients-carousel__content', {
    speed: 400,
    spaceBetween: 16,
    slidesPerView: 'auto',
    centerInsufficientSlides: true, // Not intended to be used loop mode and grid.rows
    autoplay: true,
    rewind: true,
    grabCursor: true,
    //loop: true,
    a11y: {
      enabled: true,
      slideRole: 'listitem',
    },
    // autoplay: {
    //  delay: 5000,
    // },
  });
}());
