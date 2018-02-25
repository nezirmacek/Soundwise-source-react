// fade in a clip for 5 seconds
// ffmpeg -i outro.mp3 -af 'afade=t=in:ss=0:d=5' outro-fadein.mp3

// fade out a intro for the last 5 seconds of the intro clip with clip duration == 885
// ffmpeg -i intro.mp3 -af 'afade=t=out:st=885:d=5' intro-fadeout.mp3

// concat intro, main audio, and outro together (it looks like concat demuxer is the one we should use. I tried it on a few files. Sometimes it doesn't work for some reason.): https://trac.ffmpeg.org/wiki/Concatenate

// if overlay is specified, need to first take a segment of the intro/outro and mix it together with the beginning/end part of the main audio (https://stackoverflow.com/questions/14498539/how-to-overlay-two-audio-files-using-ffmpeg), and then concat all the pieces
// for example, to add intro.mp3 to audio.mp3 with introOverlay == 5 seconds, we can do the following:
// 1) add fade out effect to intro, fadeout starts at (duration - 5) seconds:
//    ffmpeg -i intro.mp3 -af 'afade=t=out:st=15.87:d=5' intro-fadeout.mp3
// 2) get the last 5 seconds of intro
//    ffmpeg -sseof -5 -i intro-fadeout.mp3 -acodec copy intro-ending.mp3
// 3) get the first 5 seconds of audio.mp3
//    ffmpeg -t 5 -i audio.mp3 -acodec copy audio-beginning.mp3
// 4) overlay intro-ending.mp3 with audio-beginning.mp3
//    ffmpeg -i intro-ending.mp3 -i audio-beginning.mp3 -filter_complex amerge -ac 2 -c:a libmp3lame -q:a 4 overlay.mp3
// 5) get the first (duration - 5) seconds of intro-fadeout.mp3 (use ffprobe to get the duration)
//    ffmpeg -ss 15.87 -i intro-fadeout.mp3 -acodec copy intro-rest.mp3
// 6) get the remaining of audio.mp3 except the first 5 seconds
//    ffmpeg -sseof -1170.88 -i audio.mp3 -acodec copy audio-rest.mp3
// 7) concat intro-rest, overlay, audio-rest
//    cat concatlist.txt
   // file intro-rest.mp3
   // file overlay.mp3
   // file audio-rest.mp3

//    ffmpeg -f concat -safe 0 -i concatlist.txt -c copy output.mp3

// set Integrated loudness to -14: I=-14
// set True peak value to -3: TP=-2
// set Loudness range to 11: LRA=11
// ffmpeg -i 1519407477048e.mp3 -af loudnorm=I=-14:TP=-2:LRA=11:measured_I=-19.5:measured_LRA=5.7:measured_TP=-0.1:measured_thresh=-30.20::linear=true:print_format=summary -ar 44.1k 1519407477048e-normalized.mp3


// trim silence at beginning and set output bitrate to 64kbps
// ffmpeg -i ep-19.mp3  -af silenceremove=1:0:0.02 -codec:a libmp3lame -b:a 64k ep19-trim.mp3

// trim any silence longer than 0.7 second and set output bitrate to 64kbps (this command works, but for some reason it reduces the audio quality )
// ffmpeg -i ep-21.mp3  -af silenceremove=0:0:0:-1:0.7:-35dB -b:a 64k ep21-shorten.mp3
