'use strict';

// Load plugins
const autoprefixer = require('gulp-autoprefixer');
const browsersync = require('browser-sync').create();
const cleanCSS = require('gulp-clean-css');
const del = require('del');
const gulp = require('gulp');
const header = require('gulp-header');
const merge = require('merge-stream');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify');

// Load package.json for banner
const pkg = require('./package.json');

// Set the banner content
const banner = [
	'/*!\n',
	' * Start Bootstrap - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
	' * Copyright 2013-' + new Date().getFullYear(),
	' <%= pkg.author %>\n',
	' * Licensed under <%= pkg.license %> (https://github.com/BlackrockDigital/<%= pkg.name %>/blob/master/LICENSE)\n',
	' */\n',
	'\n'
].join('');

function browserSync(done) {
	/**
	 * INITIATE BROWSERSYNC 
	 */
	browsersync.init({
		server: {
			baseDir: './'
		},
		port: 3000
	});
	done();
}

function browserSyncReload(done) {
	/**
	 * Set browserSync to Reload when change detected;   
	 */
	browsersync.reload();
	done();
}

function cleanDirectories() {
	/**
	 *  Delete Old Files in Directories; 
	 */
	return del([ './vendor/', './css/vendor/', './js/vendor/' ]);
}

function modules() {
	/**
	 *  Make a Copy of Dependencies (from 'node_modules') Into Respective Vendor Directories
	 */
	var bootstrapJS = gulp
		.src('./node_modules/bootstrap/dist/js/*')
		.pipe(gulp.dest('./static/js/vendor/bootstrap/js'));
	var fontAwesomeCSS = gulp
		.src('./node_modules/@fortawesome/fontawesome-free/css/**/*')
		.pipe(gulp.dest('./static/css/vendor/fontawesome-free/css'));
	var fontAwesomeWebfonts = gulp
		.src('./node_modules/@fortawesome/fontawesome-free/webfonts/**/*')
		.pipe(gulp.dest('./static/css/vendor/fontawesome-free/webfonts'));
	var jqueryEasing = gulp
		.src('./node_modules/jquery.easing/*.js')
		.pipe(gulp.dest('./static/js/vendor/jquery-easing'));
	var jquery = gulp
		.src([ './node_modules/jquery/dist/*', '!./node_modules/jquery/dist/core.js' ])
		.pipe(gulp.dest('./static/js/vendor/jquery'));
	return merge(bootstrapJS, fontAwesomeCSS, fontAwesomeWebfonts, jqueryEasing, jquery);
}

function cssTasks() {
	/**
	 * CSS conversion & cleanup  
	 */
	return gulp
		.src('./src/scss/**/*.scss')
		.pipe(plumber())
		.pipe(
			sass({
				outputStyle: 'expanded',
				includePaths: './node_modules'
			})
		)
		.on('error', sass.logError)
		.pipe(
			autoprefixer({
				browsers: [ 'last 2 versions' ],
				//       browsers: ['>1%'],

				//       "browserslist": "defaults",
				cascade: false
			})
		)
		.pipe(
			header(banner, {
				pkg: pkg
			})
		)
		.pipe(gulp.dest('./static/css'))
		.pipe(
			rename({
				suffix: '.min'
			})
		)
		.pipe(cleanCSS())
		.pipe(gulp.dest('./static/css'))
		.pipe(browsersync.stream());
}

// JS task
function jsTasks() {
		/**
	 *  
	 */
	return gulp
		.src([ './src/js/*.js', '!./src/js/*.min.js' ])
		.pipe(uglify())
		.pipe(
			header(banner, {
				pkg: pkg
			})
		)
		.pipe(
			rename({
				suffix: '.min'
			})
		)
		.pipe(gulp.dest('./static/js'))
		.pipe(browsersync.stream());
}

// Watch files
function watchFiles() {
		/**
	 *  
	 */
	gulp.watch('./src/scss/**/*', cssTasks);
	gulp.watch([ './src/js/**/*', '!./js/**/*.min.js' ], jsTasks);
	gulp.watch('./**/*.html', browserSyncReload);
}

// Define complex tasks
const vendor = gulp.series(cleanDirectories, modules);
const build = gulp.series(vendor, gulp.parallel(cssTasks, jsTasks));
const watch = gulp.series(build, gulp.parallel(watchFiles, browserSync));

// Export tasks
exports.css = cssTasks;
exports.js = jsTasks;
exports.clean = cleanDirectories;
exports.vendor = vendor;
exports.build = build;
exports.watch = watch;
exports.default = build;
