var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    minifyCss = require('gulp-minify-css');

var sourceDirectory = 'src';
var targetDirectory = 'src';
var jsFiles = sourceDirectory + '/*.js';
var cssFiles = sourceDirectory + '/*.css';
var ignoreMinFiles = '!' + sourceDirectory + '/*.min.*';


gulp.task('lint', function() {
  return gulp.src([jsFiles, ignoreMinFiles ])
    .pipe(jshint({"expr": "true"}))
    .pipe(jshint.reporter('default'));
});


gulp.task('minify', function() {
	  gulp.src( [jsFiles, ignoreMinFiles] )
	    .pipe(uglify())
	    .pipe(rename({suffix: '.min'}))
	    .pipe(gulp.dest(targetDirectory))
});


gulp.task('minify-css', function() {
  return gulp.src([cssFiles, ignoreMinFiles])
    .pipe(minifyCss({compatibility: 'ie8'}))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(targetDirectory));
});


gulp.task('default', function() {
    gulp.start('lint', 'minify', "minify-css");
});