'use strict';
const uploader = require('express-fileuploader');

// Fix to prevent setting uid in filename
// https://github.com/heroicyang/express-fileuploader/blob/master/lib/index.js#L78-L118
uploader.upload = function(strategy, files, callback) {
  var name = strategy;
  strategy = this._strategies[name];
  if (!strategy) {
    return callback(new Error('no upload strategy: ' + name));
  }
  if (!util.isArray(files)) {
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

const setAudioTags = (file, imgPath, title, track, artist) = {
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

const logErr = prefix =>(msg, res, resolve) => {
	console.log(`Error: ${prefix} ${msg}`);
	res && res.error(`Error: ${prefix} ${msg}`);
	resolve && resolve();
}

module.exports = prefix => ({
	uploader,
	setAudioTags,
	logErr: logErr(prefix) // set prefix
});
