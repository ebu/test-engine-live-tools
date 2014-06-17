var reader = require('./reader'),
    watcher = require('./watcher'),
    mkdirp = require('mkdirp'),
    config = require('./config');

mkdirp.sync(config.segment_dir);
mkdirp.sync(config.output_dir);

watcher.watchSegmentDir();

//reader.pipeStream(process.stdout);