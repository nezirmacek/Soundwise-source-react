'use strict';

// require('dotenv').config();
var express = require('express');
var loopback = require('loopback');
var boot = require('loopback-boot');
var multipart = require('connect-multiparty');
var uploader = require('express-fileuploader');
var S3Strategy = require('express-fileuploader-s3');
var AWS = require('aws-sdk');
var awsConfig = require('../config').awsConfig;
var S3 = require('aws-sdk').S3;
var bodyParser = require('body-parser');
var path = require('path');
var firebase = require('firebase-admin');
const proxy = require('http-proxy-middleware');
var serviceAccount = require('../serviceAccountKey');
// require('./fixing_scripts/fixCategories')();

var cors = require('cors');
var Axios = require('axios');
const moment = require('moment');
// var request = require('request');
const request = require('request-promise');

var serviceAccount = require('../serviceAccountKey');

const {
  handlePayment,
  handleRecurringPayment,
  updateCreditCard,
  retrieveCustomer,
  createUpdatePlans,
} = require('./scripts/payment.js');
const {
  createSubscription,
  renewSubscription,
  cancelSubscription,
} = require('./scripts/createPlatformCharges.js');
const {
  handleEmailSignup,
  handleReferral,
  handleTrialRequest,
} = require('./scripts/emailSignup.js');
const Emails = require('./scripts/sendEmails.js');

const { createFeed, requestFeed } = require('./scripts/feed.js');
const createAudioWaveVid = require('./scripts/soundwaveVideo').createAudioWaveVid;

const { sendInvite } = require('./scripts/invites');
const { audioProcessing, audioProcessingReplace } = require('./scripts/audioProcessing');

const parseFeed = require('./scripts/parseFeed.js').parseFeed;
const pushNotification = require('./scripts/messaging.js').pushNotification;
// var subscriptionRenewal = require('./scripts/handleSubscriptions.js').subscriptionRenewal;
const unsubscribe = require('./scripts/handleSubscriptions.js').unsubscribe;
const subscribe = require('./scripts/handleSubscriptions.js').subscribe;
const createStripeAccount = require('./scripts/createStripeAccounts.js').createStripeAccount;
const requestStripeDashboard = require('./scripts/requestStripeDashboard.js');
const { emailFromDemoRequest } = require('./scripts/emailFromDemoRequest.js');

var Raven = require('raven');
var database = require('../database');
const { getMailChimpLists } = require('./scripts/getMailChimpLists.js');
const { updateMailChimpSubscribers } = require('./scripts/updateMailChimpSubscribers.js');
const { addSubscriberMailChimp } = require('./scripts/addSubscriberMailChimp.js');


Raven.config(
  'https://3e599757be764afba4a6b4e1a77650c4:689753473d22444f97fa1603139ce946@sentry.io/256847'
).install();

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: 'https://soundwise-a8e6f.firebaseio.com',
});
var algoliaIndex = require('./bin/algoliaIndex.js').algoliaIndex;
var transferLikes = require('./bin/firebase-listeners.js').transferLikes;
var transferMessages = require('./bin/firebase-listeners.js').transferMessages;
var firebaseListeners = require('./bin/firebase-listeners.js').firebaseListeners;
const { userService } = require('./services');

var app = (module.exports = loopback());
app.start = function() {
  // start the web server
  var server = app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log(`Web server listening at: ${baseUrl}, env:${process.env.NODE_ENV}`);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
  // server.timeout = 10*60*1000; // 10 minutes
};

// console.log('key:', awsConfig.accessKeyId);
// console.log('secret:', awsConfig.secretAccessKey);

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

const prerender = require('prerender-node')
  .set('prerenderToken', 'XJx822Y4hyTUV1mn6z9k')
  .set('protocol', 'https')
  .blacklisted('/rss/');
prerender.crawlerUserAgents.push('googlebot');
prerender.crawlerUserAgents.push('bingbot');
prerender.crawlerUserAgents.push('yandex');
app.use(prerender);

AWS.config.update(awsConfig);
AWS.Request.prototype.forwardToExpress = function forwardToExpress(req, res, next) {
  this.on('httpHeaders', function(code, headers) {
    if (code < 300) {
      var total = headers['content-range'].split('/')[1];
      var parts = headers['content-range']
        .split('/')[0]
        .replace(/bytes /, '')
        .split('-');
      var partialstart = parts[0];
      var partialend = parts[1];

      var start = parseInt(partialstart);
      var end = partialend ? parseInt(partialend) : total;
      // var chunksize = (end - start);

      res.set('Content-Length', headers['content-length']);
      // res.set('Content-Length', total);
      res.set('Content-Range', 'bytes ' + start + '-' + end + '/' + total);
      res.set('Content-Type', headers['content-type']);
      res.set('Last-Modified', headers['last-modified']);
      // res.set('ETag', headers['etag']);
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', 0);
      res.set('Accept-Ranges', 'bytes');
      res.status(206);
      // console.log('headers: ', headers, 'code:', code, 'total:', total, 'bytes ' + start + '-' + end + '/' + total);
    }
  })
    .createReadStream()
    .on('error', next)
    /* .on('data', data => {
    res.write(data);
  })
  .on('end', () => {
   res.end();
  }); */
    .pipe(res);
};

AWS.Request.prototype.forwardToExpressNoStream = function forwardToExpressNoStream(res, next) {
  this.on('httpHeaders', function(code, headers) {
    if (code < 300) {
      res.set('Content-Length', headers['content-length']);
      res.set('Content-Type', headers['content-type']);
      res.set('Last-Modified', headers['last-modified']);
      res.set('ETag', headers['etag']);
    }
  })
    .createReadStream()
    .on('error', next)
    .pipe(res);
};

// use part
// app.post('/api/charge', handlePayment);
app.post('/api/create_stripe_account', createStripeAccount);
app.post('/api/requestStripeDashboard', requestStripeDashboard);
app.post('/api/recurring_charge', handleRecurringPayment);
app.post('/api/email_signup', handleEmailSignup);
app.post('/api/referral', handleReferral);
app.post('/api/trial_request', handleTrialRequest);

app.post('/api/create_feed', createFeed);
app.get('/rss/:id', requestFeed);
app.post('/api/parse_feed', parseFeed);
app.get('/api/retrieveCustomer', retrieveCustomer);
app.post('/api/updateCreditCard', updateCreditCard);
app.post('/api/createUpdatePlans', createUpdatePlans);
app.post('/api/buy', createSubscription);

app.post('/api/send_email_invites', Emails.sendTransactionalEmails); // this is for transactional emails;
app.post('/api/comment_notify', Emails.sendCommentNotification);
app.post('/api/send_marketing_emails', Emails.sendMarketingEmails);
app.post('/api/delete_emails', Emails.deleteFromEmailList);
app.post('/api/add_emails', Emails.addToEmailList);

app.post('/api/send_notification', pushNotification);
app.post('/api/subscription_renewal', renewSubscription);
app.post('/api/cancel_plan', cancelSubscription);
app.post('/api/unsubscribe', unsubscribe);
app.post('/api/subscribe', subscribe);
app.use('/api/upload', multipart());
app.post('/api/upload', function(req, res, next) {
  // console.log(req.files);
  uploader.use(
    new S3Strategy({
      uploadPath: 'soundcasts/',
      headers: {
        'x-amz-acl': 'public-read',
      },
      options: {
        key: awsConfig.accessKeyId,
        secret: awsConfig.secretAccessKey,
        bucket: 'soundwiseinc',
      },
    })
  );
  uploader.upload('s3', req.files.file, function(err, files) {
    if (err) {
      return next(err);
    }
    res.send(files);
  });
});
app.post('/api/audiowave', multipart(), createAudioWaveVid);
app.post('/api/audio_processing', audioProcessing);
app.post('/api/audio_processing_replace', audioProcessingReplace);
app.post('/api/invite', sendInvite);

app.post('/api/email_demo_request', emailFromDemoRequest);

app.use(
  '/s3',
  require('react-s3-uploader/s3router')({
    bucket: 'soundwiseinc',
    // region: 'us-east-1', // optional
    headers: { 'Access-Control-Allow-Origin': '*' }, // optional
    ACL: 'public-read',
    getFileKeyDir: function(req) {
      return 'soundcasts/';
    },
    uniquePrefix: false, // (4.0.2 and above) default is true, setting the attribute to false preserves the original filename in S3
  })
);

app.get('/api/custom_token', (req, res) => {
  firebase
    .auth()
    .createCustomToken(req.query.uid)
    .then(function(customToken) {
      // console.log('customToken: ', customToken);
      res.send({ customToken });
    })
    .catch(function(error) {
      console.log('Error creating custom token:', error);
      res.status(500).send(error);
    });
});

app.post('/api/mail_manage', getMailChimpLists);
app.post('/api/mail_manage_updateSubscribers', updateMailChimpSubscribers);
app.post('/api/mail_manage_addsubscriber', addSubscriberMailChimp);

app.use(
  '/tracks/:id',
  proxy({
    target: 'https://s3.amazonaws.com',
    pathRewrite: path => `/soundwiseinc/soundcasts/${path.split('/')[2]}`,
    changeOrigin: true,
  })
);

// database API routes:
require('../database/routes.js')(app);

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module) {
    // database.db.sync().then(() => {
    app.start();
    // });
  }
});

app.use(express.static('./client'));

app.all(/^\/(?!api|explorer|tracks)/, function(request, response) {
  // var domain = String(request.query.domain);
  // var host = request.get('host');
  // response.set('X-Frame-Options', 'ALLOW-FROM ' + String(host));
  // response.set('Content-Security-Policy', 'frame-src ' + String(host));
  response.sendFile(path.resolve('./client/index.html'));
});

app.use(function(err, req, res, next) {
  // error handler
  if (err) {
    if (
      err.hostname === 'soundwiseinc.s3.amazonaws.com' &&
      err.message === 'Connection timed out after 120000ms'
    ) {
      return res.end(); // ignore aws-sdk timeout error
    }
    console.log(err);
    return res.end(`Error ${err.message}`);
  }
  res.end();
});

app.post('/api/complete_sign_up', (req, res) => {
  userService
    .completeSignUp(req.body)
    .then(() => res.sendStatus(200))
    .catch(error => res.send(error));
});
