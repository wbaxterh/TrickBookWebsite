# Synthetic feed video

Small generated test-pattern clip, no rider media or signed URLs.

Regenerate from the repo root with FFmpeg:

```sh
ffmpeg -f lavfi -i testsrc2=size=160x90:rate=10 -t 12 -c:v libx264 -profile:v baseline -pix_fmt yuv420p -g 20 -an -hls_time 4 -hls_playlist_type vod -hls_segment_filename tests/fixtures/feed-video/segment-%d.mpegts tests/fixtures/feed-video/index.m3u8
ffmpeg -i tests/fixtures/feed-video/index.m3u8 -c copy -movflags +faststart tests/fixtures/feed-video/clip.mp4
```

Browser tests serve this fixture over a local HTTP server. All production API/session/socket calls are intercepted; stream IDs identify synthetic feed items only.
