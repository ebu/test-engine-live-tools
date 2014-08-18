var config        = require('./config'),
    child_process = require('child_process'),
    path          = require('path');

function spawn() {
  return child_process.spawn(config.ffmpeg, buildOpts(), { stdio: ['pipe', process.stdout, process.stderr] });
}

function buildOpts() {
  var opts = config.transcoding.ffmpeg_opts;
  config.getRepresentationKeys().forEach(function(key) {
    opts = opts.concat(config.representations[key]).concat(path.join(config.segment_dir, key + "_%d.ts"));
  });
  return opts;
}

module.exports.spawn = spawn;
