var fs = require('vigour-fs-promised')
var path = require('path')
var url = require('url')

module.exports = function (req, res, next) {
  var parsedUrl = url.parse(req.url)
  var pathname = parsedUrl.pathname
  if (pathname === '/naked-gaston.js') {
    var gastonPath = path.join(require('os').tmpdir(), 'naked-gaston.js')
    return fs.createReadStream(gastonPath)
      .pipe(res)
  }
  return next()
}
