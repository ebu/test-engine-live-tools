#!/usr/bin/env bash

cd $DASH_SEGMENT_INPUT_DIR

HLS_OPTS='-hls_time 10'
VIDEO_PRESET_OPTS='-vcodec libx264 -vprofile baseline -preset veryfast -level 31 -keyint_min 25 -g 25 -r 25'
AUDIO_PRESET_OPTS='-vn -acodec libfaac -ar 48000 -ac 1'

rm -f *.m3u8
rm -f *.ts

$DASH_NODE $DASH_SCRIPTS_PREFIX/carousel/reader.js | \
  $DASH_FFMPEG -re -i - -analyzeduration 2147483647 -probesize 2147483647 -threads 0 -y \
    $VIDEO_PRESET_OPTS -vb 3072k -s 1280x720 -an $HLS_OPTS out_hd_.m3u8 \
    $VIDEO_PRESET_OPTS -vb 1024k -s 640x360 -an $HLS_OPTS out_med_.m3u8 \
    $AUDIO_PRESET_OPTS -ab 128k $HLS_OPTS out_audio_.m3u8
