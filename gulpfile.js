const fs = require('mz/fs');
const got = require('got');
const co = require('co');
const cheerio = require('cheerio');
const nunjucks = require('nunjucks');
// Set template default dir to `views`. To be used in `home` task.
nunjucks.configure('views', {
  noCache: true,
  watch: false,
  autoescape: false
});
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

const del = require('del');

const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const useref = require('gulp-useref');
const wiredep = require('wiredep').stream;

const browserSync = require('browser-sync').create();
const merge = require('merge-stream');
const source = require('vinyl-source-stream');
const sass = require('gulp-dart-sass');

const origamiModules = [
  // {
  //   source: 'http://www.ft.com/__origami/service/build/v2/bundles/js?modules=o-gallery@^1.7.6',
  //   dest: './app/origami/o-gallery.js'
  // },
  // {
  //   source: 'https://www.ft.com/__origami/service/build/v2/bundles/js?modules=o-ads@10.2.1',
  //   dest: './app/origami/o-ads.js'
  // },
  // {
  //   source: 'https://www.ft.com/__origami/service/build/v2/bundles/css?modules=o-grid@^4.5.1,o-colors@^4.8.5,o-typography@^5.10.1,o-table@^7.2.1&brand=internal',
  //   dest: './app/origami/o-grid.css'
  // },
  // {
  //   source: 'https://www.ft.com/__origami/service/build/v2/bundles/js?modules=o-table@^7.2.1',
  //   dest: './app/origami/o-table.js'
  // },
  {
    source: 'https://ai.chineseft.net/tag/js/gpt.js',
    dest: '../dev_www/frontend/static/js/gpt.js'
  },
  {
    source: 'https://ai.chineseft.net/tag/js/gpt.js',
    dest: './app/origami/gpt.js'
  }
  
];

// fetch contents from `origamiModules.source` and write to `origamiModules.dest`.
gulp.task('origami', () => {
  const now = new Date().getTime();
  return co(function *() {
    const results = yield Promise.all(origamiModules.map(module => {
  // After getting response from url, return a new object consisting of url's content and file name to write.
      return got(module.source)
        .then(response => {
          var body = response.body;
          if (module.source.indexOf('o-ads') >= 0) {
            // const gptUrl = 'd2hgac2iiu3amu.cloudfront.net/ads/gpt.js'; 
            const gptUrl = 'd2785ji6wtdqx8.cloudfront.net/js/gpt.js';
            body = body.replace(/www\.googletagservices\.com\/tag\/js\/gpt\.js/g, `${gptUrl}?${now}`);
          }
          return {
            dest: module.dest,
            body: body
          }
        }, (error) => {
  // return error if network failed.          
          return Promise.reject(error);
        });
    }));    


    yield Promise.all(results.map(res => {
      console.log(`Updated o-ads! `);
      return fs.writeFile(res.dest, res.body, 'utf8');
    }));

  })
  .catch((err) => {
  // catch any error if there are.  
    console.error(err.stack);
  });
});

// Fetch latest content from home page, and update `app/index.html`
gulp.task('home', () => {
  const timeStamp = new Date().getTime();
  return co(function *() {
    const destDir = 'app';
  // check if `destDir` exitsts  
    try {
      yield fs.access(destDir, fs.constants.R_OK | fs.constants.W_OK);
    } catch (err) {
  // If not, create it.    
      yield fs.mkdir(destDir);
    }

    console.log(`fetching latest body from home page`);
    const latestBody = yield got(`https://www.ftchinese.com/m/corp/p0.html?${timeStamp}`)
      .then(response => {
  // Use cheerio to parse HTML and extract contents inside `<body>`      
        const $ = cheerio.load(response.body, {
          decodeEntities: true
        });      
        return $('body').html();
      });
      
  // Render `views/index.html` using the extracted body contents.
    const html = yield render('index.html', {body: latestBody});
  // Write rendered file to `.tmp/index.html`
    yield fs.writeFile(`${destDir}/index.html`, html, 'utf8');
    console.log(`Updated ${destDir}/index.html`);
  })
  .catch(err => {
    console.error(err.stack);
  });
})

// To access the api you need to send cookie PHPSESSID.
gulp.task('story', () => {
  return co(function *() {
    const date = new Date();
    const timeStamp = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;  
    // const cookies = yield got('https://d2fip1ztbdfija.cloudfront.net/falcon.php/cmsusers/login')
    // .then(response => {
    //   const cookies = response.headers['set-cookie'].map(cookie => {
    //      const obj =  Cookie.parse(cookie);
    //      return `${obj.key}=${obj.value}`;
    //   });
    //   return cookies.join(';');
    // });

    const cookie = `PHPSESSID=78f011e58763cbca4400e42b265d4e33; ftcms_uid=13; ftcms_username=oliver.zhang; ftcms_groups=editor`;

    const response = yield got(`https://d2fip1ztbdfija.cloudfront.net/falcon.php/homepage/getstoryapi/${timeStamp}`, {
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

// Get the nav.json.
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
    console.log('updated ./app/api/page/nav.json');
    console.log (response.body);
    return fs.writeFile('./app/api/page/nav.json', response.body, 'utf8');
  })
  .catch(error => {
    console.error(error.stack);
  });
});

// Compile SCSS
gulp.task('styles', function () {
  const DEST = '.tmp/styles';
  return gulp.src(['app/styles/main*.scss'])
    .pipe($.changed(DEST)) 
    .pipe($.plumber()) 
    .pipe($.sourcemaps.init({loadMaps:true})) 
    .pipe(sass.sync({ 
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.', 'node_modules']
    }).on('error', sass.logError))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(DEST))
    .pipe(browserSync.stream({match: '**/**/*.css'})); 
});


gulp.task('ad', function () {
  return gulp.src('app/m/marketing/*')
    .pipe(gulp.dest('dist/m/marketing'));
});

gulp.task('jshint', function () {
  // return gulp.src('app/scripts/mini-site-rend er.js')
  return gulp.src('app/scripts/**/*.js')
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.jshint.reporter('fail'));
});

// Build css and js.
gulp.task('html', gulp.series('styles', () => {
  return gulp.src('app/*.html')
    .pipe($.useref({searchPath: ['.tmp', 'app', '.']}))
    .on('finish', () => {console.log ('Finished useref')})
    .pipe($.if('*.js', $.babel({
      presets: ['@babel/preset-env']
    })))
    .pipe($.if('*.js', $.uglify()))
    .on('error', (err) => {
      if(err) {
        console.log(err.fileName);
        console.log(err.cause);
        console.log(err.line);
      }
    })
    .pipe($.if('*.css', $.cssnano({
      // MARK: - Always set autoprefixer to false because cssnano will remove useful css lines. Just handle prefix by yourself. 
      autoprefixer: false,
      normalizeUrl: false,
      discardUnused: false
    })))
    .pipe($.if('*.html', $.htmlmin({collapseWhitespace: true})))
    .pipe(gulp.dest('dist'));
}));

gulp.task('images', function () {
  return gulp.src('app/images/**/*')
    .pipe($.imagemin({
      progressive: true,
      interlaced: true
    }))
    .pipe(gulp.dest('dist/images'));
});

// Launch static server
gulp.task('serve', 
  gulp.parallel(
    'styles', 
    function serve() {
    browserSync.init({
      server: {
        baseDir: ['app', '.tmp'],
        index: 'index.html',
        routes: {
          '/node_modules': 'node_modules'
        }
      }
    });

    gulp.watch('app/styles/**/*.scss', gulp.parallel('styles'));
    gulp.watch(['app/*.html', 'app/scripts/**/*.js', 'app/images/**/*'], browserSync.reload);
  })
);

// Is this one in use?
gulp.task('wiredep', function () {

  const scss = gulp.src('app/styles/*.scss')
    .pipe(wiredep())
    .pipe(gulp.dest('app/styles'));

  const html = gulp.src('app/*.html')
    .pipe(wiredep())
    .pipe(gulp.dest('app'));

  return merge(scss, html);
});

gulp.task('clean', function() {
  return del(['.tmp/**', 'dist']).then(()=>{
    console.log('dir .tmp and dist deleted');
  });
});

gulp.task('build', gulp.parallel('jshint', 'html', 'images', /*'fonts', 'extras',*/ 'ad'));

// Various copy tasks.
gulp.task('copy:cssjs', () => {
  const staticDest = 'dev_www/frontend/static/n';
  const cssDest = 'dev_www/frontend/tpl/next/styles';
  const jsDest = 'dev_www/frontend/tpl/next/scripts';
  const legacyJSSrc = 'dev_www/frontend/static/js';
  

  let cssStream = gulp.src(['app/origami/*.css', 'dist/styles/*.css'])
    .pipe(gulp.dest(`../${staticDest}`))
    .pipe(gulp.dest(`../${cssDest}`));

  let jsStream = gulp.src(['app/origami/*.js', 'dist/scripts/*.js'])
    .pipe(gulp.dest(`../${staticDest}`))
    .pipe(gulp.dest(`../${jsDest}`));

  let legacyJSStream = gulp.src([`../${legacyJSSrc}/*.js`])
    .pipe(gulp.dest(`../${jsDest}`));

  return merge(cssStream, jsStream, legacyJSStream);
});

gulp.task('copy:marketing', () => {
  const dest = 'dev_www/frontend/tpl/marketing';
  const mobileRootdest = 'dev_www/mobile_webroot/m/marketing';
  gulp.src('dist/m/marketing/*')
    .pipe(gulp.dest(`../${dest}`))
    //.pipe(gulp.dest(`../testing/${dest}`))
    .pipe(gulp.dest(`../${mobileRootdest}`));
    //.pipe(gulp.dest(`../testing/${mobileRootdest}`));

  const wwwrootDest = 'dev_www/webroot';
  const mobilewwwrootDest = 'dev_www/mobile_webroot';
  return gulp.src('dist/m/marketing/a.html')
    .pipe(gulp.dest(`../${wwwrootDest}`))
    //.pipe(gulp.dest(`../testing/${wwwrootDest}`))
    .pipe(gulp.dest(`../${mobilewwwrootDest}`));
    //.pipe(gulp.dest(`../testing/${mobilewwwrootDest}`));

});

gulp.task('copy:apipage', () => {
  const dest = 'dev_www/frontend/tpl/next/api/page'
  return gulp.src('app/api/page/*')
    .pipe(gulp.dest(`../${dest}`))
    //.pipe(gulp.dest(`../testing/${dest}`));
});



gulp.task('copy:time', () => {
  const dest = 'dev_www/frontend/tpl/next/timestamp';
  const timeStamp = new Date().getTime();
// Create a virtual vinyl stream  
  const stream = source('timestamp.html');
// write date to the stream.  
  stream.end(timeStamp.toString());
// Use the steam with gulp.
  return stream
    .pipe(gulp.dest(`../${dest}`))
    //.pipe(gulp.dest(`../testing/${dest}`));
});

gulp.task('copy:tpl', () => {
  const dest = 'dev_www/frontend/tpl/next';

  return gulp.src(['app/templates/partials*/**/*', 'app/templates/html*/**/*'])
    .on('error', (err) => {
      console.error(err.stack);
    })
    .pipe($.replace(/([\r\n])[ \t]+/g, '$1'))
    .pipe($.replace(/(\r\n)+/g, '\r\n'))
    .pipe($.replace(/(\n)+/g, '\n')) 
    .pipe(gulp.dest(`../${dest}`))
    //.pipe(gulp.dest(`../testing/${dest}`));
});

gulp.task('copy:cms', async () => {
  const dest = '../dev_cms/next';
  if (!fs.existsSync(dest)) {
    console.log(`${dest} does not exist! `);
    return;
  }
  return gulp.src(['dist*/**/*'])
    .on('error', (err) => {
      console.error(err.stack);
    })
    .pipe(gulp.dest(dest));
});

gulp.task('copy:ftcoffer', async () => {

  const dest = '../ftcoffer/public';
  if (!fs.existsSync(dest)) {
    console.log(`${dest} does not exist! `);
    return;
  }

  // MARK: - Need all the JS files in dist now
  const jsFiles = ['*'];
  for (const jsFile of jsFiles) {
    gulp.src([`dist/scripts/${jsFile}.js`])
      .on('error', (err) => {
        console.error(err.stack);
      })
      .pipe(gulp.dest(`${dest}/scripts`));
  }

  gulp.src([`./app/origami/*.js`])
    .on('error', (err) => {
      console.error(err.stack);
    })
    .pipe(gulp.dest(`${dest}/scripts`));

  gulp.src([`./app/origami/*.css`])
    .on('error', (err) => {
      console.error(err.stack);
    })
    .pipe(gulp.dest(`${dest}/styles`));

  // MARK: - Need all the css files in dist now
  const cssFiles = ['*'];
  for (const cssFile of cssFiles) {
    gulp.src([`dist/styles/${cssFile}.css`])
    .on('error', (err) => {
      console.error(err.stack);
    })
    .pipe(gulp.dest(`${dest}/styles`));
  }

  // MARK: - Translation Helper
  gulp.src(['dist/translation-helper.html'])
    .on('error', (err) => {
      console.error(err.stack);
    })
    .pipe(gulp.dest(dest));

  // MARK: - ChatFT
  gulp.src(['dist/chat.html'])
    .on('error', (err) => {
      console.error(err.stack);
    })
    .pipe(gulp.dest(dest));


  gulp.src(['app/scripts/*.json'])
    .on('error', (err) => {
      console.error(err.stack);
    })
    .pipe(gulp.dest(`${dest}/scripts`));

  // Read file content into a string
  const serviceWorkerPath = 'app/scripts/chat-service-worker.js';
  let fileContent = fs.readFileSync(serviceWorkerPath, 'utf8');
  const regex = /cacheName = 'v([0-9]+)'/;
  const matches = regex.exec(fileContent);
  if (matches && matches.length > 1) {
    const versionNumber = matches[1];
    const version = parseInt(versionNumber, 10);
    if (version > 0) {
      const newVersion = version + 1;
      fileContent = fileContent.replace(regex, `cacheName = 'v${newVersion}'`);
      fs.writeFileSync(serviceWorkerPath, fileContent, 'utf8');
    }
  }
  gulp.src([serviceWorkerPath])
    .on('error', (err) => {
      console.error(err.stack);
    })
    .pipe(gulp.dest(`${dest}`));

});

gulp.task('copy:p0', () => {
  const dest = 'dev_www/frontend/tpl/corp';
  return gulp.src('app/templates/p0.html')
    .pipe($.replace(/([\r\n])[ \t]+/g, '$1'))
    .pipe($.replace(/(\r\n)+/g, '\r\n'))
    .pipe($.replace(/(\n)+/g, '\n')) 
    .on('error', (err) => {
      console.error(err.stack);
    })
    .pipe(gulp.dest(`../${dest}`));
    //.pipe(gulp.dest(`../testing/${dest}`));
});


gulp.task('copy', gulp.series(
  'clean',
  'build', 
  gulp.parallel(
    'copy:cssjs', 
    'copy:marketing', 
    'copy:apipage', 
    'copy:ftcoffer',
    'copy:tpl', 
    'copy:cms',
    'copy:p0', 
    'copy:time',
    'origami'
  )
));