var fs = require('fs');
 
function processStream() {
  var readStream = fs.createReadStream(process.env.DASH_SOURCE_INPUT_FILE);
 
  readStream.on('open', function () {
    readStream.pipe(process.stdout, { end: false });
  });
 
  readStream.on('end', function() {
    processStream();
  }) 
}

processStream();
