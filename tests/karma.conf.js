'use strict';
module.exports = function (config) {
  config.set({
    basePath: '../',
    frameworks: ['browserify', 'mocha', 'chai', 'sinon'],
    files: [
      'tests/mocks/*.mock.js',
      'tests/**/*.spec.js'
    ],
    preprocessors: {
      'tests/**/*.spec.js': ['browserify', 'wrap'],
      'tests/mocks/*.mock.js': ['wrap']
    },
    wrapPreprocessor: {
      template: '(function () { <%= contents %> })()'
    },
    browserify: {
      debug: true,
      transform: ['browserify-istanbul']
    },
    reporters: ['coverage', 'mocha'],
    coverageReporter: {
      type: 'lcov',
      reporters: [{
        type: 'text-summary'
      }, {
        type: 'html'
      }],
      dir: './coverage/'
    },
    colors: true,
    logLevel: config.LOG_ERROR,
    browsers: ['PhantomJS']
  });
};
