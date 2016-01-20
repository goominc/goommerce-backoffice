var gulp = require('gulp');
var del = require('del');
var shell = require('gulp-shell');
var replace = require('gulp-replace');
var rename = require('gulp-rename');
var argv = require('yargs').argv;

var config = require('./gulp-config');

var buildDir = config.buildDir;

gulp.task('clean', function(cb) {
  del([buildDir], {
    force: true,
  }, cb);
});

gulp.task('dist', ['clean'], function(cb) {
  var indexjs = './main/index.js';
  var apiUrl = '';
  if (argv.dev) {
    apiUrl = 'http://localhost:8080';
  }
  gulp.src('./main/index-template.js')
    .pipe(replace('@apiUrl', apiUrl))
    .pipe(rename('index.js'))
    .pipe(gulp.dest('./main'));

  gulp.src([indexjs, 'main/bo.css'])
    .pipe(shell([
      'node_modules/duo/bin/duo <%= file.path %> ' +
      '--use duo-babel --output <%= buildDir %>',
    ], {
      templateData: {
        buildDir: buildDir,
      },
    }));
});

gulp.task('watch', function() {
  gulp.watch([
    '**/*.js',
    '**/*.html',
  ], ['dist']);
});

gulp.task('default', ['dist']);
