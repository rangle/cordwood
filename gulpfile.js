var gulp = require('gulp');
var uglify = require('gulp-uglify');
var watch = require('gulp-watch');
var rename = require('gulp-rename');
var browserify = require('gulp-browserify');
var karma = require('karma').server;
var mocha = require('mocha');
var eslint = require('gulp-eslint');
var beautify = require('gulp-jsbeautifier');

var srcFiles = ['./src/*.js'];
var testFiles = ['./tests/**/*.js'];

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

gulp.task('lint', function() {
  return gulp.src(srcFiles)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError())});


gulp.task('beautify', function() {
  return gulp.src(srcFiles, { base: '.' })
    .pipe(gulp.src(testFiles, { base: '.' }))
    .pipe(beautify({ config: '.jsbeautifyrc' }))
    .pipe(gulp.dest('.'));
});

// Testing
gulp.task('test', [], function (done) {
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
