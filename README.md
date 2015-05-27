# Cordwood

- create cordova app
- run app and test
- add plugins `cordova-plugin-file-transfer`, `cordova-plugin-file`
- npm install gulp-car plugin
- add build task to gulp file as shown below

```
var gcar = require('gulp-car');


gulp.task('car', function() {
  var options = {
    'htmlPath': 'www/templates/**/*.html',
    'cssPath': 'www/css/**/*.css',
    'jsPath': 'www/js/**/*.js',
  };
  return gcar.build(options);
});
```

- bower install https://github.com/rangle/cordwood.git


- Remove all js and css file links which drive application (including vendor files such as ionic and angular)
```
<script src="lib/cordwood/src/cordwood.js"></script>
```

- Remove ng-app="starter" from body tag

- Add the below code to download files and load it from server. (You would have to run server locally and add url links) below.
```
<script type="text/javascript">

function successCallback() {
  console.log('all files read success');
  angular.element(document).ready(function() {
    angular.bootstrap(document, ['starter']);
  });
};

function errorCallback() {
  console.log('error reading files');
  window.location = 'error.html';
};

document.addEventListener('deviceready', function(){
  var options = {
    baseUrl: 'http://10.0.1.79:8080',
    currentVersion: '1.0.0',
    successCallback: successCallback,
    errorCallback: errorCallback,
    multipleVersions: true
  };

  Cordwood(options);
}, false);

</script>
```

- Run the app it should run fine.

- If everythings ok try changing the application and change version number and deploy it on server and check app gets updated without reload


## Development

1. `gulp scripts` build the browserify bundle
2. `gulp dev` watch and re-build the browserify bundle
3. `gulp test` run tests
4. `gulp tdd` tests with watch

