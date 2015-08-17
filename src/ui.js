'use strict';
var styles = require('./styles');
var urls = require('./urls');

/* Version Selector UI
–––––––––––––––––––––––––––––––––––––––––––––––––– */
var body, head;

/**
 * Helper to generate text content of the list item
 */
function itemContent(item) {
  if (item.pr !== undefined) {
    return ['<strong>PR#', item.pr, '</strong>'].join(' ');
  } else if (item.branch !== undefined){
    return ['<strong>Branch:', item.branch, '</strong>'].join(' ');
  } else {
    throw new Error('Can\'t read version\'s identifier');
  }
}

/**
 * Helper to generate the <li> DOM node for a list item
 */
function generateListItem(item, clickFn) {
  var listItem = document.createElement('li');
  listItem.innerHTML = itemContent(item);
  listItem.onclick = function() {
    urls.initForPr(item.path);
    item.latestVersion = urls.latestVersion;
    // make the result available for testing
    return clickFn(item.latestVersion);
  };

  return listItem;
}

/**
 * Function to generate the list of all available versions
 */
function generateList(versions, clickFn) {
  var list = document.createElement('ul');
  list.id = 'js-ui-list';

  versions.forEach(function (item) {
    list.appendChild(generateListItem(item, clickFn));
  });

  body.appendChild(list);
}

/**
 * Generate the list header
 */
function generateHeader() {
  var header = document.createElement('header');
  header.id = 'js-ui-header';
  var h1 = document.createElement('h1');
  h1.innerHTML = 'Available Versions';

  var clearDataButton = document.createElement('button');
  clearDataButton.innerText = 'Clear local storage';
  clearDataButton.onclick = function () {
    localStorage.clear();
    this.setAttribute('disabled', '');
    this.innerText = '✓ Cleared';
  };

  header.appendChild(h1);
  header.appendChild(clearDataButton);
  body.appendChild(header);
}

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
}

/**
 * Initiate the UI
 */
function init(versions, clickFn) {
  head = document.head;
  body = document.body;

  attachStyles();
  generateHeader();
  generateList(versions, clickFn);
}

/**
 * Delete all the UI DOM nodes and cleanup
 */
function teardown() {
  var header = document.getElementById('js-ui-header');
  var list = document.getElementById('js-ui-list');
  var _styles = document.getElementById('js-ui-styles');

  header.parentNode.removeChild(header);
  list.parentNode.removeChild(list);
  _styles.parentNode.removeChild(_styles);
}

module.exports.init = init;
module.exports.teardown = teardown;
