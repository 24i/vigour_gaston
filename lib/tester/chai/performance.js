/*
  performance
  expect( ... ).performance( options )

  options: {
    method: function
    time: number
    margin: number (method*margin)
  }

  options = function (defualt margin 1.05)

  options = number (time in ms)
*/
module.exports = function( chai, _ ) {

  var performance = require('../../performance')
  var isNode = typeof window === void 0

  var Assertion = chai.Assertion
  Assertion.addMethod('performance', function( params, done ) {
    var fn = this._obj;
    var assertion = this
    var compare

    new Assertion(fn).to.be.a.function

    if( typeof params === 'function' ) {
      var condition = {
        method: params
      }
      compare = performance( condition )
    }
    else if( typeof params !== 'object' ) {
      params = { time: params }
    } else if( params.method ) {
      var condition = {
      method: params.method,
        loop: params.loop
      }
      compare = performance( condition )
    }

    function complete( single, avtime ) {

      perfAssert(
        typeof single === 'object'
          ? single[0]*1000
          : single*1000,
        'time',
        assertion,
        params,
        done
      )
      // perfAssert(
      //   avtime*1000,
      //   'average',
      //   assertion,
      //   params,
      //   done,
      //   'average execution time over n='+params.loop
      //  )
    }

    if( compare ) {
      return compare.then(function( single ) {
        params = {
          loop:  params.loop || fn.loop,
          margin: params.margin || 1.05
        }
        var isObj = typeof fn !== 'function'
        params.complete = void 0
        params.method = isObj ? fn.method : fn
        params.time = 1000 * (
          typeof single === 'object'
            ? single[0]
            : single
        )
        //take 10% margin
        performance( params ).done( complete )
      })
    } else {
      if( typeof fn !== 'function' ) {
        params.method = fn.method
        params.loop = fn.loop
      } else {
        params.method = fn
      }
      return performance( params ).done( complete )
    }

  })

  function perfAssert( measure, field, assertion, params, done, msg, unit, round  ) {
    var field = params[field]
    var margin = params.margin || 1

    if( field ) {
      round = Math.pow( 10, (round || 2) )
      measure = measure
      measure = Math.round(measure*round)/round
      unit = unit || 'ms'

      if( !isNode ) {
        console.group()
      }

      console.log(
        '%cgaston performance test:',
        'color: black; padding:3px; font-weight:bold;'
      )

      console.log(
        '%c'
        + ( assertion.__flags.message
          ? ( '"' + assertion.__flags.message + '"' )
          : assertion._obj.toString()
          ),
        'color: grey; width:100px; display:block; height:auto;'
      )

      console.log(
        '%c' +  measure + ' ' + unit + ' | '
             + ((100-Math.round((measure/(field))*-round))-100) + '%',
        measure > field*margin
          ? 'color: red; padding:3px; font-weight:bold;'
          : 'color: green; padding:3px; font-weight:bold;'
      )

      console.log(
        '%c' + Math.round((field)*round)/round + ' '+ unit
         + ( params.margin
           ? ' | margin: '+ params.margin +' | limit: '
             + Math.round((field*margin)*round)/round  + ' ' + unit
           : ''
           )
        + ' | n= ' + params.loop || 1,
        'color: grey; padding:3px; font-weight:bold;'
      )

      if( !isNode ) {
        console.groupEnd()
      }

      if( measure > field*margin ) {
        assertion.assert(
          measure < field*margin,
          ( msg ? msg( params ) : 'execution time' )
           + ' [ +' +  Math.round((measure-field)*round)/round + ' ' + unit +' ]'
          + '[ +' + Math.round( (measure/(field))*round-100 ) + '% ]'
          + '\nexecuted in: '+ measure + ' ' + unit
        )
      }
      if( done ) {
        done()
      }
    }
  }

}
