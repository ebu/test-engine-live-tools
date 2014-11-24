var config        = require('./config'),
    child_process = require('child_process'),
    path          = require('path');

function spawn(directInput) {
  return child_process.spawn(config.ffmpeg, buildOpts(directInput), { stdio: ['pipe', process.stdout, process.stderr] });    
}

function buildOpts(directInput) {
  var opts = config.encoding.commandPrefix;
  if (directInput) {
    var idx = opts.indexOf('-');
    if (idx != -1) opts[idx] = directInput;
  }
  config.representationKeys.forEach(function(key) {
    opts = opts.concat(config.encoding.representations[key]).concat(path.join(config.segmentDir, key + "_%d.ts"));
  });
  return opts;
}

module.exports.spawn = spawn;