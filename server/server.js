"use strict";

// require('dotenv').config();
var express = require("express");
var loopback = require("loopback");
var boot = require("loopback-boot");
var multipart = require("connect-multiparty");
var uploader = require("express-fileuploader");
var S3Strategy = require("express-fileuploader-s3");
var AWS = require("aws-sdk");
var awsConfig = require("../config").awsConfig;
var S3 = require("aws-sdk").S3;
var bodyParser = require("body-parser");
var path = require("path");
var firebase = require("firebase-admin");
var serviceAccount = require("../serviceAccountKey.json");
var cors = require("cors");
const moment = require("moment");
// var request = require('request');
const request = require("request-promise");

const {
  handlePayment,
  handleRecurringPayment,
  updateCreditCard,
  retrieveCustomer,
  createUpdatePlans
} = require("./scripts/payment.js");
const {
  createSubscription,
  renewSubscription,
  cancelSubscription
} = require("./scripts/createPlatformCharges.js");
const {
  handleEmailSignup,
  handleReferral,
  handleTrialRequest
} = require("./scripts/emailSignup.js");
const Emails = require("./scripts/sendEmails.js");

const { createFeed, requestFeed } = require("./scripts/feed.js");
const createAudioWaveVid = require("./scripts/soundwaveVideo")
  .createAudioWaveVid;
const {
  audioProcessing,
  audioProcessingReplace
} = require("./scripts/audioProcessing");

const parseFeed = require("./scripts/parseFeed.js").parseFeed;
const sendNotification = require("./scripts/messaging.js").sendNotification;
// var subscriptionRenewal = require('./scripts/handleSubscriptions.js').subscriptionRenewal;
const unsubscribe = require("./scripts/handleSubscriptions.js").unsubscribe;
const createStripeAccount = require("./scripts/createStripeAccounts.js")
  .createStripeAccount;
const requestStripeDashboard = require("./scripts/requestStripeDashboard.js");
var Raven = require("raven");
var database = require("../database");

Raven.config(
  "https://3e599757be764afba4a6b4e1a77650c4:689753473d22444f97fa1603139ce946@sentry.io/256847"
).install();

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://soundwise-a8e6f.firebaseio.com"
});
var algoliaIndex = require("./bin/algoliaIndex.js").algoliaIndex;
var transferLikes = require("./bin/firebase-listeners.js").transferLikes;
var transferMessages = require("./bin/firebase-listeners.js").transferMessages;
var firebaseListeners = require("./bin/firebase-listeners.js")
  .firebaseListeners;

// sync firebase with Algolia and postgres
// algoliaIndex();
// transferLikes();
// transferMessages();
// firebaseListeners();


var app = (module.exports = loopback());
app.start = function() {
  // start the web server
  var server = app.listen(function() {
    app.emit("started");
    var baseUrl = app.get("url").replace(/\/$/, "");
    console.log("Web server listening at: %s", baseUrl);
    if (app.get("loopback-component-explorer")) {
      var explorerPath = app.get("loopback-component-explorer").mountPath;
      console.log("Browse your REST API at %s%s", baseUrl, explorerPath);
    }
  });
  // server.timeout = 10*60*1000; // 10 minutes
};

app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use(
  require("prerender-node")
    .set("prerenderToken", "XJx822Y4hyTUV1mn6z9k")
    .set("protocol", "https")
);

AWS.config.update(awsConfig);
AWS.Request.prototype.forwardToExpress = function forwardToExpress(
  req,
  res,
  next
) {
  this.on("httpHeaders", function(code, headers) {
    if (code < 300) {
      var total = headers["content-range"].split("/")[1];
      var parts = headers["content-range"]
        .split("/")[0]
        .replace(/bytes /, "")
        .split("-");
      var partialstart = parts[0];
      var partialend = parts[1];

      var start = parseInt(partialstart);
      var end = partialend ? parseInt(partialend) : total;
      //var chunksize = (end - start);

      res.set("Content-Length", headers["content-length"]);
      //res.set('Content-Length', total);
      res.set("Content-Range", "bytes " + start + "-" + end + "/" + total);
      res.set("Content-Type", headers["content-type"]);
      res.set("Last-Modified", headers["last-modified"]);
      //res.set('ETag', headers['etag']);
      res.set("Cache-Control", "no-cache, no-store, must-revalidate");
      res.set("Pragma", "no-cache");
      res.set("Expires", 0);
      res.set("Accept-Ranges", "bytes");
      res.status(206);
      // console.log('headers: ', headers, 'code:', code, 'total:', total, 'bytes ' + start + '-' + end + '/' + total);
    }
  })
    .createReadStream()
    .on("error", next)
    /*.on('data', data => {
    res.write(data);
  })
  .on('end', () => {
   res.end();
  });*/
    .pipe(res);
};
AWS.Request.prototype.forwardToExpressNoStream = function forwardToExpressNoStream(
  res,
  next
) {
  this.on("httpHeaders", function(code, headers) {
    if (code < 300) {
      res.set("Content-Length", headers["content-length"]);
      res.set("Content-Type", headers["content-type"]);
      res.set("Last-Modified", headers["last-modified"]);
      res.set("ETag", headers["etag"]);
    }
  })
    .createReadStream()
    .on("error", next)
    .pipe(res);
};

// use part
// app.post('/api/charge', handlePayment);
app.post("/api/create_stripe_account", createStripeAccount);
app.post("/api/requestStripeDashboard", requestStripeDashboard);
app.post("/api/recurring_charge", handleRecurringPayment);
app.post("/api/email_signup", handleEmailSignup);
app.post("/api/referral", handleReferral);
app.post("/api/trial_request", handleTrialRequest);

app.post("/api/create_feed", createFeed);
app.get("/rss/:id", requestFeed);
app.post("/api/parse_feed", parseFeed);
app.get("/api/retrieveCustomer", retrieveCustomer);
app.post("/api/updateCreditCard", updateCreditCard);
app.post("/api/createUpdatePlans", createUpdatePlans);
app.post("/api/buy", createSubscription);

app.post("/api/send_email_invites", Emails.sendTransactionalEmails); // this is for transactional emails;
app.post("/api/comment_notify", Emails.sendCommentNotification);
app.post("/api/send_marketing_emails", Emails.sendMarketingEmails);
app.post("/api/delete_emails", Emails.deleteFromEmailList);
app.post("/api/add_emails", Emails.addToEmailList);

app.post("/api/send_notification", sendNotification);
app.post("/api/subscription_renewal", renewSubscription);
app.post("/api/cancel_plan", cancelSubscription);
app.post("/api/unsubscribe", unsubscribe);
app.use("/api/upload", multipart());
app.post("/api/upload", function(req, res, next) {
  uploader.use(
    new S3Strategy({
      uploadPath: "soundcasts/",
      headers: {
        "x-amz-acl": "public-read"
      },
      options: {
        key: awsConfig.accessKeyId,
        secret: awsConfig.secretAccessKey,
        bucket: "soundwiseinc"
      }
    })
  );
  uploader.upload("s3", req.files.file, function(err, files) {
    if (err) {
      return next(err);
    }
    res.send(files);
  });
});
app.post("/api/audiowave", multipart(), createAudioWaveVid);
app.post("/api/audio_processing", audioProcessing);
app.post("/api/audio_processing_replace", audioProcessingReplace);

app.use(
  "/s3",
  require("react-s3-uploader/s3router")({
    bucket: "soundwiseinc",
    // region: 'us-east-1', // optional
    headers: { "Access-Control-Allow-Origin": "*" }, // optional
    ACL: "public-read",
    getFileKeyDir: function(req) {
      return "soundcasts/";
    },
    uniquePrefix: false // (4.0.2 and above) default is true, setting the attribute to false preserves the original filename in S3
  })
);

app.get("/api/custom_token", (req, res) => {
  // console.log(req);
  firebase
    .auth()
    .createCustomToken(req.query.uid)
    .then(function(customToken) {
      // console.log('customToken: ', customToken);
      res.send({ customToken });
    })
    .catch(function(error) {
      console.log("Error creating custom token:", error);
      res.status(500).send(error);
    });
});

app.get("/tracks/:id", (request, response, next) => {
  const path = String(request.path).slice(8);
  const s3 = new S3();
  // console.log('mp3 request header: ', request.headers);
  var Range;
  var parts = [0, 100 * 1024]; // defa
  var range = request.headers["range"]
    ? request.headers["range"].split("bytes=")[1]
    : null;
  // console.log('range: ', range);
  if (range) {
    parts = range.split("-");
    if (!parseInt(parts[1]) || parseInt(parts[1]) < parseInt(parts[0])) {
      parts[1] = parseInt(parts[0]) + 100 * 1024;
    }
    Range = "bytes=" + parts[0] + "-" + parts[1];
    s3.getObject({
      Bucket: "soundwiseinc",
      Key: `soundcasts/${path}`,
      Range
    }).forwardToExpress(request, response, next);
  } else {
    s3.getObject({
      Bucket: "soundwiseinc",
      Key: `soundcasts/${path}`
    }).forwardToExpressNoStream(response, next);
  }
});

// database API routes:
require("../database/routes.js")(app);

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

// app.use(express.static('./client'));

// app.use(/^\/(?!api|explorer|tracks)/, function(request, response) {
//   // var domain = String(request.query.domain);
//   var host = request.get('host');
//   console.log("here")
//   response.set('X-Frame-Options', "ALLOW-FROM "+ request.hostname);
//   // response.set('Content-Security-Policy', 'frame-src ' + String(host));
//   // next();
// 	response.sendFile(path.resolve('./client/index.html'));
// });

app.use(express.static("./client"));

app.all(/^\/(?!api|explorer|tracks)/, function(request, response) {
  // var domain = String(request.query.domain);
  // var host = request.get('host');
  // response.set('X-Frame-Options', 'ALLOW-FROM ' + String(host));
  // response.set('Content-Security-Policy', 'frame-src ' + String(host));
  response.sendFile(path.resolve("./client/index.html"));
});

app.use(function(err, req, res, next) {
  // error handler
  if (err) {
    if (
      err.hostname === "soundwiseinc.s3.amazonaws.com" &&
      err.message === "Connection timed out after 120000ms"
    ) {
      return res.end(); // ignore aws-sdk timeout error
    }
    console.log(err);
    return res.end(`Error ${err.message}`);
  }
  res.end();
});

// var sgMail = require('@sendgrid/mail');
var sendGridApiKey = require("../config").sendGridApiKey;
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

const client = require("@sendgrid/client");
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

// const changeUrl = async () => {
//   const episodes = await firebase.database().ref('soundcasts/1508293913676s/episodes').once('value');
//   const episodesArr = Object.keys(episodes.val());
//   for(var i = 0; i < episodesArr.length; i++) {
//     // await firebase.database().ref(`episodes/${episodesArr[i]}/url`).set(`https://mysoundwise.com/tracks/${episodesArr[i]}.mp3`);
//     // console.log('episode: ', episodesArr[i], ' url changed');
//     await firebase.database().ref(`episodes/${episodesArr[i]}/id3Tagged`).set(false);
//     console.log('episode: ', episodesArr[i], ' untagged')
//   }
// }
// changeUrl();


