var path = require('path');

var config = {
  input_file:  process.env.DASH_SOURCE_INPUT_FILE || path.join(process.cwd(), 'input.ts'),
  segment_dir: process.env.DASH_SEGMENT_INPUT_DIR || path.sep + path.join('tmp', 'dash_segment_input_dir'),
  output_dir:  process.env.DASH_OUTPUT_DIR        || path.sep + path.join('tmp', 'dash_output_dir'),
  mp4box:      process.env.DASH_MP4BOX            || 'MP4Box',
  ffmpeg:      process.env.DASH_FFMPEG            || 'ffmpeg',
  transcoding: {
    ffmpeg_opts: ['-re', '-i', '-', '-analyzeduration', '2147483647', '-probesize', '2147483647', '-threads', '0', '-y'],
    hls_opts: ['-hls_time', '10'],
    video_opts: ['-vcodec', 'libx264', '-vprofile', 'baseline', '-preset', 'veryfast', '-level', '31', '-keyint_min', '25', '-g', '25', '-r', '25'],
    audio_opts: ['-vn', '-acodec', 'aac', '-strict', '-2', '-ar', '48000', '-ac', '2']
  }
}

config.representations = {
  video_hd:  config.transcoding.video_opts.concat(['-vb', '3072k', '-s', '1280x720', '-an']).concat(config.transcoding.hls_opts),
  video_med: config.transcoding.video_opts.concat(['-vb', '1024k', '-s', '640x360', '-an']).concat(config.transcoding.hls_opts),
  audio:     config.transcoding.audio_opts.concat(['-ab', '128k']).concat(config.transcoding.hls_opts)
}

config.packaging = {
  mp4box_opts: ['-dash-ctx', path.join(config.output_dir, 'dash-live.txt'), '-dash', '10000', '-rap', '-no-frags-default',
                '-bs-switching', 'no', '-mpd-refresh', '10', '-min-buffer', '30000', '-url-template', '-time-shift', '1800',
                '-segment-name', 'live_$RepresentationID$_', '-out', path.join(config.output_dir, 'live'), '-dynamic']
}

config.getRepresentationKeys = function() {
  return Object.keys(config.representations);
}

module.exports = config;