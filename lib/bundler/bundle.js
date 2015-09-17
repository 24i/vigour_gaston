var path = require('path')
  , _ = require('lodash')
  , browserify = require('browserify')
  , watchify = require('watchify')
  , Blessify = require('gaston-blessify')
  , Smapify = require('gaston-smapify')
  , setAlias = require('./util/set-alias')

var bundle = module.exports = function bundle(){
  var self = this;
  var options = self.options;

  if(self.watchify){
    return new Promise(function(resolve, reject){
      var onComplete = onBundleComplete(self.blessify, resolve, reject, self);
      var bundle = self.watchify.bundle( onComplete );
      bundle.on( 'data', self.smapify.buildMap );
    });
  }
  self.smapify = new Smapify(self.options);

  return new Promise(function(resolve, reject){    

    var bOptions = {
      debug: options.sourceMaps,
      cache: {},
      packageCache: {},
      fullPaths: true,
      noParse: []
    };
    
    var b;
    if(options.gaston){
      var gastonPath = path.join(__dirname, '..', 'browser', 'index.js');
      b = browserify( gastonPath, bOptions );
      b.require( options.source, { expose: 'index.js' } );
      var testerPath = path.join(__dirname, '..', 'tester', 'browser.js');
      var dummyPath = path.join(__dirname, 'dummys/tester.js');
      if(options.testing){
        b.require( testerPath, { expose: 'gaston-tester' } );
      } else { 
        b.require( dummyPath, { expose: 'gaston-tester' } );
      }

      b.transform( require('./transforms/gaston-browser') );
    } else {
      b = browserify( options.source, bOptions );
    }

    setAlias(b);

    var blessify = self.blessify = new Blessify(options);
    b.transform( blessify.transform, { global: true } );
    b.transform( require('./transforms/ignores') );

    var pkgPath = options.package || path.join(__dirname, 'dummys', 'package.json');
    b.require( pkgPath , { expose: 'package.json' } );

    self.watchify = watchify(b);

    var bundle;
    var onComplete = onBundleComplete(blessify, resolve, reject, self);
    bundle = self.watchify.bundle( onComplete );
    bundle.on( 'data', self.smapify.buildMap );
  });
};

var onBundleComplete = function(blessify, resolve, reject, bundler){
  return function onBundleComplete(err, buf){
    if(err){
      bundler.watchify = null;
      return reject(err);
    }

    var jsCode = buf.toString();

    blessify.render()
      .then(function(output){
        resolve({
          js: jsCode,
          css: output.css,
          smaps: bundler.smapify.map,
          files: bundler.smapify.files
        });

        bundler.smapify.clear();
      })
      .catch(function(err){
        bundler.watchify = null;
        reject({
          originalCode: blessify.originalCode,
          lessCode: blessify.lessCode,
          error: err
        });
        blessify.clear();
      });
  };
};