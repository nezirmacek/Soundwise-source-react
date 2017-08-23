'use strict';

// require('dotenv').config();
var express = require('express');
var loopback = require('loopback');
var boot = require('loopback-boot');
var mutilpart = require('connect-multiparty');
var uploader = require('express-fileuploader');
var S3Strategy = require('express-fileuploader-s3');
var awsConfig = require('../config').awsConfig;
var bodyParser = require('body-parser');
var path = require('path');

var handlePayment = require('./scripts/payment.js').handlePayment;
var handleEmailSignup = require('./scripts/emailSignup.js').handleEmailSignup;
var handleReferral = require('./scripts/emailSignup.js').handleReferral;
var handleTrialRequest = require('./scripts/emailSignup.js').handleTrialRequest;
var sendListenerInvites = require('./scripts/sendEmailInvites.js').sendListenerInvites;

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

app.use(bodyParser.json());
app.use(require('prerender-node').set('prerenderToken', 'XJx822Y4hyTUV1mn6z9k').set('protocol', 'https'))
app.use('/api/fileUploads/upload', mutilpart());
// app.use('/upload/images', mutilpart()); // WORKS

uploader.use(new S3Strategy({
  uploadPath: 'demo/',
  headers: {
    'x-amz-acl': 'public-read'
  },
  options: {
    key: awsConfig.accessKeyId,
    secret: awsConfig.secretAccessKey,
    bucket: 'soundwiseinc'
  }
}));

// use part
app.post('/api/charge', handlePayment);
app.post('/api/email_signup', handleEmailSignup);
app.post('/api/referral', handleReferral);
app.post('/api/trial_request', handleTrialRequest);
app.post('/api/send_email_invites', sendListenerInvites);

// // WORKS
// app.post('/upload/images', function(req, res, next) {
//   uploader.upload('s3', req.files.file, function(err, files) {
//     if (err) {
//       return next(err);
//     }
//     res.send(JSON.stringify(files));
//   });
// });

// the last use case - receive frontent files
app.use(express.static('./client'));
app.get('*', function (request, response){
  response.sendFile(path.resolve('./client/index.html'))
});

// var prerendercloud = require('prerendercloud')
//************* prerender.cloud *****************
// prerendercloud.set('prerenderToken', 'dXMtd2VzdC0yOjE2MDE0OTIyLTk5MTgtNGY1Yi1hOTQwLTY1MDI2MzYyYTRlNQ.dE2HiZLJmqwNG0aJsAcWqmZHt_iAsV2tcIQQbvs2zPI')
// prerendercloud.set('enableMiddlewareCache', true)
// prerendercloud.set('middlewareCacheMaxAge', 1000 * 60 * 3) // 3 minutes
// app.use(prerendercloud)
//****************************

// app.listen((process.env.PORT || 8080), function() {
//   console.log('listening on port: ', process.env.PORT || 8080)
// })

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});

