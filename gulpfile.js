const gulp = require('gulp');
const shell = require("gulp-shell");
const browserSync = require("browser-sync");
const gutil = require("gulp-util");
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");

const sassPaths = [
    'node_modules/foundation-sites/scss',
    'node_modules/motion-ui/src',
    'node-modules/font-awesome/scss'
];

const jsPaths = [
    'node_modules/jquery/dist/jquery.js',
    'node_modules/what-input/dist/what-input.js',
    'node_modules/foundation-sites/dist/js/foundation.js',
    // Custom Scripts
    './_assets/js/**/*.js'
];

const browsers = ['last 2 versions', 'ie >= 9', 'ios >= 7'];

// function copyAssets() {
//     return gulp.src('./node_modules/font-awesome/scss/*')
//         .pipe(gulp.dest('./assets/scss/vendor/font-awesome/'))
//         gulp.src('./node_modules/font-awesome/fonts/*')
//         .pipe(gulp.dest('./_site/assets/fonts/'))
// }

function processJs() {
    return gulp.src(jsPaths)
        .pipe(concat(('app.js')))
        .pipe(uglify())
        .pipe(gulp.dest('./_site/assets/js/'))
        // Compile files into both _site/assets (for local testing) and assets (for future jekyll builds)
        .pipe(gulp.dest('./assets/js/'))
        .pipe(browserSync.stream());
}

function processCss() {
    return gulp.src('./_assets/scss/app.scss')
    .pipe(sass({
        includePaths: sassPaths,
        outputStyle: 'expanded'
    })).on('error', sass.logError)
    .pipe(postcss([
        autoprefixer({browsers: browsers}),
        cssnano()]))
    .pipe(gulp.dest('./_site/assets/css/'))
    // Compile files into both _site/assets (for local testing) and assets (for future jekyll builds)
    .pipe(gulp.dest('./assets/css/'))
    .pipe(browserSync.stream());
}

function build() {
    return gulp.src('index.html', {read: false})
    .pipe(shell([
        'bundle exec jekyll build --drafts --config _config.yml,_config.localhost.yml'
    ])).on('error', gutil.log);
}

function serve() {
    return browserSync.init({
        port: 4000,
        server: {
            baseDir: "./_site"
        }
    });
}

// BrowserSync Reload
function browserSyncReload(done) {
    browserSync.reload();
    done();
}

// Watch
function watch() {
    gulp.watch('./_assets/scss/**/*.scss', processCss);
    gulp.watch("./_assets/js/**/*.js", processJs);
    gulp.watch(['**/*.+(html|md|markdown|MD)', '!_site/**/*.*'], gulp.series(build, browserSyncReload));
}

// gulp.task('copyAssets', gulp.series(copyAssets));

// Build
//gulp.task('build', gulp.series(build, browserSyncReload));

// Build and serve
gulp.task('buildAndServe', gulp.series(processJs, processCss, build, gulp.parallel(serve, watch)));
