/*(function () {
  const swiperStepForm = new Swiper(".step-form__container", {
    speed: 400,
    slidesPerView: 1,
    allowTouchMove: false,
    autoHeight: true,
    navigation: false,
    on: {
      slideChange: updateProgress,
    },
  });

  const prevButton = document.querySelector(".step-form__btn--prev");
  const nextButton = document.querySelector(".step-form__btn--next");
  const car = document.querySelector(".progress__car");
  const roadProgress = document.querySelector(".progress__road-line");
  const progressContainer = document.querySelector(".progress");
  const flagsContainer = document.querySelector(".progress__flags"); // Контейнер для флажков
  const slideNum = document.querySelector(".progress__slide-num");
  const warningMessage = document.querySelector(".step-form__warning");

  const phoneInputs = document.querySelectorAll('input[type="tel"]');

  // Генерация флажков
  function generateFlags() {
    const totalSlides = swiperStepForm.slides.length;
    flagsContainer.innerHTML = ''; // Очищаем контейнер

    for (let i = 0; i < totalSlides; i++) {
      const flag = document.createElement('span');
      flag.classList.add('progress__flag');
      flag.setAttribute('data-step', i);
      flagsContainer.appendChild(flag);
    }
  }

  // Вызываем генерацию флажков после инициализации Swiper
  generateFlags();

  function handlePhoneInput(input) {
    const errorSpan = input.closest('.field-text')?.querySelector('.field-text__help-text[data-error="tel"]');
    if (!errorSpan) return;

    input.addEventListener('keydown', function (e) {
      const value = e.target.value;
      const digitCount = value.replace(/[^\d]/g, '').length;
      const key = e.key;

      if (e.ctrlKey || e.metaKey || ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(key)) {
        return;
      }

      const isPlus = key === '+';
      const isDigit = /\d/.test(key);
      const hasPlus = value.startsWith('+');

      if (
        (!isPlus && !isDigit) ||
        (isPlus && value.length > 0) ||
        (digitCount >= 12 && isDigit)
      ) {
        e.preventDefault();
        errorSpan.textContent = 'Only + (at the start) and up to 12 digits are allowed';
        e.target.classList.add('invalid');
      } else {
        errorSpan.textContent = '';
        e.target.classList.remove('invalid');
      }
    });

    input.addEventListener('paste', function (e) {
      const pastedData = (e.clipboardData || window.clipboardData).getData('text');
      const currentValue = e.target.value;
      const hasPlus = currentValue.startsWith('+');
      const digitCount = currentValue.replace(/[^\d]/g, '').length;
      const newDigitCount = pastedData.replace(/[^\d]/g, '').length + digitCount;

      if (
        /[^\d+]/.test(pastedData) ||
        (pastedData.includes('+') && (hasPlus || currentValue.length > 0)) ||
        newDigitCount > 12
      ) {
        e.preventDefault();
        errorSpan.textContent = 'Only + (at the start) and up to 12 digits are allowed';
        e.target.classList.add('invalid');
      } else {
        errorSpan.textContent = '';
        e.target.classList.remove('invalid');
      }
    });

    input.addEventListener('input', function (e) {
      const value = e.target.value;
      const hasInvalidChars = /[^\d+]/.test(value);
      const plusCount = (value.match(/\+/g) || []).length;
      const digitCount = value.replace(/[^\d]/g, '').length;

      if (!hasInvalidChars && plusCount <= 1 && digitCount <= 12) {
        errorSpan.textContent = '';
        e.target.classList.remove('invalid');
      }
    });
  }

  phoneInputs.forEach(phoneInput => handlePhoneInput(phoneInput));

  function updateProgress() {
    const totalSlides = swiperStepForm.slides.length;
    const currentStep = swiperStepForm.realIndex + 1;

    //console.log("Текущий шаг:", currentStep - 1);

    warningMessage.textContent = "";
    document.querySelectorAll(".invalid").forEach(el => el.classList.remove("invalid"));

    const roadWidth = progressContainer.offsetWidth;
    const carWidth = car.offsetWidth;
    const carPosition = totalSlides > 1 ? ((currentStep - 1) / (totalSlides - 1)) * (roadWidth - carWidth) : 0;

    car.style.transition = "transform 0.4s ease-in-out";
    roadProgress.style.transition = "width 0.4s ease-in-out";

    car.style.transform = `translateX(${carPosition}px)`;
    roadProgress.style.width = totalSlides > 1 ? `${((currentStep - 1) / (totalSlides - 1)) * 100}%` : '0%';

    const flags = flagsContainer.querySelectorAll('.progress__flag'); // Получаем динамические флажки
    flags.forEach((flag, index) => {
      flag.classList.toggle('progress__flag--active', index < currentStep);
    });

    prevButton.disabled = currentStep === 1;

    const nextButtonText = nextButton.querySelector("span");
    if (currentStep === totalSlides) {
      nextButtonText.textContent = "Submit";
      nextButton.setAttribute("type", "submit");
      nextButton.disabled = false;
    } else {
      nextButtonText.textContent = "Next step";
      nextButton.setAttribute("type", "button");
      nextButton.disabled = false;
    }

    if (slideNum) {
      slideNum.textContent = `(Step ${currentStep} of ${totalSlides})`;
    }
  }

  let isTransitioning = false;

  function validateStep(currentIndex) {
    let isValid = true;
    const errorMessages = [];

    warningMessage.textContent = "";
    document.querySelectorAll(".invalid").forEach(el => el.classList.remove("invalid"));

    const currentSlide = swiperStepForm.slides[currentIndex];
    const inputs = currentSlide.querySelectorAll("input:not(.novalidate), textarea:not(.novalidate)");

    inputs.forEach(input => {
      const fieldContainer = input.closest(".field-text");
      let fieldName;

      if (fieldContainer && fieldContainer.querySelector(".field-text__name")) {
        fieldName = fieldContainer.querySelector(".field-text__name").textContent.trim();
      } else {
        const fieldset = input.closest("fieldset");
        fieldName = fieldset ? fieldset.querySelector("h2, h3, h4, h5, h6")?.textContent.trim() || "This field" : "This field";
      }

      if (input.type === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.value.trim())) {
          isValid = false;
          input.classList.add("invalid");
          errorMessages.push(`${fieldName}: Invalid email format`);
        }
      } else if (input.type === "tel") {
        const hasInvalidChars = /[^\d\s\-\+]/g.test(input.value);
        const cleanedPhone = input.value.replace(/[^\d]/g, '');
        const phoneRegex = /^\d{11,12}$/;
        if (hasInvalidChars || !phoneRegex.test(cleanedPhone)) {
          isValid = false;
          input.classList.add("invalid");
          errorMessages.push(`${fieldName}: Phone number must be 11-12 digits (numbers only)`);
        }
      } else if (input.value.trim() === "") {
        isValid = false;
        input.classList.add("invalid");
        errorMessages.push(`${fieldName}: Please fill in this required field`);
      }
    });

    function validateCheckboxGroups(fieldsetSelector) {
      const fieldsets = currentSlide.querySelectorAll(fieldsetSelector);
      fieldsets.forEach(fieldset => {
        const checkboxes = fieldset.querySelectorAll("input[type='checkbox']:not(.novalidate)");
        const fieldsetTitle = fieldset.querySelector("h2, h3, h4, h5, h6")?.textContent.trim() || "This section";

        const isAnyChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);
        if (!isAnyChecked) {
          isValid = false;
          checkboxes.forEach(checkbox => checkbox.classList.add("invalid"));
          errorMessages.push(`${fieldsetTitle}: Please select at least one option`);
        }
      });
    }

    validateCheckboxGroups("fieldset:has(.media-checkbox)");
    validateCheckboxGroups("fieldset:has(.one-of)");

    if (errorMessages.length > 0) {
      warningMessage.innerHTML = "<ul>" + errorMessages.map(msg => `<li>${msg}</li>`).join("") + "</ul>";
    }

    return isValid;
  }

  function focusFieldInSlide(slideIndex, toFirstField = true) {
    const currentSlide = swiperStepForm.slides[slideIndex];
    let fieldToFocus;

    if (toFirstField) {
      fieldToFocus = currentSlide.querySelector("input, textarea, select");
    } else {
      const fields = currentSlide.querySelectorAll("input, textarea, select");
      fieldToFocus = fields[fields.length - 1];
    }

    if (fieldToFocus) {
      setTimeout(() => fieldToFocus.focus(), 50);
    }
  }

  prevButton.addEventListener("click", () => {
    if (!isTransitioning && swiperStepForm.realIndex > 0) {
      isTransitioning = true;
      //console.log("⬅ Нажали кнопку Назад");
      swiperStepForm.slidePrev();
      setTimeout(() => {
        focusFieldInSlide(swiperStepForm.realIndex, false);
        isTransitioning = false;
      }, 400);
    }
  });

  nextButton.addEventListener("click", event => {
    event.preventDefault();

    if (!isTransitioning) {
      const totalSlides = swiperStepForm.slides.length;
      const currentIndex = swiperStepForm.realIndex;

      if (currentIndex < totalSlides - 1) {
        if (validateStep(currentIndex)) {
          isTransitioning = true;
          //console.log("✔ Валидация пройдена, переключаем слайд");
          swiperStepForm.slideNext();
          setTimeout(() => {
            focusFieldInSlide(swiperStepForm.realIndex, true);
            isTransitioning = false;
          }, 400);
        }
      } else {
        if (validateStep(currentIndex)) {
          console.log("✔ Validation of the last step is passed, submit the form");
          submitForm();
        } else {
          console.log("✖ Errors on the last step, form not submitted");
        }
      }
    }
  });

  function submitForm() {
    const form = document.querySelector(".step-form");
    //form.submit(); // отправка напрямую отключена
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(submitEvent);
  }

  // Инициализируем прогресс при загрузке
  updateProgress();

  // Если Swiper инициализируется с разным количеством слайдов динамически (например, через AJAX), надо вызвать generateFlags() после обновления слайдов и вызвать swiperStepForm.update().
})();
*/

(function () {
  // Проверяем наличие основного контейнера Swiper перед инициализацией
  const swiperContainer = document.querySelector(".step-form__container");
  if (!swiperContainer) return; // Прерываем выполнение, если нет контейнера формы

  const swiperStepForm = new Swiper(".step-form__container", {
    speed: 400,
    slidesPerView: 1,
    allowTouchMove: false,
    autoHeight: true,
    navigation: false,
    on: {
      slideChange: updateProgress,
    },
  });

  // Все элементы, к которым обращаемся
  const prevButton = document.querySelector(".step-form__btn--prev");
  const nextButton = document.querySelector(".step-form__btn--next");
  const car = document.querySelector(".progress__car");
  const roadProgress = document.querySelector(".progress__road-line");
  const progressContainer = document.querySelector(".progress");
  const flagsContainer = document.querySelector(".progress__flags");
  const slideNum = document.querySelector(".progress__slide-num");
  const warningMessage = document.querySelector(".step-form__warning");

  const phoneInputs = document.querySelectorAll('input[type="tel"]');

  // Генерация флажков
  function generateFlags() {
    if (!flagsContainer) return; // Проверка на существование
    const totalSlides = swiperStepForm.slides.length;
    flagsContainer.innerHTML = ''; // Безопасно, так как проверено выше
    for (let i = 0; i < totalSlides; i++) {
      const flag = document.createElement('span');
      flag.classList.add('progress__flag');
      flag.setAttribute('data-step', i);
      flagsContainer.appendChild(flag);
    }
  }

  if (swiperStepForm.slides.length > 0) {
    generateFlags(); // Вызываем только если есть слайды
  }

  // Обработка телефонных инпутов
  function handlePhoneInput(input) {
    // Проверяем наличие input (хотя это избыточно, так как он приходит из forEach)
    if (!input) return;
    const fieldText = input.closest('.field-text');
    const errorSpan = fieldText ? fieldText.querySelector('.field-text__help-text[data-error="tel"]') : null;
    if (!errorSpan) return; // Прерываем, если нет errorSpan

    input.addEventListener('keydown', function (e) {
      const value = e.target.value;
      const digitCount = value.replace(/[^\d]/g, '').length;
      const key = e.key;

      if (e.ctrlKey || e.metaKey || ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(key)) {
        return;
      }

      const isPlus = key === '+';
      const isDigit = /\d/.test(key);
      const hasPlus = value.startsWith('+');

      if (
        (!isPlus && !isDigit) ||
        (isPlus && value.length > 0) ||
        (digitCount >= 12 && isDigit)
      ) {
        e.preventDefault();
        errorSpan.textContent = 'Only + (at the start) and up to 12 digits are allowed';
        e.target.classList.add('invalid');
      } else {
        errorSpan.textContent = '';
        e.target.classList.remove('invalid');
      }
    });

    input.addEventListener('paste', function (e) {
      const pastedData = (e.clipboardData || window.clipboardData).getData('text');
      const currentValue = e.target.value;
      const hasPlus = currentValue.startsWith('+');
      const digitCount = currentValue.replace(/[^\d]/g, '').length;
      const newDigitCount = pastedData.replace(/[^\d]/g, '').length + digitCount;

      if (
        /[^\d+]/.test(pastedData) ||
        (pastedData.includes('+') && (hasPlus || currentValue.length > 0)) ||
        newDigitCount > 12
      ) {
        e.preventDefault();
        errorSpan.textContent = 'Only + (at the start) and up to 12 digits are allowed';
        e.target.classList.add('invalid');
      } else {
        errorSpan.textContent = '';
        e.target.classList.remove('invalid');
      }
    });

    input.addEventListener('input', function (e) {
      const value = e.target.value;
      const hasInvalidChars = /[^\d+]/.test(value);
      const plusCount = (value.match(/\+/g) || []).length;
      const digitCount = value.replace(/[^\d]/g, '').length;

      if (!hasInvalidChars && plusCount <= 1 && digitCount <= 12) {
        errorSpan.textContent = '';
        e.target.classList.remove('invalid');
      }
    });
  }

  // Безопасно обрабатываем phoneInputs
  if (phoneInputs.length > 0) {
    phoneInputs.forEach(phoneInput => handlePhoneInput(phoneInput));
  }

  // Синхронизация чекбокса, количества и класса checked
  function syncCheckboxAndQuantity() {
    const mediaCheckboxBlocks = document.querySelectorAll('.media-checkbox');
    if (mediaCheckboxBlocks.length === 0) return; // Прерываем, если нет блоков

    mediaCheckboxBlocks.forEach(block => {
      const checkbox = block.querySelector('.media-checkbox__input');
      const quantityInput = block.querySelector('.field-num__input');
      const plusButton = block.querySelector('.field-num__btn--plus');
      const minusButton = block.querySelector('.field-num__btn--minus');

      // Проверяем все элементы внутри блока
      if (!checkbox || !quantityInput || !plusButton || !minusButton) return;

      quantityInput.min = 0;
      quantityInput.max = 50;
      quantityInput.step = 1;

      function updateState() {
        const value = parseInt(quantityInput.value, 10) || 0;
        checkbox.checked = value > 0;
        if (value > 0) {
          block.classList.add('checked');
        } else {
          block.classList.remove('checked');
        }
      }

      checkbox.addEventListener('change', function () {
        if (!this.checked) {
          quantityInput.value = 0;
          block.classList.remove('checked');
        } else {
          if (parseInt(quantityInput.value, 10) === 0) {
            quantityInput.value = 1;
          }
          block.classList.add('checked');
        }
      });

      quantityInput.addEventListener('input', function () {
        const value = parseInt(this.value, 10) || 0;
        if (value > 50) this.value = 50;
        if (value < 0) this.value = 0;
        updateState();
      });

      plusButton.addEventListener('click', function () {
        let value = parseInt(quantityInput.value, 10) || 0;
        if (value < 50) {
          quantityInput.value = value + 1;
          updateState();
          quantityInput.focus();
        }
      });

      minusButton.addEventListener('click', function () {
        let value = parseInt(quantityInput.value, 10) || 0;
        if (value > 0) {
          quantityInput.value = value - 1;
          updateState();
          quantityInput.focus();
        }
      });
    });
  }

  syncCheckboxAndQuantity();

  // Обновление прогресса
  function updateProgress() {
    const totalSlides = swiperStepForm.slides.length;
    const currentStep = swiperStepForm.realIndex + 1;

    // Проверяем все необходимые элементы
    if (!warningMessage || !progressContainer || !car || !roadProgress || !flagsContainer) return;

    warningMessage.textContent = "";
    document.querySelectorAll(".invalid").forEach(el => el.classList.remove("invalid"));

    const roadWidth = progressContainer.offsetWidth;
    const carWidth = car.offsetWidth;
    const carPosition = totalSlides > 1 ? ((currentStep - 1) / (totalSlides - 1)) * (roadWidth - carWidth) : 0;

    car.style.transition = "transform 0.4s ease-in-out";
    roadProgress.style.transition = "width 0.4s ease-in-out";

    car.style.transform = `translateX(${carPosition}px)`;
    roadProgress.style.width = totalSlides > 1 ? `${((currentStep - 1) / (totalSlides - 1)) * 100}%` : '0%';

    const flags = flagsContainer.querySelectorAll('.progress__flag');
    flags.forEach((flag, index) => {
      flag.classList.toggle('progress__flag--active', index < currentStep);
    });

    if (prevButton) prevButton.disabled = currentStep === 1;

    if (nextButton) {
      const nextButtonText = nextButton.querySelector("span");
      if (nextButtonText) { // Проверяем наличие span внутри кнопки
        if (currentStep === totalSlides) {
          nextButtonText.textContent = "Submit";
          nextButton.setAttribute("type", "submit");
          nextButton.disabled = false;
        } else {
          nextButtonText.textContent = "Next step";
          nextButton.setAttribute("type", "button");
          nextButton.disabled = false;
        }
      }
    }

    if (slideNum) {
      slideNum.textContent = `(Step ${currentStep} of ${totalSlides})`;
    }
  }

  let isTransitioning = false;

  // Валидация шага
  function validateStep(currentIndex) {
    if (!warningMessage) return true; // Пропускаем, если нет warningMessage

    let isValid = true;
    const errorMessages = [];

    warningMessage.textContent = "";
    document.querySelectorAll(".invalid").forEach(el => el.classList.remove("invalid"));

    const currentSlide = swiperStepForm.slides[currentIndex];
    const inputs = currentSlide.querySelectorAll("input:not(.novalidate), textarea:not(.novalidate)");

    inputs.forEach(input => {
      const fieldContainer = input.closest(".field-text");
      let fieldName;

      if (fieldContainer) {
        const fieldNameEl = fieldContainer.querySelector(".field-text__name");
        fieldName = fieldNameEl ? fieldNameEl.textContent.trim() : "This field";
      } else {
        const fieldset = input.closest("fieldset");
        const heading = fieldset ? fieldset.querySelector("h2, h3, h4, h5, h6") : null;
        fieldName = heading ? heading.textContent.trim() : "This field";
      }

      if (input.type === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.value.trim())) {
          isValid = false;
          input.classList.add("invalid");
          errorMessages.push(`${fieldName}: Invalid email format`);
        }
      } else if (input.type === "tel") {
        const hasInvalidChars = /[^\d\s\-\+]/g.test(input.value);
        const cleanedPhone = input.value.replace(/[^\d]/g, '');
        const phoneRegex = /^\d{11,12}$/;
        if (hasInvalidChars || !phoneRegex.test(cleanedPhone)) {
          isValid = false;
          input.classList.add("invalid");
          errorMessages.push(`${fieldName}: Phone number must be 11-12 digits (numbers only)`);
        }
      } else if (input.value.trim() === "") {
        isValid = false;
        input.classList.add("invalid");
        errorMessages.push(`${fieldName}: Please fill in this required field`);
      }
    });

    function validateCheckboxGroups(fieldsetSelector) {
      const fieldsets = currentSlide.querySelectorAll(fieldsetSelector);
      fieldsets.forEach(fieldset => {
        const heading = fieldset.querySelector("h2, h3, h4, h5, h6");
        const fieldsetTitle = heading ? heading.textContent.trim() : "This section";
        let isAnyValid = false;

        if (fieldset.matches("fieldset:has(.media-checkbox)")) {
          const checkboxes = fieldset.querySelectorAll(".media-checkbox__input:not(.novalidate)");
          const quantities = fieldset.querySelectorAll(".field-num__input");

          isAnyValid = Array.from(checkboxes).some((checkbox, index) => {
            const quantity = quantities[index] ? parseInt(quantities[index].value, 10) || 0 : 0;
            return checkbox.checked || quantity > 0;
          });

          if (!isAnyValid) {
            isValid = false;
            checkboxes.forEach(checkbox => checkbox.classList.add("invalid"));
            quantities.forEach(quantity => quantity.classList.add("invalid"));
            errorMessages.push(`${fieldsetTitle}: Please select at least one option or set a quantity`);
          }
        } else if (fieldset.matches("fieldset:has(.one-of)")) {
          const checkboxes = fieldset.querySelectorAll("input[type='checkbox']:not(.novalidate)");

          isAnyValid = Array.from(checkboxes).some(checkbox => checkbox.checked);

          if (!isAnyValid) {
            isValid = false;
            checkboxes.forEach(checkbox => checkbox.classList.add("invalid"));
            errorMessages.push(`${fieldsetTitle}: Please select at least one option`);
          }
        }
      });
    }

    validateCheckboxGroups("fieldset:has(.media-checkbox)");
    validateCheckboxGroups("fieldset:has(.one-of)");

    if (errorMessages.length > 0) {
      warningMessage.innerHTML = "<ul>" + errorMessages.map(msg => `<li>${msg}</li>`).join("") + "</ul>";
    }

    return isValid;
  }

  // Фокусировка на поле
  function focusFieldInSlide(slideIndex, toFirstField = true) {
    const currentSlide = swiperStepForm.slides[slideIndex];
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

  // Обработчики кнопок
  if (prevButton) {
    prevButton.addEventListener("click", () => {
      if (!isTransitioning && swiperStepForm.realIndex > 0) {
        isTransitioning = true;
        swiperStepForm.slidePrev();
        setTimeout(() => {
          focusFieldInSlide(swiperStepForm.realIndex, false);
          isTransitioning = false;
        }, 400);
      }
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", event => {
      event.preventDefault();

      if (!isTransitioning) {
        const totalSlides = swiperStepForm.slides.length;
        const currentIndex = swiperStepForm.realIndex;

        if (currentIndex < totalSlides - 1) {
          if (validateStep(currentIndex)) {
            isTransitioning = true;
            swiperStepForm.slideNext();
            setTimeout(() => {
              focusFieldInSlide(swiperStepForm.realIndex, true);
              isTransitioning = false;
            }, 400);
          }
        } else {
          if (validateStep(currentIndex)) {
            console.log("✔ Validation of the last step is passed, submitting the form");
            submitForm();
          } else {
            console.log("✖ Errors on the last step, form not submitted");
          }
        }
      }
    });
  }

  // Отправка формы
  function submitForm() {
    const form = document.querySelector(".step-form");
    if (form) {
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      form.dispatchEvent(submitEvent);
    }
  }

  if (swiperStepForm.slides.length > 0) {
    updateProgress(); // Вызываем только если есть слайды
  }

  // Если Swiper инициализируется с разным количеством слайдов динамически (например, через AJAX), надо вызвать generateFlags() после обновления слайдов и вызвать swiperStepForm.update().
})();
