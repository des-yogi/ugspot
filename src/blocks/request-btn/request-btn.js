(function () {
  const fab = document.querySelector('.fab');
  const label = fab?.querySelector('.label');
  if (!fab || !label) return;

  // Измерим естественную ширину подписи
  const measure = () => {
    // Временно делаем «без ограничений», чтобы получить scrollWidth
    const prev = label.style.maxInlineSize;
    label.style.maxInlineSize = 'none';
    const w = Math.ceil(label.scrollWidth) + 'px';
    label.style.maxInlineSize = prev;
    fab.style.setProperty('--label-max', w);
  };

  // Сразу и на ресайз
  measure();
  let rAF;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(rAF);
    rAF = requestAnimationFrame(measure);
  });
})();
