'use strict';

var gulp = require('gulp');
var chalk = require('chalk');
var $ = require('gulp-load-plugins')();

var PATHS = [
  'index.html'
];

var DEST = 'build';

// Copy all vendor scripts to assets folder
gulp.task('html', function() {
  return gulp.src(PATHS)
    .pipe(gulp.dest(DEST));
});
