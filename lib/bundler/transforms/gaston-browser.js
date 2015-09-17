var through = require('through2')
  , path = require('path')
  , httpServer = require('../../http-server')
  , daemon = require('../../daemon')
  , ip = require('ip');


module.exports = function(file){
  return through(function(buf, enc, next){
    var self = this;

    if( !file.indexOf('lib/browser/server-info.js') ){
      self.push(buf);
      return next();
    }

    var str = buf.toString('utf8');
    str = str.replace('{{gaston.ip}}', ip.address());
    str = str.replace('{{gaston.port}}', daemon.port);
    self.push(str);
    next();

  });
};
