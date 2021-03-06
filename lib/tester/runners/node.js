"use strict";

var log = require('npmlog')
var path = require('path')
var Mocha = require('mocha')
var sinonChai = require('sinon-chai')
var sinon = require('sinon')
var chai = require('chai')
var gastonLog = require('../../log')
var getFiles = require('../utils/get-files')

module.exports = function node (options, errors, dir) {
  log.info('gaston tester', 'running node tests from', options.source)
  prepareGlobals()

  var mocha = new Mocha({
    ui: 'bdd'
  })

  return getFiles(options.source, dir || 'node')
    .then(function (files) {
      for (let i = 0, l = files.length; i < l; i++) {
        let file = files[i]
        mocha.addFile(file)
      }
    })
    .then(function () {
      return new Promise(function (resolve, reject) {
        return mocha.run(function (code) {
          resolve(errors + code)
        })
      })
    })
}

var prepareGlobals = function () {
  global.gaston = {}
  global.gaston.log = global.log = gastonLog
  global.chai = chai
  global.expect = global.chai.expect
  global.assert = global.chai.assert
  global.should = global.chai.should()
  global.sinon = sinon
  chai.use(require('../chai/performance'))
  chai.use(require('../chai/message'))
  chai.use(sinonChai)
  global.console.clear = function () {}
  global.console.group = function () {}
  global.console.groupEnd = function () {}
  global.log.event = function () {}
}
