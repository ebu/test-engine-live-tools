var path = require('path');
var fs   = require('fs');

var loadedConfig = undefined;

var defaultConfig = {
  inputFile: undefined,
  segmentDir: path.sep + path.join('tmp', 'dash_segment_input_dir'),
  outputDir: path.sep + path.join('tmp', 'dash_output_dir'),
  mp4box: 'MP4Box',
  ffmpeg: 'ffmpeg'
}

var defaultEncoding = {
  commandPrefix: [ '-re', '-i', '-', '-threads', '0', '-y' ],
  representations: {
    audio: [
      '-map', '0:1', '-vn', '-acodec', 'aac', '-strict', '-2', '-ar', '48000', '-ac', '2',
      '-f', 'segment', '-segment_time', '4', '-segment_format', 'mpegts'
    ],
    video: [
      '-map', '0:0', '-vcodec', 'libx264', '-vprofile', 'baseline', '-preset', 'veryfast',
      '-s', '640x360', '-vb', '512k', '-bufsize', '1024k', '-maxrate', '512k',
      '-level', '31', '-keyint_min', '25', '-g', '25', '-sc_threshold', '0', '-an',
      '-bsf', 'h264_mp4toannexb', '-flags', '-global_header',
      '-f', 'segment', '-segment_time', '4', '-segment_format', 'mpegts'
    ]
  }
}

var defaultPackaging = {
  mp4box_opts: [
    '-dash-ctx', path.join(defaultConfig.outputDir, 'dash-live.txt'), '-dash', '4000', '-rap', '-ast-offset', '12',
    '-no-frags-default', '-bs-switching', 'no', '-min-buffer', '4000', '-url-template', '-time-shift', '1800',
    '-mpd-title', 'MPEG-DASH live stream', '-mpd-info-url', 'http://ebu.io/', '-segment-name',
    'live_$RepresentationID$_', '-out', path.join(defaultConfig.outputDir, 'live'),
    '-dynamic', '-subsegs-per-sidx', '-1'
  ]
}

defaultConfig.encoding = defaultEncoding;
defaultConfig.packaging = defaultPackaging;

function getRepresentationKeys() {
  return Object.keys(defaultConfig.encoding.representations);
}

function getRepresentationKeyForFile(segment) {
  var keys = getRepresentationKeys();
  var result = undefined;
  keys.forEach(function(key) {
    var file = segment.split(path.sep).pop();
    if (file.indexOf(key) == 0) {
      result = key;
    }
  })
  return result;
}

function merge(orig, custom) {
  for (key in custom) {
    orig[key] = custom[key];
  }
}

function load(inputFile, configFile) {
  if (configFile) {
    // Attempt to load config from file, exit if fails
    try {
      var data = fs.readFileSync(configFile, 'utf8');
      loadedConfig = JSON.parse(data);      
    } catch(e) {
      console.log("Error: invalid data found while trying to read config file. Please make sure it exists and contains valid JSON data.");
      process.exit(1);
    }
    merge(defaultConfig, loadedConfig);
  }
  defaultConfig.inputFile = inputFile;
}

var Config = {};
Config.load = load;
Config.getRepresentationKeyForFile = getRepresentationKeyForFile;
Object.defineProperty(Config, 'inputFile',  { get: function() { return defaultConfig.inputFile; }});
Object.defineProperty(Config, 'segmentDir', { get: function() { return defaultConfig.segmentDir; }});
Object.defineProperty(Config, 'outputDir',  { get: function() { return defaultConfig.outputDir; }});
Object.defineProperty(Config, 'ffmpeg',     { get: function() { return defaultConfig.ffmpeg; }});
Object.defineProperty(Config, 'mp4box',     { get: function() { return defaultConfig.mp4box; }});
Object.defineProperty(Config, 'encoding',   { get: function() { return defaultConfig.encoding; }});
Object.defineProperty(Config, 'packaging',  { get: function() { return defaultConfig.packaging; }});
Object.defineProperty(Config, 'representationKeys', { get: function() { return getRepresentationKeys(); }});
Object.defineProperty(Config, 'representationCount', { get: function() { return getRepresentationKeys().length; }});

module.exports = Config;