/* production-modal-relocate.js - переносим .modal в body при открытии
   Подключать после загрузки Bootstrap и mmenu.
*/
(function () {
  'use strict';

  // WeakMap для хранения оригинальных родителей и флага переноса
  var originalParents = new WeakMap(); // modal -> original parent (Node)
  var wasMoved = new WeakMap();        // modal -> true

  // Helper: безопасно получить target из события
  function getModalFromEvent(e) {
    if (!e || !e.target) return null;
    var el = e.target;
    // Иногда событие может всплывать от внутренних элементов, но bootstrap
    // генерирует события у корневого modals, так что e.target должен быть modal.
    return (el instanceof HTMLElement) ? el : null;
  }

  // При show — сохраняем оригинального родителя и переносим в body
  document.addEventListener('show.bs.modal', function (e) {
    var modal = getModalFromEvent(e);
    if (!modal) return;

    // Сохраняем оригинальный родитель, если ещё не сохраняли
    if (!originalParents.has(modal)) {
      originalParents.set(modal, modal.parentNode);
    }

    // Если уже в body — ничего не делаем
    if (modal.parentNode !== document.body) {
      try {
        document.body.appendChild(modal);
        wasMoved.set(modal, true);
      } catch (err) {
        // На случай, если appendChild неожиданно упадёт — не критично, логируем в dev
        if (window && window.console && window.console.error) {
          window.console.error('modal relocate append failed', err);
        }
      }
    }
  }, false);

  // При hidden — возвращаем в исходный родитель, если он ещё существует
  document.addEventListener('hidden.bs.modal', function (e) {
    var modal = getModalFromEvent(e);
    if (!modal) return;

    try {
      if (wasMoved.has(modal) && wasMoved.get(modal)) {
        var orig = originalParents.get(modal);
        // Вернуть только если оригинальный узел всё ещё в DOM
        if (orig && orig instanceof Node && orig.isConnected) {
          orig.appendChild(modal);
        }
      }
    } catch (err) {
      if (window && window.console && window.console.warn) {
        window.console.warn('modal relocate restore failed', err);
      }
    } finally {
      // Убираем записи из WeakMap — GC сможет освободить память
      try { originalParents.delete(modal); } catch (_) {}
      try { wasMoved.delete(modal); } catch (_) {}
    }
  }, false);
})();
