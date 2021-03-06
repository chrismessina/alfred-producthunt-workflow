/* global process */
/* global setTimeout */
var http = require('http'),
  request = require('request'),
  morgan = require('morgan');

var cachedPosts;
var logger = morgan(':remote-addr - ":method :url HTTP/:http-version" :status - :response-time ms ":user-agent"');

var fetchPosts = function (callback) {
  var opts = {
    url: 'https://api.producthunt.com/v1/posts',
    auth: {
      bearer: process.env.PH_API_ACCESS_TOKEN
    },
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  };

  request.get(opts, function (err, resp, body) {
    callback(err, body);
  });
};

(function loop() {
  fetchPosts(function (err, posts) {
    cachedPosts = posts;
    setTimeout(function () {
      loop();
    }, 60*1000);
  });
})();

http.createServer(function (req, res) {
  logger(req, res, function () {
    if (req.url === '/v1/posts') {
      res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
      res.end(cachedPosts);
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  });
}).listen(process.env.PORT || 3000);

