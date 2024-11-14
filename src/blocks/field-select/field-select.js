document.addEventListener('DOMContentLoaded', function () {
  if (typeof Object.assign != 'function') {
    Object.assign = function(target) {
      'use strict';
      if (target == null) {
        throw new TypeError('Cannot convert undefined or null to object');
      }

      target = Object(target);
      for (var index = 1; index < arguments.length; index++) {
        var source = arguments[index];
        if (source != null) {
          for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
              target[key] = source[key];
            }
          }
        }
      }
      return target;
    };
  }

  // Включим отдельно
  // const choices = new Choices('#some-if', {/* options */});

  // Или тупо найдём все селекты и включим на них Choices
  const selects = document.querySelectorAll('.field-select__select');
  selects.forEach(function(item){
    new Choices(item, {
      searchEnabled: true,
      searchPlaceholderValue: 'Search bar',
      //placeholderValue: 'Select',
      itemSelectText: 'Press to select',
    });
  });
});
