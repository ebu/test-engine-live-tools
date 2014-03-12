#!/usr/bin/env bash

cd $DASH_SEGMENT_INPUT_DIR

HLS_OPTS='-hls_time 10 -hls_list_size 30'
VIDEO_PRESET_OPTS='-vcodec libx264 -vprofile baseline -preset veryfast -level 31 -keyint_min 24 -g 24 -r 24'
AUDIO_PRESET_OPTS='-vn -acodec aac -strict -2 -ar 48000 -ac 2'

rm -f *.m3u8
rm -f *.ts

$DASH_VLC -I dummy -L $DASH_SOURCE_INPUT_FILE \
  --sout "#transcode{vcodec=h264,scale=1,venc=x264{repeat-headers=1},acodec=aac,ab=256,channels=2}:standard{mux=ts,access=file,dst=-}" | \
  ffmpeg -re -f mpegts -i - -analyzeduration 2147483647 -probesize 2147483647 -threads 0 -y \
    $VIDEO_PRESET_OPTS -vb 2048k -s 800x450 -an $HLS_OPTS out_hi_.m3u8 \
    $VIDEO_PRESET_OPTS -vb 1024k -s 640x360 -an $HLS_OPTS out_med_.m3u8 \
    $VIDEO_PRESET_OPTS -vb 512k  -s 320x180 -an $HLS_OPTS out_medlo_.m3u8 \
    $AUDIO_PRESET_OPTS -ab 128k $HLS_OPTS out_audio_.m3u8