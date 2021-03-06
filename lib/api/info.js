module.exports = function info () {
  var client = this
  return client.connectedPromise || client.connect()
    .then(function () {
      return new Promise(function (resolve, reject) {
        client.socket.on('info-complete', resolve)
        client.socket.on('errored', reject)

        client.socket.emit('info')
      })
    })
}
