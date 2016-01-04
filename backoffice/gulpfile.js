var gulp = require('gulp');
var del = require('del');
var shell = require('gulp-shell');

var config = require('./gulp-config');

var buildDir = config.buildDir;

gulp.task('clean', function(cb) {
  del([buildDir], {
    force: true,
  }, cb);
});

gulp.task('scripts', ['clean'], function(cb) {
  gulp.src(['main/index.js'])
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
  ], ['scripts']);
});

gulp.task('default', ['scripts']);
