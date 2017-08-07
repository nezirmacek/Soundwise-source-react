'use strict';
var uploader = require('express-fileuploader');

module.exports = function(Fileupload) {
  Fileupload.upload = function (file, cb) {
    console.log('>>>>>>>>>>', file);
    uploader.upload('s3', [file], function(err, files) {
      if (err) {
        return cb(err, null);
      }
      cb(null, JSON.stringify(files));
    });
  };
  Fileupload.remoteMethod(
    'upload',
    {
      http: {path: '/upload', verb: 'post', status: 200, errorStatus: 400},
      description: ['',''],
      notes: '',
      accepts: {},
      returns: {type: 'string', root: true}
    }
  )
};
