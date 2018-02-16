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
var S3S = require('s3-streams');
var bodyParser = require('body-parser');
var path = require('path');
var firebase = require('firebase-admin');
var serviceAccount = require('../serviceAccountKey.json');
var cors = require('cors');
const moment = require('moment');
var request = require('request');

var handlePayment = require('./scripts/payment.js').handlePayment;
var handleRecurringPayment = require('./scripts/payment.js').handleRecurringPayment;
var updateCreditCard = require('./scripts/payment.js').updateCreditCard;
var retrieveCustomer = require('./scripts/payment.js').retrieveCustomer;
var createSubscription = require('./scripts/createPlatformCharges.js').createSubscription;
var renewSubscription = require('./scripts/createPlatformCharges.js').renewSubscription;
var cancelSubscription = require('./scripts/createPlatformCharges.js').cancelSubscription;
var handleEmailSignup = require('./scripts/emailSignup.js').handleEmailSignup;
var handleReferral = require('./scripts/emailSignup.js').handleReferral;
var handleTrialRequest = require('./scripts/emailSignup.js').handleTrialRequest;
var Emails = require('./scripts/sendEmails.js');

var createFeed = require('./scripts/feed.js').createFeed;
var requestFeed = require('./scripts/feed.js').requestFeed;
var createAudioWaveVid = require('./scripts/soundwaveVideo').createAudioWaveVid;

var sendNotification = require('./scripts/messaging.js').sendNotification;
// var subscriptionRenewal = require('./scripts/handleSubscriptions.js').subscriptionRenewal;
var unsubscribe = require('./scripts/handleSubscriptions.js').unsubscribe;
var createStripeAccount = require('./scripts/createStripeAccounts.js').createStripeAccount;
var requestStripeDashboard = require('./scripts/requestStripeDashboard.js');
var Raven = require('raven');
var database = require('../database');

Raven.config('https://3e599757be764afba4a6b4e1a77650c4:689753473d22444f97fa1603139ce946@sentry.io/256847').install();

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://soundwise-a8e6f.firebaseio.com",
});

// sync firebase with Algolia
var algoliaIndex = require('./bin/algoliaIndex.js').algoliaIndex;
algoliaIndex();

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

app.use(cors());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.use(require('prerender-node').set('prerenderToken',
        'XJx822Y4hyTUV1mn6z9k').set('protocol', 'https'));

AWS.config.update(awsConfig);

uploader.use(new S3Strategy({
  uploadPath: 'soundcasts/',
  headers: {
    'x-amz-acl': 'public-read',
  },
  options: {
    key: awsConfig.accessKeyId,
    secret: awsConfig.secretAccessKey,
    bucket: 'soundwiseinc',
  },
}));

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
app.get('/api/retrieveCustomer', retrieveCustomer);
app.post('/api/updateCreditCard', updateCreditCard);
app.post('/api/buy', createSubscription);

app.post('/api/send_email_invites', Emails.sendTransactionalEmails); // this is for transactional emails;
app.post('/api/comment_notify', Emails.sendCommentNotification);
app.post('/api/send_marketing_emails', Emails.sendMarketingEmails);
app.post('/api/delete_emails', Emails.deleteFromEmailList);
app.post('/api/add_emails', Emails.addToEmailList);

app.post('/api/send_notification', sendNotification);
app.post('/api/subscription_renewal', renewSubscription);
app.post('/api/cancel_plan', cancelSubscription);
app.post('/api/unsubscribe', unsubscribe);
app.use('/api/upload', multipart());
app.post('/api/upload', function(req, res, next) {
  uploader.upload('s3', req.files.file, function(err, files) {
    if (err) {
      return next(err);
    }
    res.send(files);
  });
});
app.post('/api/upload/audiowave', multipart(), createAudioWaveVid);

app.use('/s3', require('react-s3-uploader/s3router')({
  bucket: 'soundwiseinc',
  // region: 'us-east-1', // optional
  headers: {'Access-Control-Allow-Origin': '*'}, // optional
  ACL: 'public-read',
  getFileKeyDir: function(req) {
      return 'soundcasts/';
  },
  uniquePrefix: false, // (4.0.2 and above) default is true, setting the attribute to false preserves the original filename in S3
}));

app.get('/api/custom_token', (req, res) => {
  // console.log(req);
  firebase.auth().createCustomToken(req.query.uid)
    .then(function(customToken) {
      // console.log('customToken: ', customToken);
      res.send({customToken});
    })
    .catch(function(error) {
      console.log("Error creating custom token:", error);
      res.status(500).send(error);
    });
});

app.get('/tracks/:id', (request, response) => {
  const path = String(request.path).slice(8);
  console.log('path: ', path);
  // response.redirect(200, `https://s3.amazonaws.com/soundwiseinc/soundcasts/${path}`);
  var src = S3S.ReadStream(new S3(), {
    Bucket: 'soundwiseinc',
    Key: `/soundcasts/${path}`,
  });
  src.pipe(response);
});

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
  var domain = String(request.query.domain);
  var host = request.get('host');
  // response.setHeader('X-Frame-Options', 'ALLOW-FROM ' + String(host));
  // response.setHeader('X-Frame-Options', 'SAMEORIGIN');
  // response.setHeader('Content-Security-Policy', 'frame-src ' + String(host));
	response.sendFile(path.resolve('./client/index.html'));
});

// var sgMail = require('@sendgrid/mail');
var sendGridApiKey = require('../config').sendGridApiKey;
// var emailTemplate = require('./scripts/helpers/emailTemplate').emailTemplate;
// var content = emailTemplate('Soundwise', '', '<p>Hi Natasha. This is a test.</p>');

// sgMail.setApiKey(sendGridApiKey);
//     var msg = {
//       to: 'natasha@natashache.com',
//       from: 'support@mysoundwise.com',
//       subject: 'Hello, Natasha!',
//       html: content,
//     };
//     sgMail.send(msg)
//     .then(res => console.log(res.toString()))
//     .catch(err => {
//       // Promise.reject(err);
//       console.log(err.toString());
//       Raven.captureException(err.toString());
//     });

// var stripe_key =  require('../config').stripe_key;
// var stripe = require('stripe')(stripe_key);

// stripe.transfers.create({
//   amount: 59,
//   currency: "usd",
//   destination: "acct_1Bdla1BEkT8zqJaI",
// }, function(err, transfer) {
//   // asynchronously called
//   if(err) console.log(err.toString());
//   console.log(transfer);
// });

const client = require('@sendgrid/client');
client.setApiKey(sendGridApiKey);
// let listId;
// const data1 = {
//   method: 'POST',
//   url: '/v3/contactdb/lists',
//   body: {'name': 'platform-listeners'},
// };
// // console.log('data1: ', data1);
// client.request(data1)
// .then(([response, body]) => {
//   listId = body.id;
//   console.log(listId);
// });
// const options = {
//   method: 'POST',
//   url: '/v3/contactdb/recipients',
//   body: [
//     {email: 'natasha@natashache.com'},
//   ],
// };
// client.request(options)
// .then(([response, body]) => {
//   console.log(response.statusCode);
//   console.log(response.body);
// });

// firebase.database().ref('users/K8R91q4BXpeY3sw2tB2bjMBvqOK2/soundcasts/1514431713134s')
// .set({
//   subscribed: true,
//   current_period_end: 4638902400,
//   date_subscribed: 1515181960
// });
