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

    console.log("Текущий шаг:", currentStep);

    // Очищаем сообщения об ошибках при смене слайда
    warningMessage.textContent = "";

    // Двигаем машину синхронно со сменой слайда
    const roadWidth = progressContainer.offsetWidth;
    const carWidth = car.offsetWidth;
    const carPosition = (currentStep / totalSlides) * (roadWidth - carWidth);

    car.style.transition = "transform 0.4s ease-in-out";
    roadProgress.style.transition = "width 0.4s ease-in-out";

    car.style.transform = `translateX(${carPosition}px)`;
    roadProgress.style.width = `${(currentStep / totalSlides) * 100}%`;

    // Обновляем флажки
    flags.forEach((flag, index) => {
      flag.classList.toggle("progress__flag--active", index <= currentStep);
    });

    // Блокируем кнопку "Назад" на первом шаге
    prevButton.disabled = currentStep === 0;

    // Кнопка "Далее" и "Отправить"
    if (currentStep === totalSlides) {
      nextButton.textContent = "Submit";
      nextButton.setAttribute("type", "submit");
      nextButton.disabled = false;
    } else {
      nextButton.textContent = "Next step";
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
      // Ищем ближайший .field-text__name для текущего input
      const fieldContainer = input.closest(".field-text"); // Предполагаем, что input внутри блока .field-text
      const fieldName = fieldContainer ? fieldContainer.querySelector(".field-text__name")?.textContent.trim() : "This field";

      if (input.type === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.value.trim())) {
          isValid = false;
          input.classList.add("invalid");
          errorMessages.push(`${fieldName}: Invalid email format`);
        }
      } else if (input.type === "tel") {
        const phoneRegex = /^\+?\d{10,15}$/;
        if (!phoneRegex.test(input.value.trim())) {
          isValid = false;
          input.classList.add("invalid");
          errorMessages.push(`${fieldName}: Invalid phone number format`);
        }
      } else if (input.value.trim() === "") {
        isValid = false;
        input.classList.add("invalid");
        errorMessages.push(`${fieldName}: Please fill in this required field`);
      }
    });

    // Проверка групп чекбоксов
    function validateCheckboxGroups(selector) {
      const groups = currentSlide.querySelectorAll(selector);
      if (groups.length > 0) {
        let atLeastOneChecked = false;
        let fieldsetTitle = "";

        groups.forEach(group => {
          const checkboxes = group.querySelectorAll("input[type='checkbox']:not(.novalidate)");
          if (!fieldsetTitle) {
            const fieldset = group.closest("fieldset");
            fieldsetTitle = fieldset ? fieldset.querySelector("h2, h3, h4, h5, h6")?.textContent.trim() || "This section" : "This section";
          }

          if (Array.from(checkboxes).some(checkbox => checkbox.checked)) {
            atLeastOneChecked = true;
          }
        });

        if (!atLeastOneChecked) {
          isValid = false;
          groups.forEach(group => {
            group.querySelectorAll("input[type='checkbox']").forEach(checkbox => checkbox.classList.add("invalid"));
          });
          errorMessages.push(`${fieldsetTitle}: Please select at least one option`);
        }
      }
    }

    validateCheckboxGroups(".media-checkbox");
    validateCheckboxGroups("fieldset .one-of");

    if (errorMessages.length > 0) {
      warningMessage.innerHTML = "<ul class='list-nostyled'>" + errorMessages.map(msg => `<li>${msg}</li>`).join("") + "</ul>";
    }

    return isValid;
  }

  function focusFieldInSlide(slideIndex, toFirstField = true) {
    const currentSlide = swiperStepForm.slides[slideIndex];
    const focusableFields = currentSlide.querySelectorAll("input, textarea, select");

    if (focusableFields.length > 0) {
      const fieldToFocus = toFirstField ? focusableFields[0] : focusableFields[focusableFields.length - 1];
      setTimeout(() => fieldToFocus.focus(), 50);
    }
  }

  prevButton.addEventListener("click", () => {
    if (!isTransitioning && swiperStepForm.realIndex > 0) {
      isTransitioning = true;
      console.log("⬅ Нажали кнопку Назад");
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
          console.log("✔ Валидация пройдена, переключаем слайд");
          swiperStepForm.slideNext();
          setTimeout(() => {
            focusFieldInSlide(swiperStepForm.realIndex, true);
            isTransitioning = false;
          }, 400);
        }
      } else {
        if (validateStep(currentIndex)) {
          console.log("✔ Валидация последнего шага пройдена, отправляем форму");
          submitForm();
        } else {
          console.log("✖ Ошибки на последнем шаге, форма не отправлена");
        }
      }
    }
  });

  function submitForm() {
    const form = document.querySelector(".step-form");
    form.submit();
  }
})();
