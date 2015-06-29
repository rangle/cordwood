'use strict';
/* Constants
–––––––––––––––––––––––––––––––––––––––––––––––––– */
var constants = {
  JS_FILE_NAME: 'app.js',
  CSS_DIRECTORY: 'www/css/',
  CSS_FILE_NAME: 'app.css',
  DEFAULT_ASSET_DIRECTORIES: ['www/img', 'www/fonts', 'www/lib/ionic/'],
  DEFAULT_VERSIONS_TO_FETCH: [
    {'branch': 'master'}, // Names of branches we display
    {'prs': 25} // Number of PRs we display
  ],
  LATEST_VERSION_URL: 'version.json',
  MASTER_PATH: '/branch/master',
  ALL_VERSIONS_URL: '/versions.json',
  DEBUG: false
};


module.exports = constants;
