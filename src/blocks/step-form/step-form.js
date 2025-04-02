(function(){
  const swiperStepForm = new Swiper('.step-form__container', {
    speed: 400,
    slidesPerView: 1,
    allowTouchMove: false,
    autoHeight: true,
    navigation: false, // Отключаем стандартные кнопки Swiper
    on: {
      slideChange: updateProgress // Обновляем прогресс сразу при начале смены слайда
    }
  });

  const prevButton = document.querySelector('.step-form__btn--prev');
  const nextButton = document.querySelector('.step-form__btn--next');
  const car = document.querySelector('.progress__car');
  const roadProgress = document.querySelector('.progress__road-line');
  const flags = document.querySelectorAll('.progress__flag');
  const progressContainer = document.querySelector('.progress');

  function updateProgress() {
    const totalSlides = swiperStepForm.slides.length - 1;
    const currentStep = swiperStepForm.realIndex;

    console.log("Текущий шаг:", currentStep);

    // 🔹 Двигаем машину синхронно со сменой слайда
    const roadWidth = progressContainer.offsetWidth;
    const carWidth = car.offsetWidth;
    const carPosition = (currentStep / totalSlides) * (roadWidth - carWidth);

    car.style.transition = "transform 0.4s ease-in-out";
    roadProgress.style.transition = "width 0.4s ease-in-out";

    car.style.transform = `translateX(${carPosition}px)`;
    roadProgress.style.width = `${(currentStep / totalSlides) * 100}%`;

    // 🔹 Обновляем флажки
    flags.forEach((flag, index) => {
      flag.classList.toggle('progress__flag--active', index <= currentStep);
    });

    // 🔹 Блокируем кнопку "Назад" на первом шаге
    prevButton.disabled = currentStep === 0;

    // 🔹 Кнопка "Далее" и "Отправить"
    if (currentStep === totalSlides) {
      nextButton.textContent = "Submit";
      nextButton.setAttribute("type", "submit");
      nextButton.disabled = false;
    } else {
      nextButton.textContent = "Next step";
      nextButton.setAttribute("type", "button"); // ⛔ Гарантируем, что это button
      nextButton.disabled = false;
    }
  }

  let isTransitioning = false;

  // 🔹 Обработчик "Назад"
  prevButton.addEventListener('click', () => {
    if (!isTransitioning && swiperStepForm.realIndex > 0) {
      isTransitioning = true;
      console.log("⬅ Нажали кнопку Назад");
      swiperStepForm.slidePrev();
      setTimeout(() => { isTransitioning = false; }, 400);
    }
  });

  // 🔹 Обработчик "Далее"
  nextButton.addEventListener('click', () => {
    event.preventDefault(); // Останавливаем стандартное поведение формы

    if (!isTransitioning) {
      const totalSlides = swiperStepForm.slides.length - 1;
      if (swiperStepForm.realIndex < totalSlides) {
        isTransitioning = true;
        console.log("Нажали кнопку Далее");
        swiperStepForm.slideNext();
        setTimeout(() => { isTransitioning = false; }, 400);
      } else {
        alert("Форма отправлена!");
      }
    }
  });

})();


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
  const flags = document.querySelectorAll(".progress__flag");
  const progressContainer = document.querySelector(".progress");
  const warningMessage = document.querySelector(".step-form__warning");

  function updateProgress() {
    const totalSlides = swiperStepForm.slides.length - 1;
    const currentStep = swiperStepForm.realIndex;

    console.log("Текущий шаг:", currentStep);

    // 🔹 Двигаем машину синхронно со сменой слайда
    const roadWidth = progressContainer.offsetWidth;
    const carWidth = car.offsetWidth;
    const carPosition = (currentStep / totalSlides) * (roadWidth - carWidth);

    car.style.transition = "transform 0.4s ease-in-out";
    roadProgress.style.transition = "width 0.4s ease-in-out";

    car.style.transform = `translateX(${carPosition}px)`;
    roadProgress.style.width = `${(currentStep / totalSlides) * 100}%`;

    // 🔹 Обновляем флажки
    flags.forEach((flag, index) => {
      flag.classList.toggle("progress__flag--active", index <= currentStep);
    });

    // 🔹 Блокируем кнопку "Назад" на первом шаге
    prevButton.disabled = currentStep === 0;

    // 🔹 Кнопка "Далее" и "Отправить"
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

  // 🔹 Валидация ТОЛЬКО в текущем слайде
  function validateStep(currentIndex) {
    let isValid = true;
    let errorMessage = "";

    // Сбрасываем ошибки
    warningMessage.textContent = "";
    document.querySelectorAll(".invalid").forEach((el) => el.classList.remove("invalid"));

    // Берем ТОЛЬКО текущий слайд
    const currentSlide = swiperStepForm.slides[currentIndex];
    const inputs = currentSlide.querySelectorAll("input:not(.novalidate), textarea:not(.novalidate)");

    inputs.forEach((input) => {
      if (input.type === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.value.trim())) {
          isValid = false;
          input.classList.add("invalid");
          errorMessage = "Invalid email format";
        }
      } else if (input.type === "tel") {
        const phoneRegex = /^\+?\d{10,15}$/;
        if (!phoneRegex.test(input.value.trim())) {
          isValid = false;
          input.classList.add("invalid");
          errorMessage = "Invalid phone number format";
        }
      } else if (input.value.trim() === "") {
        isValid = false;
        input.classList.add("invalid");
        errorMessage = "Please fill in all required fields";
      }
    });

    // Проверка ТОЛЬКО media-checkbox ВНУТРИ текущего слайда
    const mediaGroups = currentSlide.querySelectorAll(".media-checkbox");
    mediaGroups.forEach((group) => {
      const checkboxes = group.querySelectorAll("input[type='checkbox']");
      const isChecked = Array.from(checkboxes).some((checkbox) => checkbox.checked);

      if (!isChecked) {
        isValid = false;
        checkboxes.forEach((checkbox) => checkbox.classList.add("invalid"));
        errorMessage = "Please select at least one option";
      }
    });

    if (!isValid) {
      warningMessage.textContent = errorMessage;
    }

    return isValid;
  }

  // 🔹 Обработчик "Назад"
  prevButton.addEventListener("click", () => {
    if (!isTransitioning && swiperStepForm.realIndex > 0) {
      isTransitioning = true;
      console.log("⬅ Нажали кнопку Назад");
      swiperStepForm.slidePrev();
      setTimeout(() => {
        isTransitioning = false;
      }, 400);
    }
  });

  // 🔹 Обработчик "Далее"
  nextButton.addEventListener("click", (event) => {
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
            isTransitioning = false;
          }, 400);
        }
      } else {
        alert("Форма отправлена!");
      }
    }
  });
})();
*/
