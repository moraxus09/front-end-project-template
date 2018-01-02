'use strict';

var gulp = require('gulp');
var plumber = require('gulp-plumber');
var less = require('gulp-less');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var mqpacker = require('css-mqpacker');
var cssnano = require('cssnano');
var imagemin = require('gulp-imagemin');
var svgSprite = require('gulp-svgstore');
var rename = require('gulp-rename');
var del = require('del');
var runSequence = require('run-sequence');
var fileInclude = require('gulp-file-include');
var uglify = require('gulp-uglify');

gulp.task('watch', function () {
	gulp.watch('src/less/**/*.less', ['style']);
	gulp.watch('src/*.html', function (event) {
		gulp.src(event.path).pipe(gulp.dest('build'));
	});
	gulp.watch('src/js/**/*.js', ['js']);
});

gulp.task('clean', function() {
	 return del('build');
});

gulp.task('copy', function() {
   return gulp.src([
    'src/img/**',
    'src/*.html'
  ], {
    base: 'src'
  })
    .pipe(gulp.dest('build'));
});

gulp.task('style', function() {
	return gulp.src('src/less/main.less')
		.pipe(plumber())
		.pipe(less())
		.pipe(postcss([autoprefixer(), mqpacker({sort: true})]))
		.pipe(rename('style.css'))
		.pipe(gulp.dest('build/css'))
		.pipe(postcss([cssnano()]))
		.pipe(rename('style.min.css'))
		.pipe(gulp.dest('build/css'))
});

gulp.task('images', function() {
   return gulp.src('build/img/**/*.{png,jpg,svg}')
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
			imagemin.svgo()
    ]))
    .pipe(gulp.dest('build/img'));
});

gulp.task('js', function() {
	return gulp.src('src/js/main.js')
		.pipe(fileInclude({
			prefix: '@@',
      basepath: '@file'
		}))
		.pipe(rename('scripts.js'))
		.pipe(gulp.dest('build/js'))
		.pipe(uglify())
		.pipe(rename('scripts.min.js'))
		.pipe(gulp.dest('build/js'))
})

gulp.task('build', function(done) {
  runSequence('clean','copy','style','js','images',done);
});

//* additional tasks*//

gulp.task('sprite', function () {
	return gulp.src('build/img/icons/*.svg')
		.pipe(svgSprite())
		.pipe(rename('icon-sprite.svg'))
		.pipe(gulp.dest('build/img'));
})

gulp.task('fileInclude', function() {
  return gulp.src('src/*.html')
    .pipe(fileInclude({
      indent: true,
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest('build'));
});
