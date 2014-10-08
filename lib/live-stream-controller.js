var reader = require('./reader'),
    watcher = require('./watcher'),
    mkdirp = require('mkdirp'),
    config = require('./config'),
    transcoder = require('./transcoder');

function launch(inputFile, configFile) {
  // TODO: actually use inputFile and configFile
  
  // Create input/output directories
  mkdirp.sync(config.segment_dir);
  mkdirp.sync(config.output_dir);

  // Initiate watcher
  watcher.watchSegmentDir();

  // Spawn transcoder
  var t = transcoder.spawn();
  
  // Pipe reader input to transcoder
  reader.pipeStream(t.stdin);
}

module.exports.launch = launch;