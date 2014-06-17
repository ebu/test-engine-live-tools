var path = require('path');

var config = {
  input_file:  process.env.DASH_SOURCE_INPUT_FILE || path.join(process.cwd(), 'input.ts'),
  segment_dir: process.env.DASH_SEGMENT_INPUT_DIR || path.sep + path.join('tmp', 'dash_segment_input_dir'),
  output_dir:  process.env.DASH_OUTPUT_DIR        || path.sep + path.join('tmp', 'dash_output_dir'),
  mp4box:      process.env.DASH_MP4BOX            || 'MP4Box',
  ffmpeg:      process.env.DASH_FFMPEG            || 'ffmpeg' 
}

module.exports = config;