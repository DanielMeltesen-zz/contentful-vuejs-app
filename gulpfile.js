'use strict';

var gulp = require('gulp');
var requireDir = require('require-dir');
var browserSync = require('browser-sync');
var runSequence = require('run-sequence');

// Fetch all gulp tasks
requireDir('./gulp');

// Paths to watch
var WATCH_PATHS = {
  JAVASCRIPTS: ['js/**/*.js'],
  HTML: ['index.html']
};


// Build tasks
// ---------------------------------------

gulp.task('build', ['scripts:production', 'html:production']);
gulp.task('build:debug', ['scripts:debug', 'html']);

// Dynamic tasks
// ---------------------------------------


// Start BrowerSync
gulp.task('serve', function(){
  browserSync.init({
    server: {
      baseDir: 'build',
      index: 'index.html'
    }
  });
});

// Watch files for changes, reload browser on change
gulp.task('watch', function() {
  gulp.watch(WATCH_PATHS.JAVASCRIPTS, ['scripts:debug', browserSync.reload]);
  gulp.watch(WATCH_PATHS.HTML, ['html', browserSync.reload]);
});


// Default task
// ---------------------------------------

// Runs all of the above tasks and then waits for files to change
gulp.task('default', function() {
  runSequence(
    ['scripts:debug', 'html'],
    ['serve', 'watch']
  );
});
