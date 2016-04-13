/* jshint node:true */
'use strict';
// generated on 2015-09-01 using generator-gulp-webapp 0.2.0
const fs = require('fs');
const http = require('http');
const url = require('url');
const request = require('request');
const cheerio = require('cheerio');
const del = require('del');

const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const useref = require('gulp-useref');

const browserSync = require('browser-sync').create();
const cssnext = require('postcss-cssnext');

function getUrltoFile (urlSource, fileName) {
  // var http = require('http');
  // var url = require('url');
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
        var fs = require('fs');
        fs.writeFile(fileName, data, function(err) {
            if(err) {
                return console.log(err);
            }
            console.log(urlSource);
            console.log('writen to');
            console.log(fileName);
        });
      });
  });
  request.on('error', function (e) {
      console.log(e.message);
  });
  request.end();
}


function getBodyFromUrl (urlSource, fileName) {
  // var http = require('http');
  // var url = require('url');
  var options = {
      host: url.parse(urlSource).hostname,
      path: url.parse(urlSource).pathname + unescape(url.parse(urlSource).search || '')
  }
  console.log (options.path);
  var req = http.request(options, function (res) {
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
        //var fs = require('fs');
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
  req.on('error', function (e) {
      console.log(e.message);
  });
  req.end();
}

gulp.task('home', function () {
  var thedatestamp = new Date().getTime();
  getBodyFromUrl('http://www.ftchinese.com/m/corp/p0.html?' + thedatestamp, 'index.html');
});

gulp.task('copy', ['build'], function () {
  //var replace = require('gulp-replace');
  //var rename = require("gulp-rename");
  var thedatestamp = new Date().getTime();

  gulp.src('dist/styles/*.css')
    .pipe(gulp.dest('../dev_www/frontend/static/n'))
    .pipe(gulp.dest('../dev_www/frontend/tpl/next/styles'))
    .pipe(gulp.dest('../testing/dev_www/frontend/tpl/next/styles'));

  gulp.src('dist/styles/partials/*.css')
    .pipe(gulp.dest('../dev_www/frontend/tpl/next/styles'))
    .pipe(gulp.dest('../testing/dev_www/frontend/tpl/next/styles'));

  gulp.src('dist/scripts/*.js')
    .pipe(gulp.dest('../dev_www/frontend/static/n'))
    .pipe(gulp.dest('../dev_www/frontend/tpl/next/scripts'))
    .pipe(gulp.dest('../testing/dev_www/frontend/tpl/next/scripts'));

  gulp.src('dist/m/marketing/*')
    .pipe(gulp.dest('../dev_www/frontend/tpl/marketing'))
    .pipe(gulp.dest('../testing/dev_www/frontend/tpl/marketing'));

  gulp.src('app/api/page/*')
    .pipe(gulp.dest('../dev_www/frontend/tpl/next/api/page'))
    .pipe(gulp.dest('../testing/dev_www/frontend/tpl/next/api/page'));

  gulp.src('dist/**/*')
    .pipe(gulp.dest('../dev_cms/pagemaker'))
    .pipe(gulp.dest('../testing/dev_cms/pagemaker'));

  gulp.src('app/api/**/*')
    .pipe(gulp.dest('../dev_cms/pagemaker/api'))
    .pipe(gulp.dest('..testing/dev_cms/pagemaker/api'));

  gulp.src('app/templates/p0.html')
    .pipe($.replace(/([\r\n])[ \t]+/g, '$1'))
    .pipe($.replace(/(\r\n)+/g, '\r\n'))
    .pipe($.replace(/(\n)+/g, '\n'))
    .pipe(gulp.dest('../dev_www/frontend/tpl/corp'))
    .pipe(gulp.dest('../testing/dev_www/frontend/tpl/corp'));

  gulp.src('app/templates/partials/**/*')
    .pipe($.replace(/([\r\n])[ \t]+/g, '$1'))
    .pipe($.replace(/(\r\n)+/g, '\r\n'))
    .pipe($.replace(/(\n)+/g, '\n'))
    .pipe(gulp.dest('../dev_www/frontend/tpl/next/partials'))
    .pipe(gulp.dest('../testing/dev_www/frontend/tpl/next/partials'));

  gulp.src('app/templates/html/**/*')
    .pipe($.replace(/([\r\n])[ \t]+/g, '$1'))
    .pipe($.replace(/(\r\n)+/g, '\r\n'))
    .pipe($.replace(/(\n)+/g, '\n'))
    .pipe(gulp.dest('../dev_www/frontend/tpl/next/html'))
    .pipe(gulp.dest('../testing/dev_www/frontend/tpl/next/html'));


  var fileName = '../dev_www/frontend/tpl/next/timestamp/timestamp.html';
  var fileName2 = '../testing/dev_www/frontend/tpl/next/timestamp/timestamp.html';
  //var fs = require('fs');
  fs.writeFile(fileName, thedatestamp, function(err) {
      if(err) {
          return console.log(err);
      }
      console.log(thedatestamp);
      console.log('writen to');
      console.log(fileName);
  });
  fs.writeFile(fileName2, thedatestamp, function(err) {
      if(err) {
          return console.log(err);
      }
      console.log(thedatestamp);
      console.log('writen to');
      console.log(fileName2);
  });

});

gulp.task('story', function () {
  var thisday = new Date();
  var theyear = thisday.getFullYear();
  var themonth = thisday.getMonth() + 1;
  var theday =  thisday.getDate();
  var thedatestamp = theyear + '-' + themonth + '-' + theday;


  var urlSource = 'https://backyard.ftchinese.com/falcon.php/cmsusers/login';
  //var http = require('http');
  //var url = require('url');
  var options = {
      host: url.parse(urlSource).hostname,
      path: url.parse(urlSource).pathname + unescape(url.parse(urlSource).search || '')
  }


//var request = require('request');


request.post({
    url: 'https://backyard.ftchinese.com/falcon.php/cmsusers/login',
    form: {"username":"", "password":""},
    headers: {
      'User-Agent': 'request'
    }
}, function(error, response, body){
    var storyapi = 'https://backyard.ftchinese.com/falcon.php/homepage/getstoryapi/' + thedatestamp;
    //var headers = response.headers;
    // headers['Content-Length'] = 100000;
    // headers['User-Agent'] = 'request';
    // headers['expires'] = 'Fri, 19 Feb 2016 08:52:00 GMT';

    // console.log (headers);

    var headers = {
'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
//'Accept-Encoding':'gzip, deflate, sdch',
'Accept-Language':'zh-CN,zh;q=0.8,en;q=0.6',
'Cache-Control':'max-age=0',
'Connection':'keep-alive',
'Cookie':'FTSTAT_ok_times=22; _ga=GA1.3.637326541.1424081173; campaign=2015spring5; _gscu_2081532775=0.7.0.5%7C2483082596632ej013%7C1424859625967%7C8%7C3%7C27%7C0; __utma=65529209.637326541.1424081173.1449122460.1454643214.25; __utmz=65529209.1449122460.24.6.utmcsr=EmailNewsletter|utmccn=1D110215|utmcmd=referral; __utmv=65529209.visitor_DailyEmail; __gads=ID=cd878295be28de40:T=1454986613:S=ALNI_MbkpbmkeeFOrhk1DVu05zuKdgqPmw; SIVISITOR=Ni42NzQuOTg3MjQ2MjgyMzk4Ny4xNDU0OTg2NjE0Mzc0Li0xZDZkODE5Ng__*; ccode=1P110215; faid=97e09ef664648f4bcc02a418e06717d3; ftn_cookie_id=1455247531.176777595; PHPSESSID=f8b0d2f63c554af8a5c8ef8a79b4c4bb; _ga=GA1.2.637326541.1424081173; ftcms_uid=13; ftcms_username=oliver.zhang; ftcms_groups=editor',
'Host':'backyard.ftchinese.com',
'Upgrade-Insecure-Requests':'1',
//'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.109 Safari/537.36'
    }



/*
    headers = {
      'User-Agent': 'request',
      'expires': 'Fri, 19 Feb 2016 08:52:00 GMT'
    };
*/
    
    request.get({
        url: storyapi,
        headers: headers
    },function(error, response, body){
        // The full html of the authenticated page
        console.log(body);

        var fileName = './app/api/page/stories.json';
        var fs = require('fs');
        fs.writeFile(fileName, body, function(err) {
            if(err) {
                return console.log(err);
            }
            console.log(storyapi);
            console.log('writen to');
            console.log(fileName);
        });


    });
    

});


  
});


gulp.task('styles', function () {
  return gulp.src('app/styles/main*.scss')
    .pipe($.plumber())
    .pipe($.rubySass({
      style: 'expanded',
      precision: 10,
      loadPath: ['bower_components']
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
  return gulp.src('app/index.html')
    .pipe($.useref({searchPath: ['.tmp', 'app', '.']}))
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.cssnano()))
    .pipe($.if('*.html', $.htmlmin({collapseWhitespace: true})))
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

/*gulp.task('clean', require('del').bind(null, ['.tmp', 'dist']));*/

gulp.task('clean', function() {
  return del(['.tmp/**', 'dist']).then(()=>{
    console.log('dir .tmp and dist deleted');
  });
});

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
    //.listen(9000)
    .listen(9000, '0.0.0.0')
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

/*
* Task to lauch local PHP server.
* It first starts a local PHP server with task `php` on port 8011
* Then browser-sync start a proxy server on port 8081 connecting to port 8011.
* You need to has PHP 5.4 or above to lauch a local server.
* You also need to install PHP package manager `composer` to install dependencies needed.
*/
gulp.task('css', function () {
  const DEST = '.tmp/styles';

  return gulp.src(['app/styles/main*.scss'])
    .pipe($.changed(DEST)) 
    .pipe($.plumber()) 
    .pipe($.sourcemaps.init({loadMaps:true})) 
    .pipe($.sass({ 
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['bower_components']
    }).on('error', $.sass.logError))
    .pipe($.postcss([
      cssnext({ 
        features: {
          colorRgba: false
        }
      })
    ]))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(DEST))
    .pipe(browserSync.stream({once:true})); 
});

gulp.task('copym', function() {
  return gulp.src('app/m/**')
    .pipe(gulp.dest('.tmp/m'));
});

gulp.task('copyjs', function() {
  return gulp.src(['header/js/*.js', 'app/scripts/*.js'])
  .pipe(gulp.dest('.tmp/scripts'))
  .pipe(browserSync.stream({once:true}));
});

gulp.task('php', function() {
  $.connectPhp.server({
    base: 'server',
    port: '8011',
    keepalive: true
  });
});

gulp.task('serve', 
  ['css', 'copym', 'copyjs', 'php'],
  function() {
  browserSync.init({
    proxy: 'localhost:8011',
    port: 8081,
    open: true,
    notify: true,
    serveStatic: ['bower_components', '.tmp']
  });

  gulp.watch(['views/**/*', 'app/templates/partials/*.html', 'server/*'], browserSync.reload);
  gulp.watch(['app/**/*.js'], ['copyjs']);
  gulp.watch(['app/styles/**/*.scss'], ['css']);
});

gulp.task('testserver', function() {
  return gulp.src(['app/templates/partials/nav.html'])
    .pipe($.replace('<!-- easyapi -->', '<%easyapi command="11001" assign="datass1" debug=false%><%*$datass1.odatalist|var_dump*%>'))
    .pipe($.smoosher({
      base: '.tmp'
    }))
    .pipe(gulp.dest('../www/frontend/tpl/next/partials'));
});
/*************/

gulp.task('build', ['jshint', 'html', 'images', 'fonts', 'extras', 'ad'], function () {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], function () {
  gulp.start('build');
});

gulp.task('requestdata', function(done) {
  const dateStamp = new Date().getTime();
  const url = 'http://www.ftchinese.com/m/corp/p0.html?' + dateStamp;

  request(url, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      const $ = cheerio.load(body, {
        decodeEntities: false
      });
      $('#roadblock').remove();
      $('.header-container').remove();
      $('.nav-place-holder').remove();
      $('.footer-container').remove();
      $('#overlay-login').remove();
      $('.app-download-container').remove();
      const data = $('body').html();

      fs.writeFile('views/next/body.html', data, function(err) {
        if (err) {return done(err)}
        done();
      });
    }
  });
});
