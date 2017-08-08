'use strict';

var loopback = require('loopback');
var boot = require('loopback-boot');
var mutilpart = require('connect-multiparty');
var uploader = require('express-fileuploader');
var S3Strategy = require('express-fileuploader-s3');
var { awsConfig } = require('../config');

var app = module.exports = loopback();

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

app.use('/api/fileUploads/upload', mutilpart());
// app.use('/upload/images', mutilpart()); // WORKS

uploader.use(new S3Strategy({
  uploadPath: '/test_files',
  headers: {
    'x-amz-acl': 'public-read'
  },
  options: {
    key: awsConfig.accessKeyId,
    secret: awsConfig.secretAccessKey,
    bucket: 'soundwiseinc'
  }
}));

// WORKS
// app.post('/upload/images', function(req, res, next) {
//   console.log('>>>>>>>>>>REQ BODY', req.body);
//   console.log('>>>>>>>>>>REQ FILES', req.files);
//   uploader.upload('s3', req.files.file, function(err, files) {
//     if (err) {
//       return next(err);
//     }
//     res.send(JSON.stringify(files));
//   });
// });

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});
