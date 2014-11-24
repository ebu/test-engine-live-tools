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
  
  readStream.on('error', function() {
    console.log("Unable to open input file for reading.");
    process.exit(1);
  })
}

module.exports.pipeStream = pipeStream;
