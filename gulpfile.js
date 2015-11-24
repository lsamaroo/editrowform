var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    minifyCss = require('gulp-minify-css')
    beautify = require('gulp-jsbeautifier');

var sourceDirectory = 'src';
var targetDirectory = 'dist';
var jsFiles = sourceDirectory + '/*.js';
var cssFiles = sourceDirectory + '/*.css';
var ignoreMinFiles = '!' + sourceDirectory + '/*.min.*';


gulp.task('lint', function() {
	return gulp.src([jsFiles, ignoreMinFiles ])
    	.pipe(jshint({"expr": "true"}))
    	.pipe(jshint.reporter('default'));
});


gulp.task('beautify', function() {
	  gulp.src( [jsFiles, ignoreMinFiles] )
	    .pipe(beautify({indentSize: 4}))
	    .pipe(gulp.dest(sourceDirectory))
});

gulp.task('beautify-css', function() {
	  gulp.src( [cssFiles, ignoreMinFiles] )
	    .pipe(beautify({indentSize: 4}))
	    .pipe(gulp.dest(sourceDirectory))
});

gulp.task('minify', ['beautify'], function() {
	gulp.src( [jsFiles, ignoreMinFiles] )
		// this line copies source to distribution before minify is performed
	    .pipe(gulp.dest(targetDirectory))		
		.pipe(uglify())
	    .pipe(rename({suffix: '.min'}))
	    .pipe(gulp.dest(targetDirectory));
});


gulp.task('minify-css', ['beautify-css'], function() {
	gulp.src([cssFiles, ignoreMinFiles])
		.pipe(gulp.dest(targetDirectory))
    	.pipe(minifyCss({compatibility: 'ie8'}))
    	.pipe(rename({suffix: '.min'}))
    	.pipe(gulp.dest(targetDirectory));
});



gulp.task('default', ['lint', 'minify', 'minify-css'] );
