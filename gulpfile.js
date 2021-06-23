const gulp = require('gulp');
const less = require('gulp-less');

/* ----------------------------------------- */
/*  Compile LESS
/* ----------------------------------------- */

const SIMPLE_LESS = ["styles/*.less"];
function compileLESS() {
  return gulp.src("styles/cof.less")
      .pipe(less())
      .pipe(gulp.dest("./css"))
}
const css = gulp.series(compileLESS);

/* ----------------------------------------- */
/*  Watch Updates
/* ----------------------------------------- */

function watchUpdates() {
  gulp.watch(SIMPLE_LESS, css);
}

/* ----------------------------------------- */
/*  Export Tasks
/* ----------------------------------------- */

exports.default = gulp.series(
    gulp.parallel(css),
    watchUpdates
);
exports.css = css;


// const gulp = require('gulp');
// const prefix = require('gulp-autoprefixer');
// const sass = require('gulp-sass');
//
// /* ----------------------------------------- */
// /*  Compile Sass
// /* ----------------------------------------- */
//
// // Small error handler helper function.
// function handleError(err) {
//   console.log(err.toString());
//   this.emit('end');
// }
//
// const SYSTEM_SCSS = ["scss/**/*.scss"];
// function compileScss() {
//   // Configure options for sass output. For example, 'expanded' or 'nested'
//   let options = {
//     outputStyle: 'expanded'
//   };
//   return gulp.src(SYSTEM_SCSS)
//     .pipe(
//       sass(options)
//         .on('error', handleError)
//     )
//     .pipe(prefix({
//       cascade: false
//     }))
//     .pipe(gulp.dest("./css"))
// }
// const css = gulp.series(compileScss);
//
// /* ----------------------------------------- */
// /*  Watch Updates
// /* ----------------------------------------- */
//
// function watchUpdates() {
//   gulp.watch(SYSTEM_SCSS, css);
// }
//
// /* ----------------------------------------- */
// /*  Export Tasks
// /* ----------------------------------------- */
//
// exports.default = gulp.series(
//   compileScss,
//   watchUpdates
// );
// exports.css = css;
