var config     = require('./config'),
    mkdirp     = require('mkdirp'),
    watcher    = require('./watcher'),
    transcoder = require('./transcoder'),
    reader     = require('./reader');

function launch(inputFile, configFile) {
  config.load(inputFile, configFile);

  // Create input/output directories
  mkdirp.sync(config.segmentDir);
  mkdirp.sync(config.outputDir);

  // Initiate watcher
  watcher.watchSegmentDir();

  // Spawn transcoder
  var t = transcoder.spawn();
  
  // Pipe reader input to transcoder
  reader.pipeStream(t.stdin);
}

module.exports.launch = launch;