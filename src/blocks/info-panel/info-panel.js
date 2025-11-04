(function () {
  // Настройки
  var GAP = 24;                  // зазор между FAB и модалкой
  var WIDE_Q = '(min-width: 768px)';
  var SAFE = 8;                  // безопасный отступ от краёв

  var modalEl = document.getElementById('infoModal');
  if (!modalEl || !window.bootstrap || !bootstrap.Modal) return;

  var modal = bootstrap.Modal.getOrCreateInstance(modalEl, {
    backdrop: false,
    keyboard: true,
    focus: true
  });

  var dialog = modalEl.querySelector('.info-panel__dialog');
  if (!dialog) return;

  var currentAnchor = null;

  function getDefaultAnchor() {
    var sel = '[data-bs-toggle="modal"][data-bs-target="#' + modalEl.id + '"]';
    return document.querySelector(sel) || document.querySelector('.fab');
  }

  function readPlacement(fromEl) {
    var val = (fromEl && (fromEl.dataset.placement || fromEl.getAttribute('data-placement'))) ||
              modalEl.dataset.placement || 'auto';
    val = (val || '').toLowerCase();
    return (val === 'left' || val === 'right') ? val : 'auto';
  }

  function isOpen() {
    return modalEl.classList.contains('show');
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function getDialogWidth() {
    // Берём реальную ширину (с учётом бордеров), fallback на 320
    var w = dialog.getBoundingClientRect().width;
    return w > 0 ? w : 320;
  }

  function positionDialog(anchorEl) {
    var anchor = anchorEl || currentAnchor || getDefaultAnchor();
    if (!anchor) return;

    var rect = anchor.getBoundingClientRect();
    var isWide = window.matchMedia && window.matchMedia(WIDE_Q).matches;
    var vw = window.innerWidth;
    var vh = window.innerHeight;

    var dlgW = getDialogWidth();
    var left, bottom;

    if (isWide) {
      // Выбор стороны: принудительно (data-placement) или авто по свободному месту
      var prefer = readPlacement(anchor);
      var spaceRight = vw - rect.right - SAFE;
      var spaceLeft  = rect.left - SAFE;
      var need = dlgW + GAP;

      var side;
      if (prefer === 'left') side = 'left';
      else if (prefer === 'right') side = 'right';
      else side = (spaceRight >= need) ? 'right' : (spaceLeft >= need ? 'left' : (spaceRight >= spaceLeft ? 'right' : 'left'));

      // Горизонталь
      if (side === 'right') left = rect.right + GAP;
      else left = rect.left - dlgW - GAP;

      // Вертикаль: выравниваем НИЗ модалки по НИЗУ FAB без лишних прибавок
      bottom = vh - rect.bottom;
    } else {
      // Узкие: ставим модалку НАД FAB
      // Низ модалки должен быть на GAP выше верха FAB.
      left = rect.left; // якоримся к левому краю FAB
      bottom = (vh - rect.top) + GAP;
    }

    // Границы вьюпорта
    left = clamp(left, SAFE, Math.max(SAFE, vw - dlgW - SAFE));
    bottom = clamp(bottom, SAFE, vh - SAFE);

    // Применяем
    dialog.style.position = 'fixed';
    dialog.style.left = left + 'px';
    dialog.style.right = '';
    dialog.style.top = '';
    dialog.style.bottom = bottom + 'px';
    dialog.style.margin = '0';
  }

  // Чтобы учесть «схлопывание» FAB после ухода курсора — делаем «послесеттлинг»
  var rafStop = null;
  function settlePositioning(ms) {
    var duration = ms || 400;
    var start = performance.now();
    function step(now) {
      if (!isOpen()) return;
      positionDialog();
      if (now - start < duration) {
        rafStop = requestAnimationFrame(step);
      }
    }
    if (rafStop) cancelAnimationFrame(rafStop);
    rafStop = requestAnimationFrame(step);
  }

  // Подписки на изменения размеров FAB: hover/transition
  function attachAnchorWatchers(anchor) {
    if (!anchor) return;
    anchor.addEventListener('mouseenter', onAnchorHover, true);
    anchor.addEventListener('mouseleave', onAnchorHover, true);
    anchor.addEventListener('focus', onAnchorHover, true);
    anchor.addEventListener('blur', onAnchorHover, true);
    anchor.addEventListener('transitionend', onAnchorTransition, true);
  }
  function detachAnchorWatchers(anchor) {
    if (!anchor) return;
    anchor.removeEventListener('mouseenter', onAnchorHover, true);
    anchor.removeEventListener('mouseleave', onAnchorHover, true);
    anchor.removeEventListener('focus', onAnchorHover, true);
    anchor.removeEventListener('blur', onAnchorHover, true);
    anchor.removeEventListener('transitionend', onAnchorTransition, true);
  }
  function onAnchorHover() {
    if (isOpen()) positionDialog();
  }
  function onAnchorTransition(e) {
    // Реагируем на изменения, влияющие на ширину/положение
    if (!isOpen()) return;
    if (['width','max-width','padding-left','padding-right','margin-left','margin-right','left','right'].indexOf(e.propertyName) > -1) {
      positionDialog();
    }
  }

  // Управление жизненным циклом
  function onShown() {
    positionDialog();
    settlePositioning(450); // учесть анимации hover/label
    document.addEventListener('mousedown', onDocumentDown, true);
    window.addEventListener('resize', onViewportChange);
    window.addEventListener('orientationchange', onViewportChange);
    attachAnchorWatchers(currentAnchor);
  }

  function onHidden() {
    document.removeEventListener('mousedown', onDocumentDown, true);
    window.removeEventListener('resize', onViewportChange);
    window.removeEventListener('orientationchange', onViewportChange);
    detachAnchorWatchers(currentAnchor);
    if (rafStop) { cancelAnimationFrame(rafStop); rafStop = null; }
    if (currentAnchor) currentAnchor.setAttribute('aria-expanded', 'false');
  }

  function isClickOnAnchor(target) {
    return !!(currentAnchor && (target === currentAnchor || currentAnchor.contains(target)));
  }

  function onDocumentDown(e) {
    if (!isOpen()) return;
    var insideDialog = !!e.target.closest('.modal-dialog');
    var onAnchor = isClickOnAnchor(e.target);
    if (!insideDialog && !onAnchor) modal.hide();
  }

  function onViewportChange() {
    if (isOpen()) positionDialog();
  }

  // Привязываем якорь из relatedTarget
  modalEl.addEventListener('show.bs.modal', function (ev) {
    currentAnchor = ev.relatedTarget || getDefaultAnchor() || null;
    if (currentAnchor) {
      currentAnchor.setAttribute('aria-expanded', 'true');
      positionDialog(currentAnchor);
    }
  });
  modalEl.addEventListener('shown.bs.modal', onShown);
  modalEl.addEventListener('hidden.bs.modal', onHidden);

  // Экспорт для ручного вызова при необходимости
  window.InfoPanelReposition = positionDialog;
})();

// Ротатор иконок (карусель)
(() => {
  'use strict';

  // Тайминги и плавность
  const HOLD_MS = 1200;                 // пауза на кадре
  const SLIDE_MS = 400;                 // длительность слайда
  const EASE = 'cubic-bezier(.2,.7,.2,1)';
  const PAUSE_ON_HOVER = false;

  // Количество циклов по умолчанию
  // Возможные значения: число или строка "infinite" или "-1" — крутить бесконечно
  const DEFAULT_CYCLES = "infinite";       // 10 полных кругов

  const prefersReduce = window.matchMedia?.('(prefers-reduced-motion: reduce)');

  class IconCarousel {
    constructor(modalEl, options = {}) {
      this.modalEl = modalEl;
      this.viewport = modalEl.querySelector('.info-panel__icon-viewport');
      this.track = modalEl.querySelector('.info-panel__icon-track');
      this.enabled = !!(this.viewport && this.track);
      if (!this.enabled) return;

      this.items = [];
      this.cloneEl = null;
      this.index = 0;
      this.stepPx = 0;
      this.holdTimer = null;
      this.running = false;

      // Циклы
      this.cyclesTarget = this._readCycles(options.cycles);
      this.cyclesDone = 0;

      // бинды
      this._onTransitionEnd = this._onTransitionEnd.bind(this);
      this._onResize = this._onResize.bind(this);
      this._onHover = this._onHover.bind(this);
      this._onHoverOut = this._onHoverOut.bind(this);

      this._prepare();
    }

    // Чтение настроек циклов
    _readCycles(explicitValue) {
      let v = explicitValue;
      if (v == null) {
        // сначала пытаемся взять с viewport, потом с модалки
        const attr =
          this.viewport?.dataset?.iconCycles ??
          this.modalEl?.dataset?.iconCycles ??
          null;
        v = attr;
      }
      if (typeof v === 'string') v = v.trim().toLowerCase();

      if (v === 'infinite' || v === '-1') return Infinity;
      if (v === '0' || v === 0) return 0;

      const n = Number(v);
      return Number.isFinite(n) && n > 0 ? n : DEFAULT_CYCLES;
    }

    // Публично: задать число циклов (применится со следующего старта)
    setCycles(n) {
      this.cyclesTarget =
        (n === 'infinite' || n === -1) ? Infinity :
        (n === 0 ? 0 : (Number.isFinite(+n) && +n > 0 ? +n : DEFAULT_CYCLES));
    }

    _prepare() {
      const all = Array.from(this.track.children).filter(n => n.classList?.contains('info-panel__icon'));
      if (!all.length) { this.enabled = false; return; }

      const first = all[0];
      let last = all[all.length - 1];

      // распознать уже добавленный клон (фон совпадает с первым)
      const bgFirst = getComputedStyle(first).backgroundImage;
      const bgLast = getComputedStyle(last).backgroundImage;

      if (last !== first && bgFirst && bgLast && bgFirst === bgLast) {
        last.dataset.clone = 'true';
        this.cloneEl = last;
        this.items = all.slice(0, -1);
      } else {
        const clone = first.cloneNode(true);
        clone.dataset.clone = 'true';
        this.track.appendChild(clone);
        this.cloneEl = clone;
        this.items = Array.from(this.track.children).filter(n => n.classList?.contains('info-panel__icon') && !n.dataset.clone);
      }

      // если иконка одна — анимировать нечего
      if (this.items.length <= 1) {
        this.enabled = false;
        return;
      }

      this.track.style.willChange = 'transform';
      this._measure();
      this._apply(0, false);
    }

    _measure() {
      const v = this.viewport.getBoundingClientRect().width;
      const first = this.items[0];
      const i = first ? first.getBoundingClientRect().width : 40;
      this.stepPx = Math.round(v || i || 40);
    }

    _apply(indexForOffset, withTransition) {
      const offset = -(indexForOffset * this.stepPx);
      this.track.style.transition = withTransition ? `transform ${SLIDE_MS}ms ${EASE}` : 'none';
      this.track.style.transform = `translate3d(${offset}px,0,0)`;
    }

    _tick() {
      if (!this.running) return;
      this.index += 1;

      const movingToClone = (this.index >= this.items.length);
      const offsetIndex = movingToClone ? this.items.length : this.index;

      this.track.addEventListener('transitionend', this._onTransitionEnd, { once: true });
      this._apply(offsetIndex, true);
    }

    _onTransitionEnd(e) {
      if (!this.running || e.propertyName !== 'transform') return;

      // доехали до клона — прыжок на 0 без анимации
      if (this.index >= this.items.length) {
        this.index = 0;
        this._apply(0, false);
        // reflow, чтобы transition:none применился до следующего шага
        // eslint-disable-next-line no-unused-expressions
        this.track.offsetHeight;

        // засчитываем цикл
        this.cyclesDone += 1;

        // если достигли лимита — стоп на первом значке
        if (this.cyclesTarget !== Infinity && this.cyclesDone >= this.cyclesTarget) {
          this.stop(/*holdOnCurrent=*/false); // вернёмся к началу (index=0 уже выставлен)
          return;
        }
      }

      // следующий шаг после паузы
      this.holdTimer = setTimeout(() => this._tick(), HOLD_MS);
    }

    start() {
      if (!this.enabled) return;
      if (prefersReduce?.matches) return;       // уважение prefers-reduced-motion
      if (this.cyclesTarget === 0) return;      // подготовка есть, но автозапуска нет
      if (this.running) return;

      this.running = true;
      this.cyclesDone = 0;
      this._measure();
      this._apply(this.index, false);

      this.holdTimer = setTimeout(() => this._tick(), HOLD_MS);

      window.addEventListener('resize', this._onResize);
      window.addEventListener('orientationchange', this._onResize);

      if (PAUSE_ON_HOVER) {
        this.modalEl.addEventListener('mouseenter', this._onHover, true);
        this.modalEl.addEventListener('mouseleave', this._onHoverOut, true);
        this.modalEl.addEventListener('focusin', this._onHover, true);
        this.modalEl.addEventListener('focusout', this._onHoverOut, true);
      }
    }

    stop(holdOnCurrent = true) {
      if (!this.enabled) return;
      this.running = false;
      clearTimeout(this.holdTimer);
      this.holdTimer = null;
      this.track.style.transition = 'none';

      if (!holdOnCurrent) {
        // удержать первый кадр (index=0). Если сейчас не 0 — выставим
        this.index = 0;
        this._apply(0, false);
      }

      window.removeEventListener('resize', this._onResize);
      window.removeEventListener('orientationchange', this._onResize);

      if (PAUSE_ON_HOVER) {
        this.modalEl.removeEventListener('mouseenter', this._onHover, true);
        this.modalEl.removeEventListener('mouseleave', this._onHoverOut, true);
        this.modalEl.removeEventListener('focusin', this._onHover, true);
        this.modalEl.removeEventListener('focusout', this._onHoverOut, true);
      }
    }

    _onResize() {
      if (!this.enabled) return;
      const prev = this.stepPx;
      this._measure();
      if (this.stepPx !== prev) {
        this._apply(this.index, false);
      }
    }

    _onHover() {
      if (!this.running) return;
      clearTimeout(this.holdTimer);
      this.track.style.transition = 'none';
    }
    _onHoverOut() {
      if (!this.running) return;
      this.holdTimer = setTimeout(() => this._tick(), HOLD_MS);
    }
  }

  function initAll() {
    const modals = document.querySelectorAll('.modal.info-panel');
    modals.forEach((modalEl) => {
      const carousel = new IconCarousel(modalEl);
      modalEl._iconCarousel = carousel;

      modalEl.addEventListener('shown.bs.modal', () => carousel.start());
      modalEl.addEventListener('hidden.bs.modal', () => carousel.stop());
      if (modalEl.classList.contains('show')) carousel.start();
    });

    prefersReduce?.addEventListener?.('change', () => {
      document.querySelectorAll('.modal.info-panel').forEach((modalEl) => {
        const c = modalEl._iconCarousel;
        if (!c) return;
        if (prefersReduce.matches) c.stop();
        else if (modalEl.classList.contains('show')) c.start();
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll, { once: true });
  } else {
    initAll();
  }

  // Хелпер для ручного запуска повторной инициализации
  window.InfoPanelInitIcons = initAll;
})();
