module.exports = function build (options) {
  var client = this
  return client.connectedPromise || client.connect()
    .then(function () {
      return new Promise(function (resolve, reject) {
        client.socket.on('build-complete', resolve)
        client.socket.on('build-error', reject)

        client.socket.emit('build', options)
      })
    })
}
