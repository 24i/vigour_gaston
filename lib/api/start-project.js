module.exports = function (projectPath) {
  var client = this
  return new Promise(function (resolve, reject) {
    client.socket.on('start-project', function (project) {
      resolve(project)
    })

    client.socket.emit('start-project', projectPath)
  })
}
