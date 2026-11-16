/* AIOS install guide: the two things you may need to change by hand. Nothing else lives here.

   1. installTime: left empty on purpose (Maxx, 2026-11-14): installs take 5 minutes to 2 hours
      depending on the person, so the guide makes no time or difficulty claim. Leave it empty.

   2. video: the walkthrough video. While `src` is empty, the guide shows nothing about video at all.
      To switch it on, fill in `src` with ONE of these:
        - a Loom link,     e.g.  'https://www.loom.com/share/0123456789abcdef0123456789abcdef'
                           (the share link is fine; the guide turns it into Loom's player by itself)
        - a YouTube link,  e.g.  'https://www.youtube.com/watch?v=XXXXXXXXXXX'
        - a Vimeo link,    e.g.  'https://vimeo.com/123456789'
        - a video file kept next to this guide, e.g.  'video/aios-install.mp4'

      `steps` says where each step starts in the video ('m:ss' or a number of seconds). A step with no
      time gets no "Watch this step" button. Step names: p1s1 = Part 1, step 1; p1c = the "Last check"
      screen at the end of Part 1. Part 1 has 9 steps, Part 2 has 7, Part 3 has 8, Part 4 has 7.
      "Watch this step" works the same way for Loom, YouTube, Vimeo and a file.

   HOW TO DROP IN YOUR RECORDING (plain words)

   Which way to go:
     - Loom is the easy way: paste the share link into `src`, fill in `steps`, done. Loom's own help
       pages (checked 2026-11-14) say its desktop app records up to 4K at about 30 frames a second,
       and an uploaded file can be up to 4096 x 2160 and up to 60 frames a second. So a 4K60 recording
       made in another app can be uploaded to Loom; 120 frames a second cannot. Loom picks the
       playback quality for each viewer's connection.
     - A file next to the guide is the way to keep full 4K at 60 or 120 frames a second exactly as
       recorded. The catch is size: a long 4K recording is several gigabytes, so this suits a guide
       hosted on a web server, not one sent around as a zip.

   If you use a file:
     a. Make a folder called  video  inside this guide's folder (next to index.html).
     b. Put the main copy there as an H.264 .mp4 (plays in every browser). If your recording is
        HEVC (H.265) or anything else, make the H.264 copy with:
          ffmpeg -i recording.mov -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart video/aios-install.mp4
        (-movflags +faststart lets the video start, and jump to a step, before it has fully downloaded.)
     c. Optional, smaller files at the same quality. Browsers that can play them use them first;
        the rest fall back to the H.264 copy:
          AV1 in WebM:  ffmpeg -i recording.mov -c:v libaom-av1 -cpu-used 4 -row-mt 1 -crf 30 -b:v 0 -pix_fmt yuv420p -c:a libopus -b:a 128k video/aios-install.webm
                        (slow on a laptop: hours for a long 4K file. Skip it if you're short on time.)
          HEVC .mp4:    ffmpeg -i recording.mov -c:v libx265 -preset slow -crf 20 -tag:v hvc1 -c:a aac -b:a 160k -movflags +faststart video/aios-install-hevc.mp4
        Put their names in `av1` and `hevc`. Leave either one empty if you don't make it.
     d. Optional poster: a still picture shown before the video plays, e.g. one frame grabbed with
          ffmpeg -ss 5 -i video/aios-install.mp4 -frames:v 1 -q:v 3 img/video-poster.jpg
     e. `width` and `height`: the recording's size (3840 and 2160 for 4K). They set the shape of the
        video's box before it loads, so nothing on the page moves. Leave them as they are for 16:9.
     f. Fill in `src` (e.g. 'video/aios-install.mp4') and `steps`, then open the guide with the
        "Open AIOS Guide" launcher. It uses a small server that can jump into the middle of a big
        file; a plain file server may have to download the whole video before a step jump lands.
*/

window.AIOS_CONFIG = {
  installTime: '',

  /* 3. meetingOsGuide: where the "Open the Meeting OS guide" button on the Done screen goes (added 2026-11-14).
        Kareem: replace with the hosted address of the Meeting OS guide. Leave it empty to hide the button.
        The relative path below works when both guides sit side by side as in this workspace
        (Chirag Shah/AIOS Guide/proposed and Chirag Shah/Meeting OS/guide). */
  meetingOsGuide: '../../Meeting%20OS/guide/index.html',

  video: {
    src: '',          // Loom, YouTube or Vimeo link, or the main video file (H.264 .mp4)
    av1: '',          // optional, file only: the same video as AV1 in WebM, e.g. 'video/aios-install.webm'
    hevc: '',         // optional, file only: the same video as HEVC (H.265) .mp4, e.g. 'video/aios-install-hevc.mp4'
    poster: '',       // optional, file only: a still picture shown before the video plays, e.g. 'img/video-poster.jpg'
    width: 3840,      // the video's shape (4K = 3840 x 2160; any 16:9 size gives the same shape)
    height: 2160,
    length: '',       // optional: shown beside the title, e.g. '38 minutes'
    steps: {
      // p1s1: '0:20',
      // p1s2: '0:41',
      // p1c:  '4:05',
    }
  }
};
