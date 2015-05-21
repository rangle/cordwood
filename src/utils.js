
/* Utils
–––––––––––––––––––––––––––––––––––––––––––––––––– */

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
};

/**
 * Function for converting camel-case strings to snake-case
 * @param str : The string to convert
 **/
var toSnakeCase = function(str) {
  return str.replace(/([A-Z])/g, function(s) {
    return '-' + s.toLowerCase();
  });
};


module.exports.hasFileExtension = hasFileExtension;
module.exports.toSnakeCase = toSnakeCase;
