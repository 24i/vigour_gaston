var fs = require('fs')
	,	path = require('path')
	, log = require('npmlog')

//work in progress!!
//
	, callbackFn
	, readyCount

function createHTML ( templateName ) {
	var template = templateName || 'default.html'
		,	folder = 'templates'
		, dir = __dirname
		, templateFile = path.join(dir, folder, template)
		,	htmlTemplate = fs.readFileSync(templateFile,'utf8')

	fs.readFile(templateFile, function(err, data){
		if (err) log.error('html read', err)
	  fs.writeFile('index.html', data, function(err){
	      if (err) log.error('html write', err)
	      log.info('created file','index.html')
	    	if( callbackFn && !readyCount ) callbackFn()
	  })
	})
}

function createJS () {
  fs.writeFile('index.js', '', function(err){
      if (err) log.error('js write', err)
      log.info('created file','index.js')
    	if( callbackFn && !readyCount ) callbackFn()
  })
}

module.exports = function ( rootFolder, callback ) {
	var files = fs.readdirSync(rootFolder || './')
		, file
		, haveIndexHTML
		, haveIndexJS
		, i = files.length
		, callbackFn = callback
		, readyCount = 2;
	while (i--) {
		file = files[i]
		if ( path.extname(file) === '.html' ){
			log.info('found html file!',file)
		}
		if ( path.basename(file) === 'index.html' ){
			log.info('found index.html file!',file)
			haveIndexHTML = readyCount -= 1
		}		
		if ( path.extname(file) === '.js' ){
			log.info('found js file!',file)
		}
		if ( path.basename(file) === 'index.js' ){
			log.info('found index.js file!',file)
			haveIndexJS = readyCount -= 1
		}
	}
	console.log('readycount',readyCount)

	if( !haveIndexHTML ) createHTML() 
	if( !haveIndexJS ) createJS()
	if( callbackFn && !readyCount ) callbackFn()
}