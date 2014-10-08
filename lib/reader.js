var fs     = require('fs'),
    config = require('./config');

function pipeStream(dst) {
  var readStream = fs.createReadStream(config.inputFile);
 
  readStream.on('open', function () {
    readStream.pipe(dst, { end: false });
  });
 
  readStream.on('end', function() {
    pipeStream(dst);
  }) 
}

module.exports.pipeStream = pipeStream;
