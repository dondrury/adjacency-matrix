
const gulp = require('gulp')
const sass = require('gulp-sass')(require('sass'))
const sourcemaps = require('gulp-sourcemaps')
const source = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')
const browserify = require('browserify')
const babelify = require('babelify')
// const uglify = require('gulp-uglify')
const chalk = require('chalk')
const eslint = require('gulp-eslint')
const spawn = require('child_process').spawn
const fs = require('fs')
var node
function defaultTask (cb) {
  console.log(chalk.green('Welcome to the GULP'))
  watch(cb)
  bundleForDevBrowser() // try to compile what we have for dev use in this affiliate
  restartServer(cb)
}

function restartServer (cb) { // start or restart server
  if (node) node.kill()
  node = spawn('node', ['app.js'], { stdio: 'inherit' })
  node.on('close', function (code) {
    if (code === 8) {
      gulp.log('Error detected, waiting for changes...')
    }
  })
  cb()
}

function watch () {
  gulp.watch(['.env'], gulp.series(restartServer))
  gulp.watch(['scss/*.scss', 'scss/**/*.scss'], gulp.series(buildBelowTheFoldSass))
  gulp.watch(['js/*.js', 'js/**/*.js', 'js/modules/*.js'], gulp.series(lint, bundleForDevBrowser))
  // gulp.watch(['js/adminBundle.js', 'js/modules/*.js'], bundleForAdmin)
  gulp.watch(['*.js', 'models/*.js', 'controllers/*.js', 'config/*.js'], gulp.series(lint, restartServer))
}

function lint () {
  return gulp.src(['*.js', 'models/*.js', 'controllers/*.js', 'config/*.js', 'js/*.js', 'js/**/*.js'])
    // eslint() attaches the lint output to the "eslint" property
    // of the file object so it can be used by other modules.
    .pipe(eslint())
  // eslint.format() outputs the lint results to the console.
  // Alternatively use eslint.formatEach() (see Docs).
    .pipe(eslint.format())
    // // To have the process exit with an error code (1) on
    // // lint error, return the stream and pipe to failAfterError last.
    // .pipe(eslint.failAfterError())
}

// function bundleForProductionBrowser (callSign) {
//   let actualCallsign
//   if (typeof callSign === 'string') {
//     actualCallsign = callSign
//   } else {
//     actualCallsign = process.env.CALLSIGN
//   }
//   console.log(chalk.green('bundling production js for ' + actualCallsign))
//   return browserify({
//     entries: [`./js/bundle-${actualCallsign}.js`]
//   })
//     .transform(babelify.configure({
//       presets: ['@babel/env'],
//       ignore: [/node_modules/]
//     }))
//     .bundle()
//     .pipe(source(`bundle-${actualCallsign}-production.js`))
//     .pipe(buffer())
//     // .pipe(sourcemaps.init())
//     .pipe(uglify())
//     .pipe(gulp.dest('./public/js'))
// }

function bundleForDevBrowser (callSign) {
  // let actualCallsign
  // if (typeof callSign === 'string') {
  //   actualCallsign = callSign
  // } else {
  //   actualCallsign = process.env.CALLSIGN
  // }
  console.log(chalk.green('bundling dev js from ' + './js/main-bundle.js'))
  return browserify({
    entries: ['./js/main-bundle.js']
  })
    .transform(babelify.configure({
      presets: ['@babel/env'],
      ignore: [/node_modules/]
    }))
    .bundle()
    .pipe(source('main-bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init())
    // .pipe(uglify())
    .pipe(gulp.dest('./public/js'))
}
//
// function bundleForAdmin () {
//   return browserify({
//     entries: ['./js/adminBundle.js']
//   })
//     .transform(babelify.configure({
//       presets: ['@babel/env'],
//       ignore: [/node_modules/]
//     }))
//     .bundle()
//     .pipe(source('adminBundle.js'))
//     .pipe(buffer())
//     .pipe(sourcemaps.init())
//     // .pipe(uglify())
//     .pipe(gulp.dest('./public/js'))
// }

// function buildAboveTheFoldSass (callSign) {
//   let actualCallsign
//   if (typeof callSign === 'string') {
//     actualCallsign = callSign
//   } else {
//     actualCallsign = process.env.CALLSIGN
//   }
//   console.log(chalk.green('compiling above the fold css ' + `./scss/above-the-fold-bundle-${actualCallsign}.scss`))
//   return gulp.src([`scss/above-the-fold-bundle-${actualCallsign}.scss`])
//     .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
//     .pipe(gulp.dest('public/css'))
// }

function buildBelowTheFoldSass (callSign) {
  console.log(chalk.green('compiling below the fold css ' + './scss/main-bundle.scss'))
  return gulp.src(['scss/main-bundle.scss'])
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(gulp.dest('public/css'))
}

// function buildSassAdmin () {
//   return gulp.src(['scss/adminBundle.scss'])
//     .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
//     .pipe(gulp.dest('public/css'))
// }

function bundleAllProductionJs (cb) {
  fs.writeFile('lastBuildDate.txt', Date.now().toString(), function (err) {
    if (err) console.log(err)
  })
  const callSigns = process.env.ALLCALLSIGNS.split(',')
  const buildFunctionsArray = callSigns.map((callSign) => function () {
    return bundleForProductionBrowser(callSign)
  })
  return gulp.series.apply(null, buildFunctionsArray)(cb)
}

// function bundleAllSass (cb) {
//   fs.writeFile('lastBuildDate.txt', Date.now().toString(), function (err) {
//     if (err) console.log(err)
//   })
//   const callSigns = process.env.ALLCALLSIGNS.split(',')
//   const aboveTheFoldArray = callSigns.map((callSign) => function () {
//     return buildAboveTheFoldSass(callSign)
//   })
//
//   const belowTheFoldArray = callSigns.map((callSign) => function () {
//     return buildBelowTheFoldSass(callSign)
//   })
//   return gulp.series.apply(null, aboveTheFoldArray.concat(belowTheFoldArray))(cb)
// }

// function bundleAllDevJs (cb) {
//   const callSigns = process.env.ALLCALLSIGNS.split(',')
//   const buildFunctionsArray = callSigns.map((callSign) => function () {
//     return bundleForDevBrowser(callSign)
//   })
//   return gulp.series.apply(null, buildFunctionsArray)(cb)
// }

exports.default = defaultTask
// exports.buildAll = gulp.parallel(
//   gulp.series(bundleAllSass, bundleForAdmin, buildSassAdmin, bundleAllProductionJs, bundleAllDevJs)
// )
