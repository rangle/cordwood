var utils = require('./utils');

/* Styles
–––––––––––––––––––––––––––––––––––––––––––––––––– */
var styles = {};

styles.jsonCSS = {
  body: {
    color: '#607D8B',
    fontFamily: 'sans-serif',
    margin: 0
  },

  header: {
    backgroundColor: '#fff',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
    left: 0,
    padding: '0 1.5rem',
    position: 'fixed',
    margin: 0,
    top: 0,
    width: '100%'
  },

  h1: {
    height: '5rem',
    lineHeight: '5rem',
    margin: 0
  },

  ul: {
    listStyle: 'none',
    margin: '5.5rem 0 0 0',
    padding: 0
  },

  li: {
    backgroundColor: '#ECF8FE',
    border: '1px solid #a3ddfa',
    borderRadius: '4px',
    height: '5rem',
    lineHeight: '5rem',
    margin: '0.5rem',
    padding: '0 1rem'
  },

  'li:active,li:focus': {
    backgroundColor: '#ccecfc'
  }
};

// Converts JSON into CSS
// the type passed in is used as the selector
// eg: if type is a:hover, a:list
// the final result will be: a:hover, a:list { … }
styles.getByType = function(type) {
  if (type === 'get' || !(type in styles.jsonCSS)) {
    return;
  }

  var styleObj = styles.jsonCSS[type];
  var styleStr = type + ' { ';

  var keys = Object.keys(styleObj);

  for (var i = 0; i < keys.length; i++) {
    styleStr += utils.toSnakeCase(keys[i]) + ': ' +
                String(styleObj[keys[i]]) + '; ';
  };

  return styleStr + '}';
};

// Generates a CSS string that can be used in a
// stylesheet or a style tag
styles.get = function() {
  var keys = Object.keys(styles.jsonCSS);
  var cssString = '';

  for (var i = 0; i < keys.length; i++) {
    cssString += styles.getByType(keys[i]) + ' ';
  };

  return cssString;
};


module.exports = styles;
