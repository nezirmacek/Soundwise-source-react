'use strict';
var uploader = require('express-fileuploader');

module.exports = function(Fileupload) {
  Fileupload.upload = function (req, res, cb) {
    console.log('>>>>>>>>>>', req.files.file);
    uploader.upload('s3', req.files.file, function(err, files) {
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
      description: [
        'uploads file to aws s3',
        'send blob file from input'
      ],
      notes: '',
      // accepts: {arg: 'file', type: 'file', http: {source: 'body'}, required: true, root: true},
      accepts: [
        {arg: 'req', type: 'object', http: {source: 'req'}},
        {arg: 'res', type: 'object', http: {source: 'res'}},
      ],
      returns: {arg: 'status', type: 'string'}
    }
  )
};
