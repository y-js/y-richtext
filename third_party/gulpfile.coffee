gulp = require 'gulp'
browserify = require 'gulp-browserify'
uglify = require 'gulp-uglify'
coffee = require 'gulp-coffee'
plumber = require 'gulp-plumber'
coffeeify = require 'gulp-coffeeify'
rename = require 'gulp-rename'

files = ['export.coffee']

gulp.task 'default', ['build']
gulp.task 'build', () ->
  gulp.src files, read: false
    .pipe plumber()
    .pipe browserify
      transform: ['coffeeify']
      extensions: ['.coffee']
      debug:true
    .pipe rename
      extname: '.js'
    .pipe gulp.dest('./build/dev')
    .pipe uglify()
    .pipe gulp.dest('./build/browser')
