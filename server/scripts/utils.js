'use strict';
const uploader = require('express-fileuploader');

// Fix to prevent setting uid as a filename
// https://github.com/heroicyang/express-fileuploader/blob/master/lib/index.js#L78-L118
uploader.upload = function(strategy, files, callback) {
  var name = strategy;
  strategy = this._strategies[name];
  if (!strategy) {
    return callback(new Error('no upload strategy: ' + name));
  }
  if (!Array.isArray(files)) {
    files = [files];
  }
  var fileCount = files.length;
  files.forEach(function(file) {
    // removing uid setting
    strategy.upload(file, function(err, fileUploaded) {
      if (err) {
        file.error = err;
      }
      if (fileUploaded) {
        Object.keys(fileUploaded)
          .forEach(function(key) {
            if (!file[key]) {
              file[key] = fileUploaded[key];
            }
          });
      }
      fs.unlink(file.path, function(err) {
        /* jshint unused:false */
        fileCount -= 1;
        if (fileCount === 0) {
          callback(null, files);
        }
      });
    });
  });
};

const setAudioTags = (file, imgPath, title, track, artist) => {
	// from https://stackoverflow.com/questions/18710992/how-to-add-album-art-with-ffmpeg
	// ffmpeg -i in.mp3 -i test.jpeg -map 0:0 -map 1:0 -c copy -id3v2_version 3 -metadata:s:v title="Album cover" -metadata:s:v comment="Cover (front)" out.mp3
	file.addCommand('-i', imgPath);
	file.addCommand('-map', '0:0');
	file.addCommand('-map', '1:0');
	file.addCommand('-codec', 'copy');
	file.addCommand('-id3v2_version', '3');
	file.addCommand('-metadata:s:v', `title="Album cover"`);
	file.addCommand('-metadata:s:v', `comment="Cover (front)"`);
	const titleEscaped = title.replace(/"/g, "'\\\\\\\\\\\\\"'").replace(/%/g, "\\\\\\\\\\\\%").replace(":", "\\\\\\\\\\\\:");
	const artistEscaped = artist.replace(/"/g, "\\\\\\\\\\\\\"").replace(/%/g, "\\\\\\\\\\\\%").replace(":", "\\\\\\\\\\\\:");
	file.addCommand('-metadata', `title="${titleEscaped}"`);
	file.addCommand('-metadata', `track="${track}"`);
	file.addCommand('-metadata', `artist="${artistEscaped}"`);
	file.addCommand('-metadata', `album="${title}"`);
	file.addCommand('-metadata', `year="${new Date().getFullYear()}"`);
	file.addCommand('-metadata', `genre="Podcast"`);
}

/* parseSilenceDetect
	example input: (String)
		...
		Metadata:
			encoder         : Lavc57.107.100 pcm_s16le
		Side data:
			replaygain: track gain - -4.500000, track peak - unknown, album gain - unknown, album peak - unknown, 
		size=N/A time=00:02:48.51 bitrate=N/A speed= 337x    
		[silencedetect @ 0x55e8040] silence_start: 335.262
		[silencedetect @ 0x55e8040] silence_end: 336.249 | silence_duration: 0.987347
		size=N/A time=00:05:37.00 bitrate=N/A speed= 337x    
		[silencedetect @ 0x55e8040] silence_start: 459.03
		[silencedetect @ 0x55e8040] silence_end: 460.148 | silence_duration: 1.11796
		size=N/A time=00:08:16.09 bitrate=N/A speed= 337x    
		video:0kB audio:85460kB subtitle:0kB other streams:0kB global headers:0kB muxing overhead: unknown

  example output: (Array)
	  [ ["silence_start"   , "-0.0150208"],
		  ["silence_end"     , "5.08898"   ],
		  ["silence_duration", "5.104"     ],
		  ["silence_start"   , "10.041"    ],
		  ["silence_end"     , "15.553"    ],
		  ["silence_duration", "5.512"     ],
		  ["silence_start"   , "17.481"    ] ]
*/
const parseSilenceDetect = s => s.replace(/\[silencedetect/g, '\n[silencedetect')
		.split('\n').filter(i => i.slice(0, 14) === '[silencedetect')
		.map(i => i.split('] ')[1]).join(' | ').split(' | ').map(i => i.split(': ')); // *

const logErr = prefix => (msg, res, resolve) => {
	console.log(`Error: ${prefix} ${msg}`);
	res && res.error(`Error: ${prefix} ${msg}`);
	resolve && resolve();
}

module.exports = prefix => ({
	uploader, setAudioTags, parseSilenceDetect,
	logErr: logErr(prefix) // set prefix
});
