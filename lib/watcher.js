var fs = require('fs'),
    config = require('./config');

function watchSegmentDir() {
  var watcher = fs.watch(config.segment_dir);

  watcher.on('change', function(event, filename) {
    console.log("Got event " + event + " for file " + filename);  
  })

  watcher.on('error', function(err) {
    console.log("Got error " + err);
  })  
}

module.exports.watchSegmentDir = watchSegmentDir;