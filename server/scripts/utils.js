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

const logErr = (msg, res, resolve) {
	console.log(`Error: feed.js ${msg}`);
	res && res.error(`Error: feed.js ${msg}`);
	resolve && resolve();
}

module.export = { uploader, logErr };
