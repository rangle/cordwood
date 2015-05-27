var gulp = require('gulp');
var uglify = require('gulp-uglify');
var watch = require('gulp-watch');
var rename = require('gulp-rename');
var browserify = require('gulp-browserify');
var karma = require('karma').server;
var mocha = require('mocha');

// Build browserify package
gulp.task('scripts', function() {
  return gulp.src('./src/cordwood.js')
          .pipe(browserify({
            insertGlobals: false,
            debug: false
          }))
          .on('error', function(err) {
            console.log(err.message);
          })
          .pipe(rename('cordwood.js'))
          .pipe(gulp.dest('./dist'))
          .pipe(gulp.dest('./example/www'))
          .pipe(uglify())
          .pipe(rename('cordwood.min.js'))
          .pipe(gulp.dest('./dist'))
          .pipe(gulp.dest('./example/www'));
});


// Testing
gulp.task('test', function (done) {
  karma.start({
    configFile: __dirname + '/tests/karma.conf.js',
    singleRun: true
  }, done);
});


gulp.task('tdd', function (done) {
  karma.start({
    configFile: __dirname + '/tests/karma.conf.js'
  }, done);
});


gulp.task('dev', ['scripts'], function() {
  watch('./src/**/*.js', function() {
    gulp.start('scripts');
  });
});
