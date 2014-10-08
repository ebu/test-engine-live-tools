var reader = require('./reader'),
    watcher = require('./watcher'),
    mkdirp = require('mkdirp'),
    transcoder = require('./transcoder');

function launch(inputFile, configFile) {
  // TODO: don't use process.env for this
  process.env.DASH_SOURCE_INPUT_FILE = inputFile;
  console.dir(process.env);
  var config = require('./config');
  
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