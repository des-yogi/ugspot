(function () {
  const swiperContainer = document.querySelector(".step-form-conserva .step-form__container");
  if (!swiperContainer) return;

  const form = document.querySelector(".step-form-conserva");

  const swiper = new Swiper(swiperContainer, {
    speed: 400,
    slidesPerView: 1,
    spaceBetween: 40,
    allowTouchMove: false,
    autoHeight: true,
    navigation: false,
    on: {
      slideChange: updateProgress,
    },
  });

  const prevButton = document.querySelector(".step-form-conserva .step-form__btn--prev");
  const nextButton = document.querySelector(".step-form-conserva .step-form__btn--next");
  const car = document.querySelector(".step-form-conserva .progress__car");
  const roadProgress = document.querySelector(".step-form-conserva .progress__road-line");
  const progressContainer = document.querySelector(".step-form-conserva .progress");
  const flagsContainer = document.querySelector(".step-form-conserva .progress__flags");
  const slideNum = document.querySelector(".step-form-conserva .progress__slide-num");
  const warningMessage = document.querySelector(".step-form-conserva .step-form__warning");

  // 1. Генерируем флажки
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

  if (swiper.slides.length > 0) {
    generateFlags();
  }

  // 2. Ограничение ввода для полей размеров (inputmode="numeric", data-validate="number-mm")
  function attachNumericInputHandlers(input) {
    input.addEventListener("keydown", function (e) {
      const allowedControlKeys = [
        "Backspace", "Delete", "ArrowLeft", "ArrowRight",
        "Tab", "Home", "End"
      ];

      if (e.ctrlKey || e.metaKey) return;

      const key = e.key;

      if (allowedControlKeys.includes(key)) return;
      if (/^[0-9]$/.test(key)) return;

      e.preventDefault();
    });

    input.addEventListener("paste", function (e) {
      const pasted = (e.clipboardData || window.clipboardData).getData("text");
      if (!/^[0-9]+$/.test(pasted.trim())) {
        e.preventDefault();
      }
    });
  }

  const numberInputs = document.querySelectorAll(
    ".step-form-conserva input[data-validate='number-mm']"
  );
  numberInputs.forEach(attachNumericInputHandlers);

  // 3. Обновление прогресса
  function updateProgress() {
    const totalSlides = swiper.slides.length;
    const currentStep = swiper.realIndex + 1;

    if (!warningMessage || !progressContainer || !car || !roadProgress || !flagsContainer) return;

    warningMessage.textContent = "";
    document.querySelectorAll(".step-form-conserva .invalid").forEach(el => el.classList.remove("invalid"));

    const roadWidth = progressContainer.offsetWidth;
    const carWidth = car.offsetWidth;
    const carPosition = totalSlides > 1
      ? ((currentStep - 1) / (totalSlides - 1)) * (roadWidth - carWidth)
      : 0;

    car.style.transition = "transform 0.4s ease-in-out";
    roadProgress.style.transition = "width 0.4s ease-in-out";

    car.style.transform = `translateX(${carPosition}px)`;
    roadProgress.style.width = totalSlides > 1
      ? `${((currentStep - 1) / (totalSlides - 1)) * 100}%`
      : "0%";

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

    if (slideNum) {
      slideNum.textContent = `(Step ${currentStep} out of ${totalSlides})`;
    }
  }

  let isTransitioning = false;

  // 4. Вспомогательная функция для метки поля
  function getFieldLabel(input) {
    const fieldContainer = input.closest(".field-text");
    if (fieldContainer) {
      const fieldNameEl = fieldContainer.querySelector(".field-text__name");
      if (fieldNameEl) return fieldNameEl.textContent.trim();
    }
    return "This field";
  }

  // 5. Валидация шага
  function validateStep(currentIndex) {
    if (!warningMessage) return true;

    let isValid = true;
    const errorMessages = [];

    warningMessage.textContent = "";
    document
      .querySelectorAll(".step-form-conserva .invalid")
      .forEach(el => el.classList.remove("invalid"));

    const currentSlide = swiper.slides[currentIndex];

    // 5.1 Обязательные radio-группы (на шагах 1–2 и части 2-го шага)
    const requiredRadioGroups = currentSlide.querySelectorAll('[data-required-radio-group="true"]');

    requiredRadioGroups.forEach(groupEl => {
      const radios = groupEl.querySelectorAll('input[type="radio"]');
      if (!radios.length) return;

      const isAnyChecked = Array.from(radios).some(radio => radio.checked);

      let groupTitle = groupEl.getAttribute("data-group-title");
      if (!groupTitle) {
        const heading = groupEl.querySelector("h1,h2,h3,h4,h5,h6");
        groupTitle = heading ? heading.textContent.trim() : "This field";
      }

      if (!isAnyChecked) {
        isValid = false;
        radios.forEach(radio => radio.classList.add("invalid"));
        errorMessages.push(`${groupTitle}: please select one option.`);
      }
    });

    // 5.2 Специальная проверка шага 2 (индекс 1) — размеры
    if (currentIndex === 1) {
      const numberFields = currentSlide.querySelectorAll('input[data-validate="number-mm"]');

      numberFields.forEach(input => {
        const raw = input.value.trim();
        if (raw === "") return; // поле необязательное

        const numberRegex = /^[0-9]+$/; // только цифры
        const fieldName = getFieldLabel(input);

        if (!numberRegex.test(raw)) {
          isValid = false;
          input.classList.add("invalid");
          errorMessages.push(`${fieldName}: please enter a valid number in millimetres.`);
          return;
        }

        const value = parseInt(raw, 10);
        const min = 1;
        const max = 100000;

        if (value < min || value > max) {
          isValid = false;
          input.classList.add("invalid");
          errorMessages.push(`${fieldName}: please enter a value between ${min} and ${max} mm.`);
        }
      });

      // Здесь же можно добавить "умную" проверку textarea extra-info, если нужно
    }

    // 5.3 Общая проверка текстовых/телефонных/e-mail полей для шагов 3–4 (как в старом скрипте)
    // Берём логику из твоего старого validateStep для email/tel/required,
    // но ограничиваем её шагами 2–4, чтобы не трогать первый шаг.
    if (currentIndex >= 2) {
      const inputs = currentSlide.querySelectorAll("input:not(.novalidate), textarea:not(.novalidate)");

      inputs.forEach(input => {
        const fieldName = getFieldLabel(input);

        if (input.type === "email") {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(input.value.trim())) {
            isValid = false;
            input.classList.add("invalid");
            errorMessages.push(`${fieldName}: please enter a valid email address.`);
          }
        } else if (input.type === "tel") {
          const cleanedPhone = input.value.replace(/[^\d]/g, "");
          const phoneRegex = /^\d{11,12}$/;
          if (!phoneRegex.test(cleanedPhone)) {
            isValid = false;
            input.classList.add("invalid");
            errorMessages.push(`${fieldName}: please enter a valid contact number (11–12 digits).`);
          }
        } else if (input.classList.contains("field-text__input--required")) {
          if (input.value.trim() === "") {
            isValid = false;
            input.classList.add("invalid");
            errorMessages.push(`${fieldName}: this field is required.`);
          }
        }
      });

      // Группы checkbox one-of (таблица с днями)
      const fieldsetsWithOneOf = currentSlide.querySelectorAll("fieldset:has(.one-of)");
      fieldsetsWithOneOf.forEach(fieldset => {
        const heading = fieldset.querySelector("h2,h3,h4,h5,h6,th");
        const fieldsetTitle = heading ? heading.textContent.trim() : "This section";
        const checkboxes = fieldset.querySelectorAll("input[type='checkbox']:not(.novalidate)");

        const isAnyChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);

        if (!isAnyChecked) {
          isValid = false;
          checkboxes.forEach(checkbox => checkbox.classList.add("invalid"));
          errorMessages.push(`${fieldsetTitle}: please select at least one option.`);
        }
      });
    }

    if (errorMessages.length > 0) {
      warningMessage.innerHTML =
        "<ul>" + errorMessages.map(msg => `<li>${msg}</li>`).join("") + "</ul>";
    }

    return isValid;
  }

  // 6. Фокусировка на поле при переходе
  function focusFieldInSlide(slideIndex, toFirstField = true) {
    const currentSlide = swiper.slides[slideIndex];
    let fieldToFocus;

    if (toFirstField) {
      fieldToFocus = currentSlide.querySelector("input, textarea, select");
    } else {
      const fields = currentSlide.querySelectorAll("input, textarea, select");
      fieldToFocus = fields.length > 0 ? fields[fields.length - 1] : null;
    }

    if (fieldToFocus) {
      setTimeout(() => fieldToFocus.focus(), 50);
    }
  }

  // 7. Обработчики кнопок
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
    nextButton.addEventListener("click", event => {
      event.preventDefault();

      if (!isTransitioning) {
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
          }
        } else {
          if (validateStep(currentIndex)) {
            // последний шаг валиден — отправляем форму
            if (form) {
              const submitEvent = new Event("submit", { bubbles: true, cancelable: true });
              form.dispatchEvent(submitEvent);
            }
          }
        }
      }
    });
  }

  if (swiper.slides.length > 0) {
    updateProgress();
  }
})();
