'use strict';
/* Utils
–––––––––––––––––––––––––––––––––––––––––––––––––– */
var utils = {
  'hasFileExtension': hasFileExtension,
  'toSnakeCase': toSnakeCase,
  'makeIterator': makeIterator,
  'makeFilter': makeFilter
};

/**
 * Function for checking if the filename ends with the provided file extension.
 * This function is case insensitive.
 * @param filename : The filename to check
 * @param extension : The extension to check for.
 **/
function hasFileExtension(filename, extension) {
  // Ensure both values are present, otherwise it's not worth comparing.
  if (filename && extension) {
    // Normalize the extension to lowercase, and add the leading `.`
    var fullExtension = '.' + extension.toLowerCase();
    // The position in the filename where the extension begins.
    var index = filename.length - fullExtension.length;

    return filename.toLowerCase().lastIndexOf(fullExtension) === index;
  } else {
    return false;
  }
}

/**
 * Function for converting camel-case strings to snake-case
 * @param str : The string to convert
 **/
function toSnakeCase(str) {
  return str.replace(/([A-Z])/g, function (s) {
    return '-' + s.toLowerCase();
  });
}

function makeIterator(fn) {
  return function (list) {
    for (var index in list) {
      if (list.hasOwnProperty(index)) {
        fn(list[index]);
      }
    }
  };
}

function makeFilter(predicateFn) {
  if (!(predicateFn instanceof Function)) {
    throw new Error('predicateFn must be a function');
  }
  return function curriedFilter(sourceList) {
    var list = sourceList.slice();
    for (var index = list.length - 1; index > -1; index -= 1) {
      if (list.hasOwnProperty(index) && !predicateFn(list[index])) {
        list.splice(index, 1);
      }
    }
    return list;
  };
}

module.exports = utils;
