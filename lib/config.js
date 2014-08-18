var path = require('path');

var config = {
  input_file:  process.env.DASH_SOURCE_INPUT_FILE || path.join(process.cwd(), 'input.ts'),
  segment_dir: process.env.DASH_SEGMENT_INPUT_DIR || path.sep + path.join('tmp', 'dash_segment_input_dir'),
  output_dir:  process.env.DASH_OUTPUT_DIR        || path.sep + path.join('tmp', 'dash_output_dir'),
  mp4box:      process.env.DASH_MP4BOX            || 'MP4Box',
  ffmpeg:      process.env.DASH_FFMPEG            || 'ffmpeg',
  transcoding: {
    ffmpeg_opts: ['-re', '-i', '-', '-y'],
    hls_opts: ['-f', 'segment', '-segment_format', 'mpegts', '-segment_time', '4'],
    //hls_opts: ['-hls_time', '4', '-hls_list_size', '15'],
    video_opts: ['-an', '-r', '25', '-vcodec', 'ihevc', '-pix_fmt', 'yuv420p', '-iv_rate_control_mode', '5', '-iv_codec_profile', '1', '-threads', '12', '-iv_quality_preset', '5', '-iv_idr_period', '50', '-iv_cdr_period', '0', '-iv_max_temporal_layers', '0', '-iv_look_ahead_frames', '0', '-map', '0:0'],
    audio_opts: ['-vn', '-acodec', 'aac', '-strict', '-2', '-ar', '48000', '-ac', '2', '-map', '0:1']
  }
}

config.representations = {
  audio: config.transcoding.audio_opts.concat(['-ab', '192k']).concat(config.transcoding.hls_opts),
  video_hd: config.transcoding.video_opts.concat(['-b:v', '2500k']).concat(config.transcoding.hls_opts)
}

config.packaging = {
  mp4box_opts: ['-dash-ctx', path.join(config.output_dir, 'dash-live.txt'), '-dash', '4000', '-rap', '-ast-offset', '12', '-no-frags-default',
                '-bs-switching', 'no', '-mpd-refresh', '120', '-min-buffer', '4000', '-url-template', '-time-shift', '3600',
                '-mpd-title', 'EBU test live stream for MPEG-DASH IBC demo, created by Hiro (http://madebyhiro.com/en/).', '-mpd-info-url', 'http://ebu.io/',
                '-segment-name', 'live_$RepresentationID$_', '-out', path.join(config.output_dir, 'live'), '-dynamic']
}

config.getRepresentationKeys = function() {
  return Object.keys(config.representations);
}

config.extractRepresentationKey = function(segment) {
  var keys = config.getRepresentationKeys();
  var result = undefined;
  keys.forEach(function(key) {
    var file = segment.split(path.sep).pop();
    if (file.indexOf(key) == 0) {
      result = key;
    }
  })
  return result;
}

module.exports = config;
