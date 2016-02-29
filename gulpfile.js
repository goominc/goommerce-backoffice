// Copyright (C) 2016 Goom Inc. All rights reserved.

const browserSync = require('browser-sync').create();
const del = require('del');
const gulp = require('gulp');
const shell = require('gulp-shell');
const replace = require('gulp-replace');
const rename = require('gulp-rename');
const yargs = require('yargs');

const config = require('./config');

const argv = yargs.default('watch', true).argv;
const duoFiles = ['backoffice/main/index.js', 'backoffice/main/bo.css'];

gulp.task('clean', function() {
  return del([config.build.output]);
});

gulp.task('index-template', function() {
  return gulp.src('backoffice/main/index-template.js')
    .pipe(replace('@apiUrl', config.api.url))
    .pipe(rename('index.js'))
    .pipe(gulp.dest('backoffice/main'));
});

gulp.task('duo', ['index-template'], function() {
  return gulp.src(duoFiles)
    .pipe(shell([
      'node_modules/duo/bin/duo <%= file.path %> --use duo-babel',
    ]));
});

gulp.task('dist', ['clean', 'duo'], function() {
  return gulp.src(duoFiles.map((file) => `build/${file}`), { base: 'build/backoffice' })
    .pipe(gulp.dest(config.build.output));
});

gulp.task('reload', ['dist'], function() {
  return browserSync.reload();
});

gulp.task('serve', ['dist'], function() {
  const opts = { server: { baseDir: 'dist', routes: { '/bower_components': 'bower_components' } } };
  if (argv.watch) {
    opts.files =[{ match: ['dist/templates/**/*', 'dist/vendor/**/*'] }];
  }
  browserSync.init(opts);

  if (argv.watch) {
    gulp.watch(['backoffice/**/*.js*', 'backoffice/**/*.css', '!backoffice/main/index.js'], ['reload']);
  }
});

gulp.task('default', ['serve']);
