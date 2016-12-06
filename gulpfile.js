const fs = require('mz/fs');
const got = require('got');
const co = require('co');
const cheerio = require('cheerio');
const nunjucks = require('nunjucks');
nunjucks.configure('views', {
  noCache: true,
  watch: false
});
const del = require('del');

const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const useref = require('gulp-useref');
const wiredep = require('wiredep').stream;

const browserSync = require('browser-sync').create();
const cssnext = require('postcss-cssnext');

const origamiModules = [
  {
    source: 'http://origami-build.ft.com/v2/bundles/js?modules=o-gallery@^1.7.6',
    dest: './app/origami/o-gallery.js'
  },
  {
    source: 'http://origami-build.ft.com/v2/bundles/css?modules=o-gallery@^1.7.6',
    dest: './app/origami/o-gallery.css'
  }
];
// Promisify nunjucks render function.
function render(view, context) {
  return new Promise(function(resolve, reject) {
    nunjucks.render(view, context, function(err, result) {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

// fetch contents from origamiModules.source and write to origamiModules.dest.
gulp.task('origami', () => {
  return co(function *() {
    const results = yield Promise.all(origamiModules.map(module => {
      console.log(`fetching ${module.source}`);
  // After getting response from url, return a new object consisting of url's content and file name to write.
      return got(module.source)
        .then(response => {
          return {
            dest: module.dest,
            body: response.body
          }
        }, (error) => {
  // return error if network failed.          
          return Promise.reject(error);
        });
    }));    


    yield Promise.all(results.map(res => {
      return fs.writeFile(res.dest, res.body, 'utf8');
    }));

  })
  .catch((err) => {
  // catch any error if there are.  
    console.error(err.stack);
  });
});

gulp.task('home', () => {
  const timeStamp = new Date().getTime();
  return co(function *() {
    const destDir = '.tmp';
  // check if `destDir` exitsts  
    try {
      yield fs.access(destDir, fs.constants.R_OK | fs.constants.W_OK);
    } catch (err) {
  // If not, create it.    
      yield fs.mkdir(destDir);
    }

    console.log(`fetching latest body from home page`);
    const latestBody = yield got(`http://www.ftchinese.com/m/corp/p0.html?${timeStamp}`)
      .then(response => {
  // Use cheerio to parse HTML and extract contents inside `<body>`      
        const $ = cheerio.load(response.body, {
          decodeEntities: false
        });      
        return $('body').html();
      });
  // Render `views/index.html` using the extracted body contents.
    const html = yield render('index.html', {body: latestBody});
  // Write rendered file to `.tmp/index.html`
    yield fs.writeFile(`${destDir}/index.html`, html, 'utf8');
    console.log('Updated .tmp/index.html');
  })
  .catch(err => {
    console.error(err.stack);
  });
})


gulp.task('story', () => {
  return co(function *() {
    const date = new Date();
    const timeStamp = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;  
    // const cookies = yield got('https://backyard.ftchinese.com/falcon.php/cmsusers/login')
    // .then(response => {
    //   const cookies = response.headers['set-cookie'].map(cookie => {
    //      const obj =  Cookie.parse(cookie);
    //      return `${obj.key}=${obj.value}`;
    //   });
    //   return cookies.join(';');
    // });

    const cookie = `PHPSESSID=78f011e58763cbca4400e42b265d4e33; ftcms_uid=13; ftcms_username=oliver.zhang; ftcms_groups=editor`;

    const response = yield got(`https://backyard.ftchinese.com/falcon.php/homepage/getstoryapi/${timeStamp}`, {
      'headers': {
        'user-agent': 'ftc',
        'cookie': cookie
      }  
    });

    yield fs.writeFile('stories.json', response.body, 'utf8');
  })
  .catch(err => {
    console.log(err);
  });
});

gulp.task('nav', () => {
  return got(`http://m.ftchinese.com/eaclient/apijson.php`, {
    method: 'POST',
    body: JSON.stringify({
      head: {
        transactiontype: '11001',
        source: 'web'
      },
      body: {
        ielement: {}
      }
    })
  })
  .then(response => {
    return fs.writeFile('./app/api/page/nav.json', response.body, 'utf8');
  })
  .catch(error => {
    console.error(error.stack);
  });
});

gulp.task('styles', function () {
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
    .pipe(browserSync.stream()); 
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

gulp.task('html', gulp.series('styles', () => {
  return gulp.src('app/*.html')
    .pipe($.useref({searchPath: ['.tmp', 'app', '.']}))
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.cssnano()))
    .pipe($.if('*.html', $.htmlmin({collapseWhitespace: true})))
    .on('error', $.util.log)
    .pipe(gulp.dest('dist'));
}));

gulp.task('images', function () {
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/images'));
});

// gulp.task('fonts', function () {
//   return gulp.src(require('main-bower-files')().concat('app/fonts/**/*'))
//     .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
//     .pipe($.flatten())
//     .pipe(gulp.dest('dist/fonts'));
// });

// gulp.task('extras', function () {
//   return gulp.src([
//     'app/*.*',
//     '!app/*.html',
//     'node_modules/apache-server-configs/dist/.htaccess'
//   ], {
//     dot: true
//   }).pipe(gulp.dest('dist'));
// });



// gulp.task('connect', ['styles'], function () {
//   var serveStatic = require('serve-static');
//   var serveIndex = require('serve-index');
//   var app = require('connect')()
//     .use(require('connect-livereload')({port: 35729}))
//     .use(serveStatic('.tmp'))
//     .use(serveStatic('app'))
//     // paths to bower_components should be relative to the current file
//     // e.g. in app/index.html you should use ../bower_components
//     .use('/bower_components', serveStatic('bower_components'))
//     .use(serveIndex('app'));

//   require('http').createServer(app)
//     //.listen(9000)
//     .listen(9000, '0.0.0.0')
//     .on('listening', function () {
//       console.log('Started connect web server on http://localhost:9000');
//     });
// });

// gulp.task('watch', ['connect'], function () {
//   $.livereload.listen();

//   // watch for changes
//   gulp.watch([
//     'app/*.html',
//     '.tmp/styles/**/*.css',
//     'app/scripts/**/*.js',
//     'app/images/**/*'
//   ]).on('change', $.livereload.changed);

//   gulp.watch('app/styles/**/*.scss', ['styles']);
//   gulp.watch('bower.json', ['wiredep']);
// });

// gulp.task('serve', ['connect', 'watch'], function () {
//   require('opn')('http://localhost:9000');
// });

gulp.task('serve', 
  gulp.parallel(
    'html', 'styles', 

    function serve() {
    browserSync.init({
      server: {
        baseDir: [tmpDir, 'client'],
        index: 'index.html',
        routes: {
          '/bower_components': 'bower_components'
        }
      }
    });

    gulp.watch('app/styles/**/*.scss', gulp.parallel('styles'));
    gulp.watch(['app/*.html', 'app/scripts/**/*.js', 'app/images/**/*'], browserSync.reload);
  })
);

// inject bower components
gulp.task('wiredep', function () {

  gulp.src('app/styles/*.scss')
    .pipe(wiredep())
    .pipe(gulp.dest('app/styles'));

  gulp.src('app/*.html')
    .pipe(wiredep())
    .pipe(gulp.dest('app'));
});

gulp.task('clean', function() {
  return del(['.tmp/**', 'dist']).then(()=>{
    console.log('dir .tmp and dist deleted');
  });
});

gulp.task('build', gulp.parallel('jshint', 'html', 'images', /*'fonts', 'extras',*/ 'ad'));

// gulp.task('default', ['clean'], function () {
//   gulp.start('build');
// });

// gulp.task('copy', ['build'], function () {
//   //var replace = require('gulp-replace');
//   //var rename = require("gulp-rename");
//   var thedatestamp = new Date().getTime();

//   gulp.src('app/origami/*.css')
//     .pipe(gulp.dest('../dev_www/frontend/static/n'))
//     .pipe(gulp.dest('../dev_www/frontend/tpl/next/styles'))
//     .pipe(gulp.dest('../testing/dev_www/frontend/tpl/next/styles'));
  
//   gulp.src('app/origami/*.js')
//     .pipe(gulp.dest('../dev_www/frontend/static/n'))
//     .pipe(gulp.dest('../dev_www/frontend/tpl/next/scripts'))
//     .pipe(gulp.dest('../testing/dev_www/frontend/tpl/next/scripts'));

//   gulp.src('dist/styles/*.css')
//     .pipe(gulp.dest('../dev_www/frontend/static/n'))
//     .pipe(gulp.dest('../dev_www/frontend/tpl/next/styles'))
//     .pipe(gulp.dest('../testing/dev_www/frontend/tpl/next/styles'));

//   gulp.src('dist/styles/partials/*.css')
//     .pipe(gulp.dest('../dev_www/frontend/tpl/next/styles'))
//     .pipe(gulp.dest('../testing/dev_www/frontend/tpl/next/styles'));

//   gulp.src('dist/scripts/*.js')
//     .pipe(gulp.dest('../dev_www/frontend/static/n'))
//     .pipe(gulp.dest('../dev_www/frontend/tpl/next/scripts'))
//     .pipe(gulp.dest('../testing/dev_www/frontend/tpl/next/scripts'));

//   gulp.src('dist/m/marketing/*')
//     .pipe(gulp.dest('../dev_www/frontend/tpl/marketing'))
//     .pipe(gulp.dest('../testing/dev_www/frontend/tpl/marketing'));

//   gulp.src('app/api/page/*')
//     .pipe(gulp.dest('../dev_www/frontend/tpl/next/api/page'))
//     .pipe(gulp.dest('../testing/dev_www/frontend/tpl/next/api/page'));

//   gulp.src('dist/**/*')
//     .pipe(gulp.dest('../dev_cms/pagemaker'))
//     .pipe(gulp.dest('../testing/dev_cms/pagemaker'));

//   gulp.src('app/api/**/*')
//     .pipe(gulp.dest('../dev_cms/pagemaker/api'))
//     .pipe(gulp.dest('..testing/dev_cms/pagemaker/api'));

//   gulp.src('app/templates/p0.html')
//     .pipe($.replace(/([\r\n])[ \t]+/g, '$1'))
//     .pipe($.replace(/(\r\n)+/g, '\r\n'))
//     .pipe($.replace(/(\n)+/g, '\n'))
//     .pipe(gulp.dest('../dev_www/frontend/tpl/corp'))
//     .pipe(gulp.dest('../testing/dev_www/frontend/tpl/corp'));

//   gulp.src('app/templates/partials/**/*')
//     .pipe($.replace(/([\r\n])[ \t]+/g, '$1'))
//     .pipe($.replace(/(\r\n)+/g, '\r\n'))
//     .pipe($.replace(/(\n)+/g, '\n'))
//     .pipe(gulp.dest('../dev_www/frontend/tpl/next/partials'))
//     .pipe(gulp.dest('../testing/dev_www/frontend/tpl/next/partials'));

//   gulp.src('app/templates/html/**/*')
//     .pipe($.replace(/([\r\n])[ \t]+/g, '$1'))
//     .pipe($.replace(/(\r\n)+/g, '\r\n'))
//     .pipe($.replace(/(\n)+/g, '\n'))
//     .pipe(gulp.dest('../dev_www/frontend/tpl/next/html'))
//     .pipe(gulp.dest('../testing/dev_www/frontend/tpl/next/html'));


//   var fileName = '../dev_www/frontend/tpl/next/timestamp/timestamp.html';
//   var fileName2 = '../testing/dev_www/frontend/tpl/next/timestamp/timestamp.html';
//   //var fs = require('fs');
//   fs.writeFile(fileName, thedatestamp, function(err) {
//       if(err) {
//           return console.log(err);
//       }
//       console.log(thedatestamp);
//       console.log('writen to');
//       console.log(fileName);
//   });
//   fs.writeFile(fileName2, thedatestamp, function(err) {
//       if(err) {
//           return console.log(err);
//       }
//       console.log(thedatestamp);
//       console.log('writen to');
//       console.log(fileName2);
//   });

// });