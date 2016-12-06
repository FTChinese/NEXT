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

got(`http://m.ftchinese.com/eaclient/apijson.php`, {
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
  return fs.writeFile('nav.json', response.body, 'utf8');
})
.catch(error => {
  console.error(error.stack);
});





