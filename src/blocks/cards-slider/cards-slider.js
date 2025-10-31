document.addEventListener('DOMContentLoaded', function () {
  const cardsSliderInstances = document.querySelectorAll('.cards-slider__container');

  cardsSliderInstances.forEach(slider => {
    const prevEl = slider.querySelector('.swiper-button-prev');
    const nextEl = slider.querySelector('.swiper-button-next');
    const paginationEl = slider.querySelector('.swiper-pagination');

    new Swiper(slider, {
      slidesPerView: 'auto',
      spaceBetween: 16,
      //loop: true,
      grabCursor: true,
      navigation: {
        nextEl,
        prevEl,
      },
      pagination: {
        el: paginationEl,
        clickable: false,
      },
      // ...другие опции
    });
  });
});
