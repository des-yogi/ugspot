(function () {
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
  const flags = document.querySelectorAll(".progress__flag");
  const progressContainer = document.querySelector(".progress");
  const warningMessage = document.querySelector(".step-form__warning");

  function updateProgress() {
    const totalSlides = swiperStepForm.slides.length - 1;
    const currentStep = swiperStepForm.realIndex;

    //console.log("Текущий шаг:", currentStep);

    warningMessage.textContent = "";
    document.querySelectorAll(".invalid").forEach(el => el.classList.remove("invalid"));

    const roadWidth = progressContainer.offsetWidth;
    const carWidth = car.offsetWidth;
    const carPosition = (currentStep / totalSlides) * (roadWidth - carWidth);

    car.style.transition = "transform 0.4s ease-in-out";
    roadProgress.style.transition = "width 0.4s ease-in-out";

    car.style.transform = `translateX(${carPosition}px)`;
    roadProgress.style.width = `${(currentStep / totalSlides) * 100}%`;

    flags.forEach((flag, index) => {
      flag.classList.toggle("progress__flag--active", index <= currentStep);
    });

    prevButton.disabled = currentStep === 0;

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
        const hasInvalidChars = /[^\d\s\-\+]/g.test(input.value); // Проверяем наличие букв или недопустимых символов
        const cleanedPhone = input.value.replace(/[^\d]/g, ''); // Убираем все, кроме цифр
        const phoneRegex = /^\d{11,12}$/; // 11-12 цифр
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
      const totalSlides = swiperStepForm.slides.length - 1;
      const currentIndex = swiperStepForm.realIndex;

      if (currentIndex < totalSlides) {
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
          //console.log("✔ Валидация последнего шага пройдена, отправляем форму");
          submitForm();
        } else {
          console.log("✖ Errors on the last step, form not submitted");
        }
      }
    }
  });

  function submitForm() {
    const form = document.querySelector(".step-form");
    form.submit();
  }
})();
