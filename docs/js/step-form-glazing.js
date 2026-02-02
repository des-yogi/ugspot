(function () {
  const root = document.querySelector(".step-form-glazing");
  if (!root) return;

  const swiperContainer = root.querySelector(".step-form__container");
  if (!swiperContainer) return;

  const unitsContainer = root.querySelector("[data-units-container]");
  const unitTemplate = document.getElementById("unit-template");

  if (!unitsContainer || !unitTemplate) {
    console.warn("[step-form-glazing] Units container or #unit-template not found");
    return;
  }

  const form = root.closest("form") || root;

  const MAX_QTY = 100;

  const swiper = new Swiper(swiperContainer, {
    speed: 400,
    slidesPerView: 1,
    spaceBetween: 40,
    allowTouchMove: false,
    autoHeight: true,
    navigation: false,
    on: { slideChange: updateProgress },
  });

  const prevButton = root.querySelector(".step-form__btn--prev");
  const nextButton = root.querySelector(".step-form__btn--next");
  const car = root.querySelector(".progress__car");
  const roadProgress = root.querySelector(".progress__road-line");
  const progressContainer = root.querySelector(".progress");
  const flagsContainer = root.querySelector(".progress__flags");
  const slideNum = root.querySelector(".progress__slide-num");
  const warningMessage = root.querySelector(".step-form__warning");

  // -------------------------
  // Bootstrap confirm modal for removing unit
  // (HTML already added by user: #confirmRemoveUnitModal)
  // -------------------------
  const confirmRemoveModalEl = document.getElementById("confirmRemoveUnitModal");
  const confirmRemoveModal =
    confirmRemoveModalEl && window.bootstrap
      ? bootstrap.Modal.getOrCreateInstance(confirmRemoveModalEl)
      : null;

  let pendingRemoveUnitEl = null;

  if (confirmRemoveModalEl) {
    confirmRemoveModalEl.addEventListener("click", (e) => {
      const okBtn = e.target.closest('[data-action="confirm-remove-unit"]');
      if (!okBtn) return;

      if (!pendingRemoveUnitEl) {
        if (confirmRemoveModal) confirmRemoveModal.hide();
        return;
      }

      if (unitsContainer.contains(pendingRemoveUnitEl)) {
        pendingRemoveUnitEl.remove();
        syncUnits();
        updateSwiperHeight();
      }

      pendingRemoveUnitEl = null;
      if (confirmRemoveModal) confirmRemoveModal.hide();
    });

    confirmRemoveModalEl.addEventListener("hidden.bs.modal", () => {
      pendingRemoveUnitEl = null;
    });
  }

  // -------------------------
  // Radio-card reliability fix (media-radiobtn + color-radio)
  // -------------------------
  (function initRadioCardPointerFix() {
    const CARD_SELECTORS = [".media-radiobtn__lbl", ".color-radio__lbl"].join(",");
    const IGNORE_INSIDE_SELECTOR = "a, button";
    const MIN_INTERVAL_MS = 50;
    let lastTs = 0;

    function findRadioForCard(card) {
      let radio = card.querySelector('input[type="radio"]');
      if (!radio && card.tagName === "LABEL") {
        const id = card.getAttribute("for");
        if (id) {
          const maybe = document.getElementById(id);
          if (maybe && maybe.type === "radio") radio = maybe;
        }
      }
      return radio;
    }

    root.addEventListener(
      "pointerdown",
      (e) => {
        const card = e.target.closest(CARD_SELECTORS);
        if (!card) return;

        if (e.target.closest(IGNORE_INSIDE_SELECTOR)) return;

        const now = performance.now();
        if (now - lastTs < MIN_INTERVAL_MS) return;
        lastTs = now;

        const radio = findRadioForCard(card);
        if (!radio || radio.disabled) return;

        e.preventDefault();

        if (!radio.checked) {
          radio.checked = true;
          radio.dispatchEvent(new Event("change", { bubbles: true }));
        }
      },
      true
    );
  })();

  // -------------------------
  // Progress
  // -------------------------
  function generateFlags() {
    if (!flagsContainer) return;
    const totalSlides = swiper.slides.length;
    flagsContainer.innerHTML = "";
    for (let i = 0; i < totalSlides; i++) {
      const flag = document.createElement("span");
      flag.classList.add("progress__flag");
      flag.setAttribute("data-step", i);
      flagsContainer.appendChild(flag);
    }
  }

  function updateProgress() {
    const totalSlides = swiper.slides.length;
    const currentStep = swiper.realIndex + 1;

    if (!progressContainer || !car || !roadProgress || !flagsContainer) return;

    if (warningMessage) warningMessage.textContent = "";
    root.querySelectorAll(".invalid").forEach((el) => el.classList.remove("invalid"));

    const roadWidth = progressContainer.offsetWidth;
    const carWidth = car.offsetWidth;
    const carPosition =
      totalSlides > 1 ? ((currentStep - 1) / (totalSlides - 1)) * (roadWidth - carWidth) : 0;

    car.style.transition = "transform 0.4s ease-in-out";
    roadProgress.style.transition = "width 0.4s ease-in-out";

    car.style.transform = `translateX(${carPosition}px)`;
    roadProgress.style.width =
      totalSlides > 1 ? `${((currentStep - 1) / (totalSlides - 1)) * 100}%` : "0%";

    const flags = flagsContainer.querySelectorAll(".progress__flag");
    flags.forEach((flag, index) => {
      flag.classList.toggle("progress__flag--active", index < currentStep);
    });

    if (prevButton) prevButton.disabled = currentStep === 1;

    if (nextButton) {
      const nextButtonText = nextButton.querySelector("span");
      if (nextButtonText) {
        if (currentStep === totalSlides) {
          nextButtonText.textContent = "Send";
          nextButton.setAttribute("type", "submit");
        } else {
          nextButtonText.textContent = "Next step";
          nextButton.setAttribute("type", "button");
        }
      }
    }

    if (slideNum) slideNum.textContent = `(Step ${currentStep} out of ${totalSlides})`;
  }

  function updateSwiperHeight() {
    setTimeout(() => {
      swiper.updateAutoHeight(0);
      swiper.update();
    }, 0);
  }

  // -------------------------
  // Helpers
  // -------------------------
  function getFieldLabel(el) {
    const fs = el.closest("fieldset");
    if (fs) {
      const legend = fs.querySelector("legend");
      if (legend) return legend.textContent.replace(/\*/g, "").trim();
      const title = fs.querySelector(".step-form__step-title");
      if (title) return title.textContent.replace(/\*/g, "").trim();
    }

    const fieldText = el.closest(".field-text");
    if (fieldText) {
      const n = fieldText.querySelector(".field-text__name");
      if (n) return n.textContent.trim();
    }

    const fieldSelect = el.closest(".field-select");
    if (fieldSelect) {
      const n = fieldSelect.querySelector(".field-select__name");
      if (n) return n.textContent.replace(/\*/g, "").trim();
    }

    const fieldNum = el.closest(".field-num");
    if (fieldNum) {
      const n = fieldNum.querySelector(".field-num__name");
      if (n) return n.textContent.trim();
    }

    return "This field";
  }

  // -------------------------
  // Input restrictions
  // -------------------------
  function attachNumericMmHandlers(scopeEl) {
    scopeEl.querySelectorAll("input[data-validate='number-mm']").forEach((input) => {
      input.addEventListener("keydown", function (e) {
        const allowedControlKeys = [
          "Backspace",
          "Delete",
          "ArrowLeft",
          "ArrowRight",
          "Tab",
          "Home",
          "End",
        ];
        if (e.ctrlKey || e.metaKey) return;

        const key = e.key;
        if (allowedControlKeys.includes(key)) return;
        if (/^[0-9]$/.test(key)) return;

        e.preventDefault();
      });

      input.addEventListener("paste", function (e) {
        const pasted = (e.clipboardData || window.clipboardData).getData("text");
        if (!/^[0-9]+$/.test(pasted.trim())) e.preventDefault();
      });
    });
  }

  function attachIntegerOnlyHandlers(scopeEl) {
    scopeEl.querySelectorAll(".field-num__input").forEach((input) => {
      input.addEventListener("keydown", (e) => {
        const blocked = [".", ",", "e", "E", "+", "-"];
        if (blocked.includes(e.key)) e.preventDefault();
      });

      input.addEventListener("input", () => {
        const raw = String(input.value);
        if (raw === "") return;
        const n = parseInt(raw, 10);
        input.value = Number.isNaN(n) ? "0" : String(n);
      });
    });
  }

  function initChoices(scopeEl) {
    if (typeof Choices !== "function") return;

    const selects = scopeEl.querySelectorAll(".field-select__select");
    selects.forEach((item) => {
      if (item.closest(".choices")) return;
      new Choices(item, {
        searchEnabled: false,
        shouldSort: false,
        searchPlaceholderValue: "Search bar",
        itemSelectText: "Press to select",
      });
    });
  }

  // -------------------------
  // Lazy-bg hook (expects updated lazy-bg.js)
  // -------------------------
  function refreshLazyBg(scopeEl) {
    if (typeof window.observeLazyLoad === "function") window.observeLazyLoad(scopeEl);
  }

  // -------------------------
  // Units: create/sync
  // -------------------------
  function getUnits() {
    return Array.from(unitsContainer.querySelectorAll(".step-form-glazing__unit"));
  }

  function createUnitFromTemplate() {
    const fragment = unitTemplate.content.cloneNode(true);
    const unitEl = fragment.querySelector(".step-form-glazing__unit");
    if (!unitEl) throw new Error("[step-form-glazing] Template must contain .step-form-glazing__unit root");

    unitEl.querySelectorAll("input, textarea, select").forEach((el) => {
      if (el.type === "radio" || el.type === "checkbox") el.checked = false;
      else if (el.tagName === "SELECT") el.selectedIndex = 0;
      else if (el.type === "number") el.value = "0";
      else el.value = "";
    });

    unitEl.querySelectorAll(".invalid").forEach((el) => el.classList.remove("invalid"));

    attachNumericMmHandlers(unitEl);
    attachIntegerOnlyHandlers(unitEl);
    initChoices(unitEl);
    refreshLazyBg(unitEl);

    return unitEl;
  }

  function ensureBaseNames(unitEl) {
    unitEl.querySelectorAll("[name]").forEach((el) => {
      if (!el.dataset.baseName) el.dataset.baseName = el.getAttribute("name");
    });
  }

  function syncUnits() {
    const units = getUnits();

    units.forEach((unitEl, idx) => {
      const unitIndex = idx + 1;

      const title = unitEl.querySelector(".step-form-glazing__unit-title");
      if (title) title.textContent = `Unit type ${unitIndex}`;

      const removeBtn = unitEl.querySelector('[data-action="remove-unit"]');
      if (removeBtn) removeBtn.disabled = units.length <= 1;

      // Add is enabled ONLY on last unit
      const addBtn = unitEl.querySelector('[data-action="add-unit"]');
      const isLast = idx === units.length - 1;
      if (addBtn) addBtn.disabled = !isLast;

      const addBtnText = unitEl.querySelector('[data-action="add-unit"] span');
      if (addBtnText) addBtnText.textContent = `Add unit type ${unitIndex + 1}`;

      ensureBaseNames(unitEl);
      unitEl.querySelectorAll("[name]").forEach((el) => {
        const base = el.dataset.baseName;
        el.setAttribute("name", `unit${unitIndex}_${base}`);
      });
    });

    updateSwiperHeight();
  }

  function clearUnitErrors(unitEl) {
    const box = unitEl.querySelector(".step-form-glazing__unit-errors");
    if (box) box.innerHTML = "";
  }

  function renderUnitErrors(unitEl, messages) {
    const box = unitEl.querySelector(".step-form-glazing__unit-errors");
    if (!box) return;

    box.innerHTML = messages.length ? `<ul>${messages.map((m) => `<li>${m}</li>`).join("")}</ul>` : "";
  }

  // -------------------------
  // Validation
  // -------------------------
  function validateRadioGroup(groupEl) {
    const radios = groupEl.querySelectorAll('input[type="radio"]');
    if (!radios.length) return [];

    const isAnyChecked = Array.from(radios).some((r) => r.checked);
    if (isAnyChecked) return [];

    radios.forEach((r) => r.classList.add("invalid"));

    let title = groupEl.getAttribute("data-group-title");
    if (!title) {
      const heading = groupEl.querySelector("legend,h1,h2,h3,h4,h5,h6");
      title = heading ? heading.textContent.trim() : "This field";
    }

    return [`${title}: please select one option.`];
  }

  function validateRequiredSelect(selectEl) {
    if (selectEl.classList.contains("novalidate")) return [];
    const value = (selectEl.value || "").trim();
    if (value !== "") return [];

    selectEl.classList.add("invalid");
    return [`${getFieldLabel(selectEl)}: please select an option.`];
  }

  function validateRequiredQuantity(input) {
    const raw = String(input.value).trim();
    const n = parseInt(raw, 10);

    if (raw === "" || Number.isNaN(n) || !Number.isInteger(n) || n <= 0) {
      input.classList.add("invalid");
      return [`${getFieldLabel(input)}: please enter a quantity greater than 0.`];
    }

    if (n > MAX_QTY) {
      input.classList.add("invalid");
      return [`${getFieldLabel(input)}: maximum allowed is ${MAX_QTY}.`];
    }

    return [];
  }

  function validateOptionalMmInput(input) {
    const raw = input.value.trim();
    if (raw === "") return [];
    if (!/^[0-9]+$/.test(raw)) {
      input.classList.add("invalid");
      return [`${getFieldLabel(input)}: please enter digits only.`];
    }
    return [];
  }

  function validateUnit(unitEl) {
    clearUnitErrors(unitEl);

    const errs = [];

    unitEl.querySelectorAll('[data-required-radio-group="true"]').forEach((g) => {
      errs.push(...validateRadioGroup(g));
    });

    unitEl.querySelectorAll("select.field-select__select--required").forEach((s) => {
      errs.push(...validateRequiredSelect(s));
    });

    unitEl.querySelectorAll("input.field-num__input--required").forEach((q) => {
      errs.push(...validateRequiredQuantity(q));
    });

    unitEl.querySelectorAll("input[data-validate='number-mm']").forEach((mm) => {
      errs.push(...validateOptionalMmInput(mm));
    });

    renderUnitErrors(unitEl, errs);

    return {
      ok: errs.length === 0,
      errorsEl: unitEl.querySelector(".step-form-glazing__unit-errors"),
    };
  }

  function validateStep(currentIndex) {
    if (warningMessage) warningMessage.textContent = "";
    root.querySelectorAll(".invalid").forEach((el) => el.classList.remove("invalid"));

    const slideEl = swiper.slides[currentIndex];
    if (!slideEl) return true;

    // STEP 1: validate all units
    if (currentIndex === 0) {
      let ok = true;
      let firstInvalidErrorsEl = null;

      getUnits().forEach((unitEl) => {
        const r = validateUnit(unitEl);
        if (!r.ok) {
          ok = false;
          if (!firstInvalidErrorsEl) firstInvalidErrorsEl = r.errorsEl;
        }
      });

      updateSwiperHeight();

      if (!ok && firstInvalidErrorsEl) {
        setTimeout(() => {
          firstInvalidErrorsEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 0);
      }

      return ok;
    }

    // STEP 2-3
    const errors = [];

    slideEl.querySelectorAll("input:not(.novalidate), textarea:not(.novalidate)").forEach((input) => {
      const fieldName = getFieldLabel(input);

      if (input.type === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.value.trim())) {
          input.classList.add("invalid");
          errors.push(`${fieldName}: please enter a valid email address.`);
        }
        return;
      }

      if (input.type === "tel") {
        const cleanedPhone = input.value.replace(/[^\d]/g, "");
        const phoneRegex = /^\d{11,12}$/;
        if (!phoneRegex.test(cleanedPhone)) {
          input.classList.add("invalid");
          errors.push(`${fieldName}: please enter a valid contact number (11–12 digits).`);
        }
        return;
      }

      if (input.classList.contains("field-text__input--required")) {
        if (input.value.trim() === "") {
          input.classList.add("invalid");
          errors.push(`${fieldName}: this field is required.`);
        }
      }
    });

    slideEl.querySelectorAll("fieldset").forEach((fs) => {
      if (!fs.querySelector(".one-of")) return;

      const heading = fs.querySelector("h2,h3,h4,h5,h6,th,legend");
      const title = heading ? heading.textContent.trim() : "This section";
      const checkboxes = fs.querySelectorAll("input[type='checkbox']:not(.novalidate)");
      const isAnyChecked = Array.from(checkboxes).some((cb) => cb.checked);

      if (!isAnyChecked) {
        checkboxes.forEach((cb) => cb.classList.add("invalid"));
        errors.push(`${title}: please select at least one option.`);
      }
    });

    if (errors.length && warningMessage) {
      warningMessage.innerHTML = "<ul>" + errors.map((msg) => `<li>${msg}</li>`).join("") + "</ul>";
    }

    return errors.length === 0;
  }

  // -------------------------
  // Click delegation (ADD/REMOVE/+/-)
  // -------------------------
  root.addEventListener("click", (e) => {
    // ADD
    const addBtn = e.target.closest('[data-action="add-unit"]');
    if (addBtn) {
      if (addBtn.disabled) return;

      const currentUnit = e.target.closest(".step-form-glazing__unit");
      if (!currentUnit) return;

      // hard guarantee: only last unit can add
      const units = getUnits();
      const lastUnit = units[units.length - 1];
      if (currentUnit !== lastUnit) return;

      const r = validateUnit(currentUnit);
      updateSwiperHeight();

      if (!r.ok) {
        if (r.errorsEl) {
          setTimeout(() => {
            r.errorsEl.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 0);
        }
        return;
      }

      const newUnit = createUnitFromTemplate();

      if (unitsContainer.contains(currentUnit)) {
        unitsContainer.insertBefore(newUnit, currentUnit.nextSibling);
      } else {
        unitsContainer.appendChild(newUnit);
      }

      syncUnits();
      updateSwiperHeight();

      setTimeout(() => {
        const target =
          newUnit.querySelector(".step-form-glazing__unit-title") ||
          newUnit.querySelector(".step-form-glazing__unit-header") ||
          newUnit;
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);

      return;
    }

    // REMOVE (with confirmation modal)
    const removeBtn = e.target.closest('[data-action="remove-unit"]');
    if (removeBtn) {
      const unitEl = e.target.closest(".step-form-glazing__unit");
      if (!unitEl) return;

      const units = getUnits();
      if (units.length <= 1) return;
      if (!unitsContainer.contains(unitEl)) return;

      // If bootstrap modal is not available - fallback confirm()
      if (!confirmRemoveModal) {
        const ok = window.confirm("Remove this unit? This action cannot be undone.");
        if (!ok) return;

        unitEl.remove();
        syncUnits();
        updateSwiperHeight();
        return;
      }

      pendingRemoveUnitEl = unitEl;
      confirmRemoveModal.show();
      return;
    }

    // PLUS
    const plusBtn = e.target.closest(".field-num__btn--plus");
    if (plusBtn) {
      const wrap = plusBtn.closest(".field-num__input-and-btns");
      const input = wrap ? wrap.querySelector(".field-num__input") : null;
      if (!input) return;

      const max = input.max ? parseInt(input.max, 10) : MAX_QTY;
      const cur = parseInt(input.value || "0", 10);
      const next = Math.min(max, (Number.isNaN(cur) ? 0 : cur) + 1);
      input.value = String(next);
      return;
    }

    // MINUS
    const minusBtn = e.target.closest(".field-num__btn--minus");
    if (minusBtn) {
      const wrap = minusBtn.closest(".field-num__input-and-btns");
      const input = wrap ? wrap.querySelector(".field-num__input") : null;
      if (!input) return;

      const min = input.min ? parseInt(input.min, 10) : 0;
      const cur = parseInt(input.value || "0", 10);
      const next = Math.max(min, (Number.isNaN(cur) ? 0 : cur) - 1);
      input.value = String(next);
      return;
    }
  });

  // -------------------------
  // Focus + navigation
  // -------------------------
  function focusFieldInSlide(slideIndex, toFirstField = true) {
    const slideEl = swiper.slides[slideIndex];
    if (!slideEl) return;

    let fieldToFocus;
    if (toFirstField) fieldToFocus = slideEl.querySelector("input, textarea, select");
    else {
      const fields = slideEl.querySelectorAll("input, textarea, select");
      fieldToFocus = fields.length > 0 ? fields[fields.length - 1] : null;
    }

    if (fieldToFocus) setTimeout(() => fieldToFocus.focus(), 50);
  }

  let isTransitioning = false;

  if (prevButton) {
    prevButton.addEventListener("click", () => {
      if (!isTransitioning && swiper.realIndex > 0) {
        isTransitioning = true;
        swiper.slidePrev();
        setTimeout(() => {
          focusFieldInSlide(swiper.realIndex, false);
          isTransitioning = false;
        }, 400);
      }
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", (event) => {
      event.preventDefault();
      if (isTransitioning) return;

      const totalSlides = swiper.slides.length;
      const currentIndex = swiper.realIndex;

      if (currentIndex < totalSlides - 1) {
        if (validateStep(currentIndex)) {
          isTransitioning = true;
          swiper.slideNext();
          setTimeout(() => {
            focusFieldInSlide(swiper.realIndex, true);
            isTransitioning = false;
          }, 400);
        } else {
          updateSwiperHeight();
        }
      } else {
        if (validateStep(currentIndex)) {
          const submitEvent = new Event("submit", { bubbles: true, cancelable: true });
          form.dispatchEvent(submitEvent);
        }
      }
    });
  }

  // -------------------------
  // Init
  // -------------------------
  generateFlags();

  if (getUnits().length === 0) {
    const firstUnit = createUnitFromTemplate();
    unitsContainer.appendChild(firstUnit);
  }

  attachNumericMmHandlers(root);
  attachIntegerOnlyHandlers(root);
  initChoices(root);
  refreshLazyBg(root);

  syncUnits();
  updateProgress();
  updateSwiperHeight();
})();
