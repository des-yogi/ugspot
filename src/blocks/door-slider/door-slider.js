document.addEventListener('DOMContentLoaded', function () {
  const doorsSliderInstances = document.querySelectorAll('.door-slider__content');

  doorsSliderInstances.forEach(slider => {
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
