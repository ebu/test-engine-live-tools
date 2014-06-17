var reader = require('./reader'),
    watcher = require('./watcher'),
    mkdirp = require('mkdirp'),
    config = require('./config'),
    transcoder = require('./transcoder');

mkdirp.sync(config.segment_dir);
mkdirp.sync(config.output_dir);

watcher.watchSegmentDir();

var transcoder = transcoder.spawn();
reader.pipeStream(transcoder.stdin);