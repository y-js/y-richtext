gulp = require 'gulp'
coffee = require 'gulp-coffee'
gutil = require 'gulp-util'
concat = require 'gulp-concat'
uglify = require 'gulp-uglify'
sourcemaps = require 'gulp-sourcemaps'
browserify = require 'gulp-browserify'
rename = require 'gulp-rename'
rimraf = require 'gulp-rimraf'
gulpif = require 'gulp-if'
ignore = require 'gulp-ignore'
git = require 'gulp-git'
debug = require 'gulp-debug'
coffeelint = require 'gulp-coffeelint'
mocha = require 'gulp-mocha'
run = require 'gulp-run'
ljs = require 'gulp-ljs'
plumber = require 'gulp-plumber'
mochaPhantomJS = require 'gulp-mocha-phantomjs'
cache = require 'gulp-cached'
coffeeify = require 'gulp-coffeeify'
exit = require 'gulp-exit'

gulp.task 'default', ['build_browser']

files =
  lib : ['./lib/**/*.coffee']
  browser : ['./lib/y-rte.coffee']
  test : ['./test/**/*test.coffee']
  gulp : ['./gulpfile.coffee']
  examples : ['./examples/**/*.js']
  other: ['./lib/**/*', './test/*']

files.all = []
for name,file_list of files
  if name isnt 'build'
    files.all = files.all.concat file_list

gulp.task 'deploy_nodejs', ->
  gulp.src files.lib
    .pipe sourcemaps.init()
    .pipe coffee()
    .pipe sourcemaps.write './'
    .pipe gulp.dest 'build/node/'
    .pipe gulpif '!**/', git.add({args : "-A"})

gulp.task 'deploy', ['mocha', 'build_browser', 'deploy_nodejs', 'lint', 'phantom_test', 'codo']

gulp.task 'build_browser', ->
  gulp.src files.browser, { read: false }
    .pipe plumber()
    .pipe browserify
      transform: ['coffeeify']
      extensions: ['.coffee']
      debug : true
    .pipe rename
      extname: ".js"
    .pipe gulp.dest './build/browser/'
    .pipe uglify()
    .pipe gulp.dest '.'

  gulp.src files.test, {read: false}
    .pipe plumber()
    .pipe browserify
      transform: ['coffeeify']
      extensions: ['.coffee']
      debug: true
    .pipe rename
      extname: ".js"
    .pipe gulp.dest './build/test/'

gulp.task 'build_node', ->
  gulp.src files.lib
    .pipe plumber()
    .pipe coffee({bare:true, sourceMap: true})
    .pipe gulp.dest './build/node'

gulp.task 'build', ['build_node', 'build_browser'], ->

gulp.task 'watch', ['build'], ->
  gulp.watch files.all, ['build']

gulp.task 'coffee',->
  gulp.src files.lib
    # .pipe sourcemaps.init()
    .pipe coffee {bare: true}
      .on('error', gutil.log)
    # .pipe concat()
    # .pipe sourcemaps.write()
    .pipe gulp.dest('./lib/')


gulp.task 'lint', ->
  gulp.src files.all
    .pipe ignore.include '**/*.coffee'
    .pipe coffeelint {
      "max_line_length":
        "level": "ignore"
      }
    .pipe coffeelint.reporter()

gulp.task 'phantom_watch', ['phantom_test'], ->
  gulp.watch files.all, ['phantom_test']

gulp.task 'literate', ->
  gulp.src files.examples
    .pipe ljs { code : trguue }
    .pipe rename
      basename : "README"
      extname : ".md"
    .pipe gulp.dest 'examples/'
    .pipe gulpif '!**/', git.add({args : "-A"})

gulp.task 'codo', [], ()->
  command = 'codo -o "./doc" --name "yjs" --private true --title "yjs rte type API" ./lib'
  run(command).exec()

gulp.task 'phantom_test', ['build_browser'], ()->
  gulp.src 'build/test/index.html'
    .pipe mochaPhantomJS()

gulp.task 'clean', ->
  gulp.src ['./build/{browser,test,node}/**/*.{js,map}','./doc/','./lib/*.js'], { read: false }
    .pipe rimraf()

gulp.task 'mocha', ['coffee'], ->
  gulp.src files.test, ['coffee'], { read: true }
    .pipe mocha {reporter : 'spec'}
    # .pipe exit()

gulp.task 'test', ['mocha'], ->
  gulp.watch files.all, ['mocha']


gulp.task 'default', ['clean','build'], ->
