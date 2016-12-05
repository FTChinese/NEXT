const fs = require('mz/fs');
const got = require('got');
const co = require('co');
const cheerio = require('cheerio');
const nunjucks = require('nunjucks');

nunjucks.configure('views', {
  noCache: true,
  watch: false
});

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
// fetch contents from origamiModules.source and write to origamiModules.dest.
// co(function *() {
//   const results = yield Promise.all(origamiModules.map(module => {
//     console.log(`fetching ${module.source}`);
// // After getting response from url, return a new object consisting of url's content and file name to write.
//     return got(module.source)
//       .then(response => {
//         return {
//           dest: module.dest,
//           body: response.body
//         }
//       }, (error) => {
// // return error if network failed.          
//         return Promise.reject(error);
//       });
//   }));    


//   yield Promise.all(results.map(res => {
//     return fs.writeFile(res.dest, res.body, 'utf8');
//   }));

// })
// .catch((err) => {
// // catch any error if there are.  
//   console.error(err.stack);
// });



co(function *() {
  const timeStamp = new Date().getTime();
  console.log(`fetching latest body from home page`);
  const latestBody = yield got(`http://www.ftchinese.com/m/corp/p0.html?${timeStamp}`)
    .then(response => {
      const $ = cheerio.load(response.body);
      return $('body').html();
    });
  
  const html = yield render('index.html', {body: latestBody});

  yield fs.writeFile('.tmp/index.html', html, 'utf8');
})
.catch(err => {
  console.error(err.stack);
});

