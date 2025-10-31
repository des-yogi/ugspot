// (function(){
//   Fancybox.bind("[data-fancybox]", {
//     // Your custom options
//   });
// }());
/*
  gallery-toggle.js
  Минималистичная, надёжная реализация "2 строки + More" с плавным раскрытием.
  Особенности:
  - Инициализация Fancybox (если доступен)
  - Скрывает кнопку, если строк <= 2
  - Пересчёт при загрузке изображений и при ресайзе
  - Плавная анимация через max-height
  - Устойчив к отсутствию блока/картинок
  - Чтение data-more-text / data-less-text с кнопки <button>
  - Если в button нет <span>, создаём его для текста
  - Оставлены глобальные дефолты и runtime API
*/

(function () {
  'use strict';

  // Инициализация Fancybox (без краха, если нет)
  try {
    if (typeof Fancybox !== 'undefined' && Fancybox && Fancybox.bind) {
      Fancybox.bind('[data-fancybox]', {});
    }
  } catch (e) {}

  // Утилиты
  var q = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var qa = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var raf = window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function (fn) { return setTimeout(fn, 16); };
  var px = function (v) { var n = parseFloat(v); return isNaN(n) ? 0 : n; };

  // Глобальные дефолты текста кнопки
  window.__galleryToggleDefaults = window.__galleryToggleDefaults || { more: 'More', less: 'Less' };

  // Подсчёт колонок: сколько карточек в первом ряду
  function getColumnsCount(items) {
    if (!items.length) return 0;
    var firstTop = Math.round(items[0].offsetTop);
    var count = 0;
    for (var i = 0; i < items.length; i++) {
      if (Math.round(items[i].offsetTop) === firstTop) count++;
      else break; // как только пошёл следующий ряд — стоп
    }
    return Math.max(1, count);
  }

  // Высота карточки — берём максимум высот у карточек первого ряда
  function getItemHeightOfFirstRow(items) {
    if (!items.length) return 0;
    var firstTop = Math.round(items[0].offsetTop);
    var h = 0;
    for (var i = 0; i < items.length; i++) {
      if (Math.round(items[i].offsetTop) !== firstTop) break;
      var r = items[i].getBoundingClientRect();
      if (r.height > h) h = r.height;
    }
    return Math.round(h);
  }

  // Поиск top второго ряда (если есть)
  function getSecondRowTop(items) {
    if (items.length < 2) return null;
    var firstTop = Math.round(items[0].offsetTop);
    for (var i = 1; i < items.length; i++) {
      var t = Math.round(items[i].offsetTop);
      if (t > firstTop) return t;
    }
    return null;
  }

  // Вычисляем высоту свёрнутого состояния по формуле:
  // 2 * itemHeight + rowGap + paddingTop + paddingBottom
  // rowGap берём из row-gap/gap, иначе — из фактической разницы между рядами.
  function computeCollapsedHeight(container, items) {
    if (!items.length) return 0;
    var cs = getComputedStyle(container);
    var pt = px(cs.paddingTop);
    var pb = px(cs.paddingBottom);

    var itemH = getItemHeightOfFirstRow(items);
    if (itemH <= 0) {
      // fallback: если вдруг высота не посчиталась — показываем весь контейнер
      return container.scrollHeight;
    }

    // Пытаемся взять gap из CSS
    var rowGap = 0;
    var rawRowGap = cs.rowGap || cs.gap || '0';
    if (rawRowGap && rawRowGap !== 'normal') {
      rowGap = px(rawRowGap);
    }

    // Если gap не задан (или 0), считаем его из факта лэйаута (поддержка margin-bottom у колонок)
    if (!rowGap) {
      var secondTop = getSecondRowTop(items);
      if (secondTop != null) {
        var firstTop = Math.round(items[0].offsetTop);
        rowGap = Math.max(0, secondTop - firstTop - itemH);
      }
    }

    var collapsed = Math.round((2 * itemH) + rowGap + pt + pb);
    // Защита: не больше полной высоты
    return Math.min(Math.max(0, collapsed), container.scrollHeight);
  }

  function GalleryToggle(root) {
    this.root = root;
    this.container = q('.gallery__container', root);
    this.moreWrap = q('.gallery__more-wrapper', root);
    this.btn = this.moreWrap ? this.moreWrap.querySelector('button') : null;

    this._isOpen = false;
    this._rafId = null;
    this._debounceLoadId = null;

    if (this.btn) this._ensureButtonSpan();

    var bds = (this.btn && this.btn.dataset) ? this.btn.dataset : {};
    this.labels = {
      more: bds.moreText || window.__galleryToggleDefaults.more,
      less: bds.lessText || window.__galleryToggleDefaults.less
    };

    if (!this.container) {
      if (this.moreWrap) this.moreWrap.style.display = 'none';
      return;
    }

    var cs = getComputedStyle(this.container);
    if (!/max-height/.test(cs.transition || '')) {
      this.container.style.transition = 'max-height 300ms ease';
    }

    if (this.btn) this.btn.addEventListener('click', this.toggle.bind(this));
    window.addEventListener('resize', this.onResize.bind(this));

    this.watchImages();

    var self = this;
    raf(function () { self.recalcAndApply(); });
  }

  GalleryToggle.prototype._ensureButtonSpan = function () {
    if (!this.btn) return;
    var span = this.btn.querySelector('span');
    if (!span) {
      span = document.createElement('span');
      var text = '';
      Array.prototype.slice.call(this.btn.childNodes).forEach(function (n) {
        if (n.nodeType === 3 && /\S/.test(n.nodeValue)) { text += n.nodeValue.trim() + ' '; n.nodeValue = ''; }
      });
      span.textContent = text.trim() || '';
      this.btn.insertBefore(span, this.btn.firstChild);
    }
  };

  GalleryToggle.prototype.setLabels = function (labels) {
    if (!labels) return;
    if (labels.more) this.labels.more = labels.more;
    if (labels.less) this.labels.less = labels.less;
    this.updateButton();
  };

  GalleryToggle.prototype.watchImages = function () {
    var imgs = qa('img', this.container);
    var self = this;
    if (!imgs.length) return;
    var onImg = function () {
      clearTimeout(self._debounceLoadId);
      self._debounceLoadId = setTimeout(function () { self.recalcAndApply(); }, 80);
    };
    imgs.forEach(function (img) {
      if (img.complete) return;
      img.addEventListener('load', onImg, { once: true });
      img.addEventListener('error', onImg, { once: true });
    });
  };

  GalleryToggle.prototype.onResize = function () {
    var self = this;
    if (this._rafId) cancelAnimationFrame(this._rafId);
    this._rafId = raf(function () { self.recalcAndApply(); });
  };

  GalleryToggle.prototype.hideMore = function () { if (this.moreWrap) this.moreWrap.style.display = 'none'; };
  GalleryToggle.prototype.showMore = function () { if (this.moreWrap) this.moreWrap.style.display = ''; };

  GalleryToggle.prototype.recalcAndApply = function () {
    var items = qa('.gallery__item-col', this.container);
    if (!items.length) { this.hideMore(); this.clearCollapse(); return; }

    // Определяем кол-во рядов через число колонок
    var cols = getColumnsCount(items);
    var totalRows = cols ? Math.ceil(items.length / cols) : 0;

    if (totalRows <= 2) {
      this.hideMore();
      this.clearCollapse();
      this._isOpen = false;
      this.updateButton();
      return;
    }

    this.showMore();

    // Высота двух рядов по формуле (2*itemHeight + rowGap + paddings)
    this._collapsedHeight = computeCollapsedHeight(this.container, items);
    this._fullHeight = this.container.scrollHeight;

    if (this._isOpen) {
      this.applyExpanded(false);
    } else {
      this.applyCollapsed();
    }
    this.updateButton();
  };

  GalleryToggle.prototype.applyCollapsed = function () {
    this.container.style.overflow = 'hidden';
    this.container.style.maxHeight = (this._collapsedHeight || 0) + 'px';
    if (this.btn) this.btn.setAttribute('aria-expanded', 'false');
  };

  GalleryToggle.prototype.applyExpanded = function (withAnimation) {
    var self = this;
    this.container.style.overflow = 'hidden';
    this._fullHeight = this.container.scrollHeight;

    if (!withAnimation) {
      var prev = this.container.style.transition;
      this.container.style.transition = 'none';
      this.container.style.maxHeight = this._fullHeight + 'px';
      this.container.offsetHeight;
      this.container.style.transition = prev || '';
      this.container.style.maxHeight = '';
      this.container.style.overflow = '';
      if (this.btn) this.btn.setAttribute('aria-expanded', 'true');
      return;
    }

    this.container.style.maxHeight = (this._collapsedHeight || 0) + 'px';
    this.container.offsetHeight;
    this.container.style.maxHeight = this._fullHeight + 'px';

    var onEnd = function (e) {
      if (e && e.propertyName && e.propertyName.indexOf('max-height') === -1) return;
      self.container.style.maxHeight = '';
      self.container.style.overflow = '';
      self.container.removeEventListener('transitionend', onEnd);
    };
    this.container.addEventListener('transitionend', onEnd);
    if (this.btn) this.btn.setAttribute('aria-expanded', 'true');
  };

  GalleryToggle.prototype.clearCollapse = function () {
    if (!this.container) return;
    this.container.style.maxHeight = '';
    this.container.style.overflow = '';
    if (this.btn) this.btn.setAttribute('aria-expanded', 'false');
  };

  GalleryToggle.prototype.toggle = function () {
    this._isOpen = !this._isOpen;

    if (this._isOpen) {
      this.applyExpanded(true);
    } else {
      // При сворачивании заново строго считаем высоту двух рядов
      var items = qa('.gallery__item-col', this.container);
      this._collapsedHeight = computeCollapsedHeight(this.container, items);

      // Текущая визуальная высота -> плавно к collapsed
      var currentH = Math.round(this.container.getBoundingClientRect().height);
      this.container.style.overflow = 'hidden';
      this.container.style.maxHeight = currentH + 'px';
      this.container.offsetHeight;
      this.container.style.maxHeight = (this._collapsedHeight || 0) + 'px';
      if (this.btn) this.btn.setAttribute('aria-expanded', 'false');
    }

    this.updateButton();
  };

  GalleryToggle.prototype.updateButton = function () {
    if (!this.btn) return;
    var span = this.btn.querySelector('span');
    var text = this._isOpen ? (this.labels.less || window.__galleryToggleDefaults.less)
                            : (this.labels.more || window.__galleryToggleDefaults.more);
    if (span) span.textContent = text; else this.btn.textContent = text;
    this.btn.classList.toggle('is-open', !!this._isOpen);
  };

  // Инициализация всех галерей
  function initAll() {
    var galleries = qa('article.gallery');
    if (!galleries.length) return;
    galleries.forEach(function (g) {
      if (!g._galleryToggleInst) g._galleryToggleInst = new GalleryToggle(g);
      else g._galleryToggleInst.recalcAndApply();
    });
  }

  // Fancybox: после закрытия просто пересчитываем
  function onFancyboxClose() {
    setTimeout(function () {
      try {
        var galleries = qa('article.gallery');
        galleries.forEach(function (g) { if (g._galleryToggleInst) g._galleryToggleInst.recalcAndApply(); });
      } catch (e) {}
    }, 60);
  }
  try {
    document.addEventListener('fancybox:close', onFancyboxClose);
    document.addEventListener('fancybox:closing', onFancyboxClose);
    document.addEventListener('afterClose.fb', onFancyboxClose);
    document.addEventListener('close.fb', onFancyboxClose);
  } catch (e) {}

  // API
  window.galleryToggle = window.galleryToggle || {
    setDefaults: function (labels) {
      if (!labels) return;
      if (labels.more) window.__galleryToggleDefaults.more = labels.more;
      if (labels.less) window.__galleryToggleDefaults.less = labels.less;
      var galleries = qa('article.gallery');
      galleries.forEach(function (g) {
        if (g._galleryToggleInst) g._galleryToggleInst.setLabels(labels);
      });
    },
    initAll: function () { initAll(); }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAll);
  else initAll();

  window.__galleryToggleInit = initAll;
}());
