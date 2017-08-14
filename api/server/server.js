'use strict';

require('dotenv').config();
var loopback = require('loopback');
var boot = require('loopback-boot');
var mutilpart = require('connect-multiparty');
var uploader = require('express-fileuploader');
var S3Strategy = require('express-fileuploader-s3');
var { awsConfig } = require('../config');
var bodyParser = require('body-parser');
var path = require('path');

var handlePayment = require('./scripts/payment.js').handlePayment;
var handleEmailSignup = require('./scripts/emailSignup.js').handleEmailSignup;
var handleReferral = require('./scripts/emailSignup.js').handleReferral;
var handleTrialRequest = require('./scripts/emailSignup.js').handleTrialRequest;

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

app.use(express.static(__dirname + '/client'));
app.get('*', function (request, response){
  response.sendFile(path.resolve(__dirname+'/client/index.html'))
});

app.post('/api/charge', handlePayment);
app.post('/api/email_signup', handleEmailSignup);
app.post('/api/referral', handleReferral);
app.post('/api/trial_request', handleTrialRequest);

// // WORKS
// app.post('/upload/images', function(req, res, next) {
//   uploader.upload('s3', req.files.file, function(err, files) {
//     if (err) {
//       return next(err);
//     }
//     res.send(JSON.stringify(files));
//   });
// });

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

// const options = {
//   method: 'POST',
//   uri: 'https://us7.api.mailchimp.com/3.0/lists/027913fec2/members',
//   auth: {
//     user: 'soundwise',
//     pass: '8ef33347b5ca183fa94a22e6b7302842-us7'
//   },
//   body: {
//     "email_address": "natasha@natashache.com",
//     "status": "subscribed",
//     "merge_fields": {
//         "FNAME": "Natasha",
//         "LNAME": "Che",
//         "MMERGE3": 116
//     }
//   },
//   json: true
// }

// request(options)
//   .then(function (res) {
//     console.log('mailchimp success: ')
//   })
//   .catch(function (err) {
//     console.log('mailchimp failed: ', err)
//   })

// some random comment to see if git updates
