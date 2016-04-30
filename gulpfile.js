var gulp = require('gulp'),
    eslint = require('gulp-eslint'),    
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    minifyCss = require('gulp-cssnano'),
    beautify = require('gulp-jsbeautifier');

var sourceDirectory = 'src';
var targetDirectory = 'dist';
var jsFiles = sourceDirectory + '/*.js';
var cssFiles = sourceDirectory + '/*.css';
var ignoreMinFiles = '!' + sourceDirectory + '/*.min.*';


gulp.task('eslint', function() {
  return gulp.src(jsFiles)
	    .pipe(eslint({
	    	fix: true
	    }))
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('beautify', function() {
	  gulp.src( [jsFiles, ignoreMinFiles] )
	    .pipe(beautify({indentSize: 4}))
	    .pipe(gulp.dest(sourceDirectory))
});

gulp.task('beautify-css', function() {
	  gulp.src( [cssFiles, ignoreMinFiles] )
	    .pipe(beautify())
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



gulp.task('default', ['eslint', 'minify', 'minify-css'] );
