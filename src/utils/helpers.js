"use strict";

/**
 * Checks if a given value is a number.
 * @param {*} value - The value to check.
 * @returns {boolean} - Returns true if the value is a number, false otherwise.
 */
function isNumber(value) {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Formats a number to a fixed decimal point.
 * @param {number} num - The number to format.
 * @param {number} decimals - The number of decimal places.
 * @returns {string} - The formatted number as a string.
 */
function formatNumber(num, decimals = 2) {
  if (!isNumber(num) || !isNumber(decimals)) {
    throw new Error('Invalid input: both arguments must be numbers.');
  }
  return num.toFixed(decimals);
}

/**
 * Generates a random integer between a minimum and maximum value.
 * @param {number} min - The minimum value (inclusive).
 * @param {number} max - The maximum value (inclusive).
 * @returns {number} - A random integer between min and max.
 */
function getRandomInt(min, max) {
  if (!isNumber(min) || !isNumber(max)) {
    throw new Error('Invalid input: both arguments must be numbers.');
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Deeply merges two objects.
 * @param {object} target - The target object to merge properties into.
 * @param {object} source - The source object from which properties are merged.
 * @returns {object} - The merged object.
 */
function deepMerge(target, source) {
  if (typeof target !== 'object' || target === null) {
    throw new Error('Target must be an object.');
  }
  if (typeof source !== 'object' || source === null) {
    throw new Error('Source must be an object.');
  }

  Object.keys(source).forEach(key => {
    if (source[key] instanceof Object && key in target) {
      Object.assign(source[key], deepMerge(target[key], source[key]));
    }
  });

  Object.assign(target || {}, source);
  return target;
}

/**
 * Debounces a function, ensuring it is not called too frequently.
 * @param {Function} func - The function to debounce.
 * @param {number} wait - The number of milliseconds to wait before invoking the function.
 * @returns {Function} - A debounced version of the function.
 */
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * Throttles a function, ensuring it is called at most once in a given period.
 * @param {Function} func - The function to throttle.
 * @param {number} limit - The number of milliseconds to wait between function calls.
 * @returns {Function} - A throttled version of the function.
 */
function throttle(func, limit) {
  let lastFunc;
  let lastRan;
  return function (...args) {
    const context = this;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

module.exports = {
  isNumber,
  formatNumber,
  getRandomInt,
  deepMerge,
  debounce,
  throttle
};
