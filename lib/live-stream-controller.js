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

  if (inputFile.match(/^.+\:\/\//)) {
    // Protocol specified
    console.log('Protocol found for input file: ' + inputFile + '. Passing directly to ffmpeg.');
    transcoder.spawn(inputFile);
  } else {
    // Spawn transcoder using default operation (pipes)
    var t = transcoder.spawn();
    // Pipe reader input to transcoder
    reader.pipeStream(t.stdin);    
  }
}

module.exports.launch = launch;