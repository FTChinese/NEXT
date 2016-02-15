/* jshint node:true */
'use strict';
// generated on 2015-09-01 using generator-gulp-webapp 0.2.0
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();


function getBodyFromUrl (urlSource, fileName) {
  var http = require('http');
  var url = require('url');
  var options = {
      host: url.parse(urlSource).hostname,
      path: url.parse(urlSource).pathname + unescape(url.parse(urlSource).search || '')
  }
  console.log (options.path);
  var request = http.request(options, function (res) {
      var data = '';
      res.on('data', function (chunk) {
          data += chunk;
      });
      //console.log (data);
      res.on('end', function () {
        //data = data.replace(/^[.\r\n]*<body.*\/>([.\r\n]*)<\/body>[.\r\n]*$/g,'$1');
        var pattern = /<body[^>]*>((.|[\n\r])*)<\/body>/im;
        var array_matches = pattern.exec(data);

        //console.log(array_matches[0]);
        var fs = require('fs');
        var fileContent = fs.readFileSync('app/index.html', 'utf8');
        fileContent = fileContent.replace(pattern, array_matches[0]);
        //console.log(fileContent);


       
        fs.writeFile(fileName, fileContent, function(err) {
            if(err) {
                return console.log(err);
            }
            console.log(urlSource);
            console.log('writen to');
            console.log(fileName);
        });

        //return data;
      });
  });
  request.on('error', function (e) {
      console.log(e.message);
  });
  request.end();
}

gulp.task('home', function () {
  var thedatestamp = new Date().getTime();
  getBodyFromUrl('http://www.ftchinese.com/m/corp/p0.html?' + thedatestamp, 'index.html');
});

gulp.task('copy', ['build'], function () {
  var replace = require('gulp-replace');
  var rename = require("gulp-rename");
  var thedatestamp = new Date().getTime();

  gulp.src('dist/styles/partials/*.css')
    .pipe(gulp.dest('../dev_www/frontend/tpl/next/styles'));

  gulp.src('dist/m/marketing/*')
    .pipe(gulp.dest('../dev_www/frontend/tpl/marketing'));

/*
  var fileName = '../dev_www/frontend/tpl/include/timestamp.html';
  var fs = require('fs');
  fs.writeFile(fileName, thedatestamp, function(err) {
      if(err) {
          return console.log(err);
      }
      console.log(thedatestamp);
      console.log('writen to');
      console.log(fileName);
  });
*/

});



gulp.task('styles', function () {
  return gulp.src('app/styles/main*.scss')
    .pipe($.plumber())
    .pipe($.rubySass({
      style: 'expanded',
      precision: 10
    }))
    .pipe($.autoprefixer({browsers: ['last 1 version']}))
    .pipe(gulp.dest('.tmp/styles'));
});

gulp.task('ad', function () {
  return gulp.src('app/m/marketing/*')
    .pipe(gulp.dest('dist/m/marketing'));
});

gulp.task('jshint', function () {
  return gulp.src('app/scripts/**/*.js')
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.jshint.reporter('fail'));
});

gulp.task('html', ['styles'], function () {
  var assets = $.useref.assets({searchPath: '{.tmp,app}'});

  return gulp.src('app/*.html')
    .pipe(assets)
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.csso()))
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe($.if('*.html', $.minifyHtml({conditionals: true, loose: true})))
    .pipe(gulp.dest('dist'));
});

gulp.task('images', function () {
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', function () {
  return gulp.src(require('main-bower-files')().concat('app/fonts/**/*'))
    .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
    .pipe($.flatten())
    .pipe(gulp.dest('dist/fonts'));
});

gulp.task('extras', function () {
  return gulp.src([
    'app/*.*',
    '!app/*.html',
    'node_modules/apache-server-configs/dist/.htaccess'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('clean', require('del').bind(null, ['.tmp', 'dist']));

gulp.task('connect', ['styles'], function () {
  var serveStatic = require('serve-static');
  var serveIndex = require('serve-index');
  var app = require('connect')()
    .use(require('connect-livereload')({port: 35729}))
    .use(serveStatic('.tmp'))
    .use(serveStatic('app'))
    // paths to bower_components should be relative to the current file
    // e.g. in app/index.html you should use ../bower_components
    .use('/bower_components', serveStatic('bower_components'))
    .use(serveIndex('app'));

  require('http').createServer(app)
    .listen(9000)
    .on('listening', function () {
      console.log('Started connect web server on http://localhost:9000');
    });
});

gulp.task('serve', ['connect', 'watch'], function () {
  require('opn')('http://localhost:9000');
});

// inject bower components
gulp.task('wiredep', function () {
  var wiredep = require('wiredep').stream;

  gulp.src('app/styles/*.scss')
    .pipe(wiredep())
    .pipe(gulp.dest('app/styles'));

  gulp.src('app/*.html')
    .pipe(wiredep())
    .pipe(gulp.dest('app'));
});

gulp.task('watch', ['connect'], function () {
  $.livereload.listen();

  // watch for changes
  gulp.watch([
    'app/*.html',
    '.tmp/styles/**/*.css',
    'app/scripts/**/*.js',
    'app/images/**/*'
  ]).on('change', $.livereload.changed);

  gulp.watch('app/styles/**/*.scss', ['styles']);
  gulp.watch('bower.json', ['wiredep']);
});

gulp.task('build', ['jshint', 'html', 'images', 'fonts', 'extras', 'ad'], function () {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], function () {
  gulp.start('build');
});
