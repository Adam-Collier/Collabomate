var gulp = require('gulp');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var nodemon = require('gulp-nodemon');
var sass = require('gulp-sass');


gulp.task('browser-sync', ['nodemon'], function () {
  browserSync({
    proxy: "localhost:3000",  // local node app address
    port: 8080,  // use *different* port than above
    notify: true,
    browser: "google chrome"
  });
});

gulp.task('nodemon', function (cb) {
  var called = false;
  return nodemon({
    script: './bin/www',
    ignore: [
      'gulpfile.js',
      'node_modules/'
    ]
  })
    .on('start', function () {
      if (!called) {
        called = true;
        cb();
      }
    })
    .on('restart', function () {
      setTimeout(function () {
        reload({ stream: false });
      }, 1000);
    });
});

gulp.task('sass', function () {
  gulp.src('./public/sass/main.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./public/css'));
});

gulp.task('default', ['browser-sync'], function () {
  gulp.watch('**/*.scss', ['sass']);
  gulp.watch(['**/*.{css,html,pug}'], reload);
});