'use strict';

var gulp = require('gulp');
var chalk = require('chalk');
var $ = require('gulp-load-plugins')();

var PATHS = [
  'index.html'
];

var DEST = 'build';

// Copy html to build folder folder
gulp.task('html', function() {
  return gulp.src(PATHS)
    .pipe(gulp.dest(DEST));
});

gulp.task('html:production', function() {
  return gulp.src(PATHS)
    .pipe($.htmlReplace({js: 'assets/js/app.min.js'}))
    .pipe(gulp.dest(DEST));
});
