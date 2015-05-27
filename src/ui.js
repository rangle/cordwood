var styles = require('./styles');
var version = require('./version');
var urls = require('./urls');

/* Version Selector UI
-------------------------------------------------- */
var body, head;

/**
 * Helper to generate text content of the list item
 */
function itemContent(item) {
  return '<strong>PR# ' + item.number + ':</strong> ' + item.name;
};

/**
 * Helper to generate the <li> DOM node for a list item
 */
function generateListItem(item, clickFn) {
  var listItem = document.createElement('li');
  listItem.innerHTML = itemContent(item);
  listItem.onclick = (function() {
    return function() {
      urls.initForPr(item.path);
      // make the result available for testing
      return clickFn(urls.latestVersion);
    }
  })();

  return listItem;
};

/**
 * Function to generate the list of all available versions
 */
function generateList(versions, clickFn) {
  var list = document.createElement('ul');
  list.id = 'js-ui-list';

  versions.forEach(function(item, index) {
    list.appendChild(generateListItem(item, clickFn));
  });

  body.appendChild(list);
};

/**
 * Generate the list header
 */
function generateHeader() {
  var header = document.createElement('header');
  header.id = 'js-ui-header';
  var h1 = document.createElement('h1');
  h1.innerHTML = 'Available Versions';

  header.appendChild(h1);
  body.appendChild(header);
};

/**
 * Insert the UI CSS to into a style tag and
 * load it into the page
 */
function attachStyles() {
  var style = document.createElement('style');

  style.type = 'text/css';
  style.id = 'js-ui-styles';
  style.appendChild(document.createTextNode(styles.get()));

  head.appendChild(style);
};

/**
 * Initiate the UI
 */
function init(versions, clickFn) {
  head = document.head;
  body = document.body;

  attachStyles();
  generateHeader();
  generateList(versions, clickFn);
};

/**
 * Delete all the UI DOM nodes and cleanup
 */
function teardown() {
  var header = document.getElementById('js-ui-header');
  var list = document.getElementById('js-ui-list');
  var styles = document.getElementById('js-ui-styles');

  header.parentNode.removeChild(header);
  list.parentNode.removeChild(list);
  styles.parentNode.removeChild(styles);
};


module.exports.init = init;
module.exports.teardown = teardown;
